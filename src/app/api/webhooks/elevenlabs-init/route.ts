import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAgentRequest } from "@/lib/agent-auth";
import {
  getCustomerMemory,
  formatCustomerContext,
} from "@/lib/customer-memory";
import {
  getRecentEmailsForCustomer,
  formatEmailsContext,
} from "@/lib/customer-emails";

/**
 * ElevenLabs conversation-initiation webhook: called when a conversation
 * starts, before the agent's first turn. We return a customer_context
 * dynamic variable built from stored memory so Yara recognizes returning
 * clients immediately — no tool call needed.
 *
 * Must stay fast (single indexed lookup) and must never fail the
 * conversation: any error returns an empty context.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorizedAgentRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let customerContext = "";
  try {
    const body = await request.json();
    const callerId = body?.caller_id;
    if (callerId && typeof callerId === "string") {
      const memory = await getCustomerMemory(callerId);
      const emails = await getRecentEmailsForCustomer(
        callerId,
        5,
        memory?.email
      ).catch(() => []);
      customerContext = [
        formatCustomerContext(memory),
        formatEmailsContext(emails),
      ]
        .filter(Boolean)
        .join("\n\n");
    }
  } catch (e) {
    console.error("Initiation webhook error (returning empty context):", e);
  }

  return NextResponse.json({
    type: "conversation_initiation_client_data",
    dynamic_variables: {
      customer_context: customerContext,
    },
  });
}
