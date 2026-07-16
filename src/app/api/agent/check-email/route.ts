import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAgentRequest } from "@/lib/agent-auth";
import {
  getRecentEmailsForCustomer,
  formatEmailsContext,
} from "@/lib/customer-emails";
import { getCustomerMemory } from "@/lib/customer-memory";

/**
 * Email-activity check for the Yara ElevenLabs agent: "did this client's
 * design email arrive?" The whatsapp_user_id parameter is platform-filled
 * from system__caller_id.
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

    const senderEmail =
      typeof body?.sender_email === "string" ? body.sender_email : null;
    const memory = await getCustomerMemory(whatsappUserId).catch(() => null);
    const emails = await getRecentEmailsForCustomer(
      whatsappUserId,
      5,
      memory?.email,
      senderEmail
    );
    if (!emails.length) {
      return NextResponse.json({
        found: false,
        summary:
          "No email from this client has arrived yet. If they say they sent it, ask them to double-check the address (sales@laseryard.com) and mention it can take a couple of minutes to come through.",
      });
    }

    return NextResponse.json({
      found: true,
      emails: formatEmailsContext(emails),
      summary: `Their most recent email arrived ${new Date(emails[0].receivedAt).toLocaleString("en-GB")}${emails[0].hasAttachments ? " with attachments" : " (no attachments)"}. Confirm receipt and move the conversation forward.`,
    });
  } catch (e) {
    console.error("Check email error:", e);
    return NextResponse.json(
      {
        found: false,
        summary: "Email lookup unavailable right now. Tell them the team will confirm receipt shortly.",
      },
      { status: 200 }
    );
  }
}
