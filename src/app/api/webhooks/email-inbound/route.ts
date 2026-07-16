import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { recordInboundEmail } from "@/lib/customer-emails";

/**
 * Resend Inbound webhook: receives emails forwarded from
 * hello@laseryard.com, records them, matches them to WhatsApp customers,
 * and sends a safe in-thread acknowledgment when a known customer sends
 * attachments (their design files).
 *
 * Signature: svix format — HMAC-SHA256(base64) of "{id}.{timestamp}.{body}"
 * with the whsec_ secret, compared against the svix-signature header.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// e.g. "Laseryard <hello@laseryard.com>" — requires laseryard.com verified
// in Resend. Unset = acknowledgments disabled (everything else still works).
const REPLY_FROM = process.env.EMAIL_REPLY_FROM;
const TEAM_INBOX = "hello@laseryard.com";

function verifySvix(body: string, headers: Headers, secret: string): boolean {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const sigHeader = headers.get("svix-signature");
  if (!id || !timestamp || !sigHeader) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 5 * 60) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");

  // Header may contain multiple space-separated "v1,<sig>" entries.
  return sigHeader.split(" ").some((part) => {
    const sig = part.split(",")[1];
    if (!sig) return false;
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_INBOUND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RESEND_INBOUND_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const body = await request.text();
  if (!verifySvix(body, request.headers, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(body);
    if (!String(event.type || "").includes("email.received")) {
      return NextResponse.json({ received: true });
    }

    const data = event.data || {};
    const fromAddress: string =
      (Array.isArray(data.from) ? data.from[0]?.address : null) ||
      data.from?.address ||
      (typeof data.from === "string" ? data.from : "") ||
      "";
    if (!fromAddress.includes("@")) {
      return NextResponse.json({ received: true });
    }

    // Ignore our own forwarded/auto mail to avoid loops.
    const lower = fromAddress.toLowerCase();
    if (lower.includes("laseryard.com") || lower.includes("resend.")) {
      return NextResponse.json({ received: true, skipped: "own_domain" });
    }

    const subject: string = data.subject || "";
    const text: string = data.text || "";
    const attachments = data.attachments || [];
    const messageId: string | null =
      data.message_id || data.headers?.["message-id"] || null;

    const { whatsappUserId } = await recordInboundEmail({
      fromAddress,
      subject,
      snippet: text,
      hasAttachments: attachments.length > 0,
      messageId,
    });

    // Safe, narrow auto-acknowledgment: known customer + attachments.
    if (REPLY_FROM && RESEND_API_KEY && whatsappUserId && attachments.length > 0) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `email-ack-${messageId || `${fromAddress}-${subject}`}`,
        },
        body: JSON.stringify({
          from: REPLY_FROM,
          to: fromAddress,
          subject: subject ? `Re: ${subject}` : "Got your design files",
          ...(messageId
            ? { headers: { "In-Reply-To": messageId, References: messageId } }
            : {}),
          html: `
            <div style="font-family:sans-serif;font-size:15px;color:#222;max-width:520px;">
              <p>Got your files — thanks! The design team is on it.</p>
              <p>If you haven't placed your order yet, just reply here or message us on WhatsApp and we'll get you a checkout link.</p>
              <p style="margin-top:24px;font-size:12px;color:#999;">Laseryard — laseryard.com</p>
            </div>
          `,
        }),
      }).catch((e) => console.error("Ack email failed:", e));
    }

    return NextResponse.json({
      received: true,
      matched: !!whatsappUserId,
      acked: !!(REPLY_FROM && whatsappUserId && attachments.length > 0),
    });
  } catch (e) {
    console.error("Inbound email processing error:", e);
    return NextResponse.json({ received: true });
  }
}
