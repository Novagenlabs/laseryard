import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { upsertCustomerMemory } from "@/lib/customer-memory";

/**
 * ElevenLabs post-call webhook: sends a follow-up email after conversations
 * where the customer shared their email address.
 *
 * The agent's data-collection config extracts customer_email / customer_name /
 * purchased from the transcript after each call. Purchasers are skipped here —
 * they already get an order confirmation email from the payment path.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = "Yara at Laseryard <yara@updates.laseryard.com>";
const FOLLOW_UP_DELAY_MIN = 45;

function verifySignature(body: string, header: string, secret: string): boolean {
  // Header format: t=<unix_ts>,v0=<hex hmac-sha256 of "<t>.<body>">
  const parts = Object.fromEntries(
    header.split(",").map((p) => p.split("=", 2) as [string, string])
  );
  const t = parts["t"];
  const v0 = parts["v0"];
  if (!t || !v0) return false;
  // Reject events older than 30 minutes to limit replay.
  if (Math.abs(Date.now() / 1000 - Number(t)) > 30 * 60) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(v0);
  return a.length === b.length && timingSafeEqual(a, b);
}

type DataCollectionResults = Record<
  string,
  { value?: unknown } | null | undefined
>;

function collected(results: DataCollectionResults, key: string): unknown {
  const entry = results[key];
  return entry && typeof entry === "object" ? entry.value : undefined;
}

export async function POST(request: NextRequest) {
  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET;
  if (!secret) {
    console.error("ELEVENLABS_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("elevenlabs-signature");
  if (!signature || !verifySignature(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(body);
    if (event.type !== "post_call_transcription") {
      return NextResponse.json({ received: true });
    }

    const conversationId: string = event.data?.conversation_id || "unknown";
    const results: DataCollectionResults =
      event.data?.analysis?.data_collection_results || {};

    const email = collected(results, "customer_email");
    const name = collected(results, "customer_name");
    const purchased = collected(results, "purchased");

    // Memory write path: store the conversation summary keyed by the
    // customer's WhatsApp ID, independent of whether a follow-up goes out.
    try {
      const whatsappUserId =
        event.data?.metadata?.whatsapp?.whatsapp_user_id ||
        event.data?.conversation_initiation_client_data?.dynamic_variables?.[
          "system__caller_id"
        ];
      const summary = event.data?.analysis?.transcript_summary;
      if (whatsappUserId && typeof whatsappUserId === "string") {
        await upsertCustomerMemory({
          whatsappUserId,
          customerName: typeof name === "string" ? name : undefined,
          email: typeof email === "string" ? email : undefined,
          conversationId,
          summary: typeof summary === "string" ? summary : undefined,
        });
      }
    } catch (e) {
      console.error("Customer memory write failed:", e);
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ received: true, followup: "no_email" });
    }
    if (purchased === true) {
      // They get the order confirmation email from the payment path instead.
      return NextResponse.json({ received: true, followup: "purchased" });
    }
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not set; skipping follow-up");
      return NextResponse.json({ received: true, followup: "skipped" });
    }

    const firstName =
      typeof name === "string" && name.trim() ? name.trim().split(" ")[0] : null;
    const scheduledAt = new Date(
      Date.now() + FOLLOW_UP_DELAY_MIN * 60 * 1000
    ).toISOString();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        // One follow-up per conversation, even across webhook retries.
        "Idempotency-Key": `followup-${conversationId}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: email,
        subject: "Your metal cards, whenever you're ready",
        scheduled_at: scheduledAt,
        html: `
          <div style="font-family:sans-serif;font-size:15px;color:#222;max-width:520px;">
            <p>Hey${firstName ? ` ${firstName}` : ""}, good chatting with you today.</p>
            <p>If you want to see your design on an actual metal card before deciding, try our Design Studio — upload a logo and preview it in seconds:<br/>
              <a href="https://laseryard.com/unforgettable" style="color:#0a67ff;">laseryard.com/unforgettable</a></p>
            <p>Any questions, just reply to this email or message us on WhatsApp.</p>
            <p style="margin-top:24px;font-size:12px;color:#999;">Yara — Laseryard, laseryard.com</p>
          </div>
        `,
      }),
    });
    if (!res.ok) {
      console.error("Follow-up email error:", await res.text());
    }

    return NextResponse.json({ received: true, followup: "scheduled" });
  } catch (e) {
    console.error("ElevenLabs webhook processing error:", e);
    // 200 so ElevenLabs doesn't retry a poison payload forever.
    return NextResponse.json({ received: true });
  }
}
