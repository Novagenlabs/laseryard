import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAgentRequest } from "@/lib/agent-auth";
import { AGENT_ID, WA_PHONE_NUMBER_ID } from "@/lib/elevenlabs";
import {
  getQuestion,
  isTeamNumber,
  markAnswered,
  normalizeWhatsappNumber,
  openQuestions,
  sendAnswerToCustomer,
} from "@/lib/bridge";

/**
 * Yara agent tool (staff mode): relay a team member's answer to the customer.
 * Only accepted when the CALLER is a team number and an open question exists —
 * a customer can never trigger a relay, no matter what they claim in chat.
 *
 * Delivery truth: "relayed" is only reported when the outbound send succeeded;
 * otherwise the answer is stored and delivered the next time the customer
 * messages (bridge-questions pull path), and the note says exactly that.
 */

export async function POST(request: NextRequest) {
  if (!isAuthorizedAgentRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    // team_member_number is the current name; whatsapp_user_id kept as an
    // alias for older tool schemas. The LLM has confused this with the
    // CLIENT's number before — the rejection note below teaches the fix.
    const caller = normalizeWhatsappNumber(
      body?.team_member_number ?? body?.whatsapp_user_id
    );
    const answer = typeof body?.answer === "string" ? body.answer.trim() : "";
    const customerMessage =
      typeof body?.customer_message === "string" ? body.customer_message.trim() : "";
    // LLMs pass "3", 3, or "Q#3" — keep the digits only.
    const questionId = Number.parseInt(
      String(body?.question_id ?? "").replace(/\D/g, ""),
      10
    );

    if (!caller || !isTeamNumber(caller)) {
      return NextResponse.json(
        {
          relayed: false,
          saved: false,
          note:
            "NOTHING was sent or saved: team_member_number is not one of our staff numbers. " +
            "You likely passed the CLIENT's number by mistake. If you are talking to a team member, " +
            "call relay_answer again with team_member_number = the digits of system__caller_id from THIS " +
            "conversation (the staff member's own number), never the client's. Do NOT tell them it was saved.",
        },
        { status: 200 }
      );
    }
    if (!answer || !customerMessage) {
      return NextResponse.json(
        { error: "answer and customer_message are required" },
        { status: 400 }
      );
    }

    // Resolve the question: explicit id, else the only/oldest open one.
    let q = Number.isFinite(questionId) ? await getQuestion(questionId) : null;
    if (q && q.status !== "open") {
      return NextResponse.json({
        relayed: false,
        note: `Q#${q.id} was already ${q.status}. Tell the team member, and check open questions before relaying again.`,
      });
    }
    if (!q) {
      const open = await openQuestions();
      if (open.length === 0) {
        return NextResponse.json({
          relayed: false,
          note: "There are no open customer questions right now — nothing to relay. Tell the team member.",
        });
      }
      if (open.length > 1 && !Number.isFinite(questionId)) {
        return NextResponse.json({
          relayed: false,
          note: `There are ${open.length} open questions — ask the team member which one this answers (${open
            .map((o) => `Q#${o.id}: ${o.question.slice(0, 60)}`)
            .join(" | ")}), then relay with that question_id.`,
        });
      }
      q = open[0];
    }

    const senderId = q.senderPhoneNumberId || body?.whatsapp_phone_number_id || WA_PHONE_NUMBER_ID;
    const agentId = q.agentId || body?.agent_id || AGENT_ID;

    const pushed = await sendAnswerToCustomer({
      senderId,
      agentId,
      customerNumber: q.customerNumber,
      customerMessage,
    });

    await markAnswered({
      id: q.id,
      answer,
      customerMessage,
      answeredBy: caller,
      delivered: pushed,
    });

    return NextResponse.json({
      relayed: pushed,
      saved: true,
      question_ref: `Q#${q.id}`,
      customer: q.customerNumber,
      note: pushed
        ? `Delivered to ${q.customerNumber}. Confirm to the team member that the customer has the answer.`
        : `Could not push the message right now — the answer is SAVED and the customer will get it the moment they next write to us. Tell the team member exactly that (saved, not sent).`,
    });
  } catch (e) {
    console.error("relay-answer error:", e);
    return NextResponse.json(
      { relayed: false, saved: false, note: "Relay failed — the answer was NOT saved. Ask the team member to try once more in a minute." },
      { status: 200 }
    );
  }
}
