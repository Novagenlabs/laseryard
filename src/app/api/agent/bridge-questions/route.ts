import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAgentRequest } from "@/lib/agent-auth";
import {
  isTeamNumber,
  markDelivered,
  normalizeWhatsappNumber,
  openQuestions,
  questionsForCustomer,
} from "@/lib/bridge";

/**
 * Yara agent tool: check bridge questions. Role is decided server-side from
 * the caller's number (platform-filled from system__caller_id):
 *
 * - Team member → the list of open customer questions (the server-sent ping
 *   never appears in the agent's own conversation history, so this is how
 *   staff-mode Yara learns what an answer refers to).
 * - Customer → the status of their own recent questions. Any answered-but-
 *   undelivered answer is returned for Yara to deliver in-conversation and
 *   marked delivered (pull-mode fallback when the push template failed).
 */

function ageMinutes(createdAt: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(createdAt).getTime()) / 60000));
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedAgentRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const caller = normalizeWhatsappNumber(body?.whatsapp_user_id);
    if (!caller) {
      return NextResponse.json(
        { role: "unknown", note: "Caller number unavailable — continue the conversation normally." },
        { status: 200 }
      );
    }

    if (isTeamNumber(caller)) {
      const open = await openQuestions();
      return NextResponse.json({
        role: "team",
        open_questions: open.map((q) => ({
          ref: `Q#${q.id}`,
          question_id: q.id,
          customer: q.customerNumber,
          question: q.question,
          context: q.context,
          age_minutes: ageMinutes(q.createdAt),
        })),
        note: open.length
          ? "This caller is a team member. If their message answers one of these questions, call relay_answer with that question_id and a warm customer-facing message. If it doesn't, just help them normally."
          : "This caller is a team member and there are no open customer questions. Do not treat their message as an answer — respond normally.",
      });
    }

    const mine = await questionsForCustomer(caller);
    const undelivered = mine.filter(
      (q) => q.status === "answered" && !q.delivered && q.customerMessage
    );
    if (undelivered.length) {
      await markDelivered(undelivered.map((q) => q.id));
    }
    return NextResponse.json({
      role: "customer",
      questions: mine.map((q) => ({
        ref: `Q#${q.id}`,
        question: q.question,
        status: q.status === "open" ? "waiting_on_team" : q.status,
        answer_for_customer:
          q.status === "answered" && q.customerMessage ? q.customerMessage : null,
      })),
      note: undelivered.length
        ? "The team has answered — weave answer_for_customer into your reply naturally, as your own words."
        : mine.some((q) => q.status === "open")
          ? "Still waiting on the team. Reassure the customer the answer will arrive right here — do not invent one and do not re-escalate."
          : "No bridge questions for this customer.",
    });
  } catch (e) {
    console.error("bridge-questions error:", e);
    return NextResponse.json(
      { role: "unknown", note: "Bridge status unavailable — continue normally without mentioning any system issue." },
      { status: 200 }
    );
  }
}
