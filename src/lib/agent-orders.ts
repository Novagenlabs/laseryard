import { createHash } from "node:crypto";
import { createOrder, getOrderWithEvents, Order } from "@/lib/orders";
import {
  renderBrandedEmail,
  resolveEmailRecipient,
  ccFor,
} from "@/lib/email-template";
import { setOrderCustomerEmail } from "@/lib/order-notifications";

/**
 * Order creation from verified Whop payments (v2 confirmation signal).
 *
 * Every agent-generated checkout carries a unique checkout_ref in its Whop
 * metadata. The tracking number is derived deterministically from that ref,
 * so the payment webhook and the agent's confirm_payment tool converge on
 * the same order no matter which runs first — no double-creation, no
 * migration for an idempotency column.
 */

// Same unambiguous charset as generateTrackingNumber in lib/orders.ts.
const TRACKING_CHARSET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function trackingNumberForRef(ref: string): string {
  const digest = createHash("sha256").update(`laseryard-order:${ref}`).digest();
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += TRACKING_CHARSET[digest[i] % TRACKING_CHARSET.length];
  }
  return `LY-${code.slice(0, 4)}-${code.slice(4)}`;
}

export type CheckoutMetadata = {
  checkout_ref?: string;
  country?: string;
  thickness?: string;
  quantity?: string;
  customer_name?: string;
  phone?: string;
  email?: string;
  card_details?: string;
};

export async function ensureOrderForCheckoutRef(
  ref: string,
  metadata: CheckoutMetadata
): Promise<{ order: Order; created: boolean }> {
  const trackingNumber = trackingNumberForRef(ref);

  const existing = await getOrderWithEvents(trackingNumber);
  if (existing) return { order: existing.order, created: false };

  const itemDescription =
    metadata.quantity && metadata.thickness
      ? `${metadata.quantity}x ${metadata.thickness} metal business cards`
      : "Metal business cards (Yara order)";

  try {
    const order = await createOrder({
      trackingNumber,
      customerName: metadata.customer_name || "Yara customer",
      itemDescription,
      customerPhone: metadata.phone || undefined,
      destination: metadata.country || undefined,
      note: "Payment confirmed. Your order is in the queue.",
    });
    if (metadata.email) {
      await setOrderCustomerEmail(trackingNumber, metadata.email).catch((e) =>
        console.error("Could not store order customer email:", e)
      );
    }
    return { order, created: true };
  } catch (e) {
    // Unique-violation race: the webhook and the agent tool both tried to
    // create the same order at once. The row exists now — fetch it.
    const raced = await getOrderWithEvents(trackingNumber);
    if (raced) return { order: raced.order, created: false };
    throw e;
  }
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_TO = "hello@laseryard.com";
const FROM_ADDRESS = "Laseryard Orders <orders@updates.laseryard.com>";

async function sendEmail(payload: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  scheduled_at?: string;
  idempotencyKey?: string;
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set; skipping email:", payload.subject);
    return;
  }
  const { idempotencyKey, ...body } = payload;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify({ ...body, cc: ccFor(payload.to) }),
    });
    if (!res.ok) {
      console.error("Resend error:", payload.subject, await res.text());
    }
  } catch (e) {
    console.error("Email send failed:", payload.subject, e);
  }
}

export async function sendOrderConfirmationEmail(
  order: Order,
  metadata: CheckoutMetadata
): Promise<boolean> {
  if (!metadata.email) return false;
  const trackUrl = `https://laseryard.com/track?order=${order.trackingNumber}`;
  const firstName =
    order.customerName && order.customerName !== "Yara customer"
      ? order.customerName.split(" ")[0]
      : null;

  const { html, text } = renderBrandedEmail({
    preheader: `Order ${order.trackingNumber} is confirmed and in the production queue.`,
    heading: "Your order is confirmed 🎉",
    paragraphsHtml: [
      `Thanks${firstName ? `, ${firstName}` : ""}! We've received your payment for:`,
      `<strong>${order.itemDescription}</strong>`,
      `Your order number is <strong>${order.trackingNumber}</strong> — keep it handy. You can follow every step of production with the button below.`,
      `To speed up the design, send your logo and card details (name, title, phone, website) to <a href="mailto:sales@laseryard.com" style="color:#b58900;">sales@laseryard.com</a>.`,
    ],
    text: `Thanks${firstName ? `, ${firstName}` : ""}! We've received your payment for: ${order.itemDescription}

Your order number is ${order.trackingNumber}.
Track your order: ${trackUrl}

To speed up the design, send your logo and card details (name, title, phone, website) to sales@laseryard.com.`,
    cta: { label: "Track your order", url: trackUrl },
  });

  const { to, subjectPrefix } = resolveEmailRecipient(metadata.email);
  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: `${subjectPrefix}Order ${order.trackingNumber} confirmed — your metal cards are in the queue`,
    idempotencyKey: `order-confirm-${order.trackingNumber}`,
    html,
    text,
  });
  return true;
}

export async function notifyTeamOfPaidOrder(
  order: Order,
  metadata: CheckoutMetadata,
  amountUsd?: number
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set; skipping paid-order notification");
    return;
  }

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const row = (label: string, value: string | null | undefined) =>
    value
      ? `<tr><td style="padding:8px 16px 8px 0;color:#666;">${label}</td><td style="padding:8px 0;font-weight:600;">${esc(value)}</td></tr>`
      : "";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: NOTIFICATION_TO,
        subject: `Paid order ${order.trackingNumber} — ${order.itemDescription}`,
        html: `
          <h2>New paid order (via Yara)</h2>
          <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
            ${row("Tracking", order.trackingNumber)}
            ${row("Item", order.itemDescription)}
            ${row("Amount", amountUsd ? `$${amountUsd}` : undefined)}
            ${row("Customer", order.customerName)}
            ${row("Phone", order.customerPhone)}
            ${row("Email", metadata.email)}
            ${row("Destination", order.destination)}
            ${row("Card details", metadata.card_details)}
          </table>
          <p style="margin-top:24px;font-size:12px;color:#999;">
            Track: https://laseryard.com/track?order=${order.trackingNumber}
          </p>
        `,
      }),
    });
    if (!res.ok) {
      console.error("Resend paid-order notify error:", await res.text());
    }
  } catch (e) {
    console.error("Paid-order notification failed:", e);
  }
}
