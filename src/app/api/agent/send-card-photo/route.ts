import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAgentRequest } from "@/lib/agent-auth";
import { AGENT_ID, WA_PHONE_NUMBER_ID, xiFetch } from "@/lib/elevenlabs";

/**
 * Sends one of the preset card photos into the customer's WhatsApp chat via
 * the ElevenLabs outbound-message API (template `card_photo`, image header).
 * Called as a Yara agent tool. whatsapp_user_id is platform-filled from
 * system__caller_id; sender/agent ids come as tool constants so the staging
 * agent sends from the staging number and the live agent from the live one.
 */

const TEMPLATE_NAME = "card_photo";
const TEMPLATE_LANGUAGE = "en";

const PHOTO_URLS: Record<string, string> = {
  comparison:
    "https://laseryard.com/images/cards/thickness-comparison.jpg",
  "04mm": "https://laseryard.com/images/cards/card-04mm.jpg",
  "08mm": "https://laseryard.com/images/cards/card-08mm.jpg",
};

// Sender/agent pairs the endpoint will relay for; anything else is rejected.
const ALLOWED_SENDERS: Record<string, string[]> = {
  // live +1 415
  "1230436656818243": ["agent_4601kkf597f6ecaby27xxedbkk6r"],
  // staging +228
  "1024784710715053": [
    "agent_2401kxx3zb77fzvrf0t0vt1hm7yz",
    "agent_4601kkf597f6ecaby27xxedbkk6r",
  ],
};

const CONTINUE_NOTE =
  "Continue the conversation normally in text; the photo arrives as its own message.";
const FAIL_NOTE =
  "Photo could not be sent. Continue in words and do not mention the failure.";

export async function POST(request: NextRequest) {
  if (!isAuthorizedAgentRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const whatsappUserId = body?.whatsapp_user_id;
    const photo = body?.photo;
    const senderId = body?.whatsapp_phone_number_id || WA_PHONE_NUMBER_ID;
    const agentId = body?.agent_id || AGENT_ID;

    if (!whatsappUserId || typeof whatsappUserId !== "string") {
      return NextResponse.json(
        { error: "whatsapp_user_id is required" },
        { status: 400 }
      );
    }
    const link = PHOTO_URLS[photo];
    if (!link) {
      return NextResponse.json(
        { error: `photo must be one of: ${Object.keys(PHOTO_URLS).join(", ")}` },
        { status: 400 }
      );
    }
    if (!ALLOWED_SENDERS[senderId]?.includes(agentId)) {
      return NextResponse.json(
        { error: "Unknown sender/agent pair" },
        { status: 400 }
      );
    }

    const res = await xiFetch("/whatsapp/outbound-message", {
      method: "POST",
      body: JSON.stringify({
        whatsapp_phone_number_id: senderId,
        whatsapp_user_id: whatsappUserId,
        agent_id: agentId,
        template_name: TEMPLATE_NAME,
        template_language_code: TEMPLATE_LANGUAGE,
        template_params: [
          {
            type: "header",
            parameters: [{ type: "image", image: { link } }],
          },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("send-card-photo upstream error:", res.status, detail);
      return NextResponse.json({ sent: false, note: FAIL_NOTE }, { status: 200 });
    }

    return NextResponse.json({ sent: true, photo, note: CONTINUE_NOTE });
  } catch (e) {
    console.error("send-card-photo error:", e);
    return NextResponse.json({ sent: false, note: FAIL_NOTE }, { status: 200 });
  }
}
