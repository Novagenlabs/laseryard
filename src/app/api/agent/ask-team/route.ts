import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAgentRequest } from "@/lib/agent-auth";
import { AGENT_ID, WA_PHONE_NUMBER_ID } from "@/lib/elevenlabs";
import {
  createQuestion,
  findOpenQuestionForCustomer,
  isTeamNumber,
  normalizeWhatsappNumber,
  runPingRound,
} from "@/lib/bridge";

/**
 * Yara agent tool: escalate a customer question to the human team.
 * Stores the question and pings the team's WhatsApp from the business number.
 * whatsapp_user_id is platform-filled from system__caller_id; sender/agent
 * ids come as tool constants (staging sends from the staging number).
 *
 * Never fails the conversation: if the ping can't be sent (template not
 * approved yet, Meta hiccup) the question is still stored — it stays visible
 * in the admin console and the team can answer late.
 */

const HOLD_NOTE =
  "Tell the customer you've passed their question to the team and the answer will arrive right here in this chat. Do NOT invent an answer or promise a timeframe.";

export async function POST(request: NextRequest) {
  if (!isAuthorizedAgentRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const customerNumber = normalizeWhatsappNumber(body?.whatsapp_user_id);
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    const context =
      typeof body?.context === "string" && body.context.trim()
        ? body.context.trim()
        : null;
    const senderId = body?.whatsapp_phone_number_id || WA_PHONE_NUMBER_ID;
    const agentId = body?.agent_id || AGENT_ID;

    if (!customerNumber) {
      return NextResponse.json(
        { logged: false, note: "Could not identify this customer's WhatsApp number. Apologize briefly and offer hello@laseryard.com instead." },
        { status: 200 }
      );
    }
    if (!question) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 }
      );
    }
    if (isTeamNumber(customerNumber)) {
      return NextResponse.json(
        { logged: false, note: "This caller IS a team member — do not escalate their messages. Answer them directly." },
        { status: 200 }
      );
    }

    const existing = await findOpenQuestionForCustomer(customerNumber);
    if (existing) {
      // Don't stack duplicate questions — but an open question must not
      // silently suppress notifications (a customer once waited 10h behind an
      // eaten ping). Re-ping when no notification round has ever landed, or
      // the last round was over 30 minutes ago.
      const lastPingMs = existing.lastPingAt
        ? new Date(existing.lastPingAt).getTime()
        : new Date(existing.createdAt).getTime();
      const minutesSincePing = (Date.now() - lastPingMs) / 60000;
      if (existing.pingCount === 0 || minutesSincePing > 30) {
        void runPingRound(existing, "reminder").catch((e) =>
          console.error("ask-team re-ping failed:", e)
        );
      }
      return NextResponse.json({
        logged: true,
        question_ref: `Q#${existing.id}`,
        already_pending: true,
        note: "A question from this customer is already with the team — reassure them the team will reply here, and do not re-escalate.",
      });
    }

    const q = await createQuestion({
      customerNumber,
      question,
      context,
      senderPhoneNumberId: senderId,
      agentId,
    });

    // Fire-and-forget: template sends are slow enough to trip the proxy
    // timeout (the tool saw a 504 while the ping still completed). The
    // question is already stored — the console's ping flag shows the truth.
    // Dokploy runs a persistent `next start`, so the detached promise
    // completes reliably after the response.
    //
    // The round pings WhatsApp (through the +228 line by default — Meta
    // silently drops +1 415 templates to the team number) AND emails the
    // studio inbox; the background sweeper re-runs rounds for questions that
    // stay open. The relay back to the customer still goes out from the
    // customer's own line (stored on the question row).
    void runPingRound(q, "new").catch((e) =>
      console.error("ask-team ping send failed:", e)
    );

    return NextResponse.json({
      logged: true,
      question_ref: `Q#${q.id}`,
      note: HOLD_NOTE,
    });
  } catch (e) {
    console.error("ask-team error:", e);
    return NextResponse.json(
      {
        logged: false,
        note: "Escalation is unavailable right now. Take their question, say the team will follow up here, and suggest hello@laseryard.com for anything urgent.",
      },
      { status: 200 }
    );
  }
}
