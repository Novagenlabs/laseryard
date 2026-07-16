import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAgentRequest } from "@/lib/agent-auth";
import {
  getCustomerMemory,
  formatCustomerContext,
} from "@/lib/customer-memory";

/**
 * Customer recall for the Yara ElevenLabs agent (tool fallback for the
 * initiation webhook). The whatsapp_user_id parameter is platform-filled
 * from system__caller_id, not chosen by the LLM.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorizedAgentRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const whatsappUserId = body?.whatsapp_user_id;

    if (!whatsappUserId || typeof whatsappUserId !== "string") {
      return NextResponse.json(
        { error: "whatsapp_user_id is required" },
        { status: 400 }
      );
    }

    const memory = await getCustomerMemory(whatsappUserId);
    const context = formatCustomerContext(memory);

    return NextResponse.json({
      found: context.length > 0,
      customer_context:
        context ||
        "No previous conversations on record. Treat them as a new client.",
    });
  } catch (e) {
    console.error("Recall customer error:", e);
    return NextResponse.json(
      { found: false, customer_context: "Lookup unavailable. Treat them as a new client." },
      { status: 200 }
    );
  }
}
