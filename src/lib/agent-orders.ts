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
  // "yara-agent" for links Yara generated, "website" for the product page.
  source?: string;
  checkout_ref?: string;
  country?: string;
  thickness?: string;
  quantity?: string;
  color?: string;
  design_service?: string;
  customer_name?: string;
  phone?: string;
  email?: string;
  card_details?: string;
  // Full delivery address as the customer gave it (newline-separated).
  shipping_address?: string;
};

// Whop collects the delivery address at checkout (product setting
// collect_shipping_address, enabled 2026-09-07) and returns it on the
// payment. Our installed SDK types predate the field, so callers cast the
// payment; this formats it for the order's shipping_address.
export type WhopShippingAddress = {
  name?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

export function formatWhopAddress(
  a: WhopShippingAddress | null | undefined
): string {
  if (!a) return "";
  const cityLine = [a.city, a.state, a.postal_code].filter(Boolean).join(", ");
  return [a.name, a.line1, a.line2, cityLine, a.country]
    .filter((s) => s && String(s).trim())
    .join("\n");
}

export function shippingAddressFromPayment(payment: unknown): string {
  const raw = (payment as { shipping_address?: WhopShippingAddress | null })
    ?.shipping_address;
  return formatWhopAddress(raw);
}

// The name the customer typed on Whop's shipping (or billing) form — the
// website flow doesn't ask for it separately.
export function customerNameFromPayment(payment: unknown): string {
  const p = payment as {
    shipping_address?: WhopShippingAddress | null;
    billing_address?: WhopShippingAddress | null;
  };
  return (p?.shipping_address?.name || p?.billing_address?.name || "").trim();
}

export async function ensureOrderForCheckoutRef(
  ref: string,
  metadata: CheckoutMetadata
): Promise<{ order: Order; created: boolean }> {
  const trackingNumber = trackingNumberForRef(ref);

  const existing = await getOrderWithEvents(trackingNumber);
  if (existing) return { order: existing.order, created: false };

  const fromWebsite = metadata.source === "website";
  const itemDescription =
    metadata.quantity && metadata.thickness
      ? `${metadata.quantity}x ${metadata.thickness}${metadata.color ? ` ${metadata.color}` : ""} metal business cards`
      : `Metal business cards (${fromWebsite ? "website" : "Yara"} order)`;

  try {
    const order = await createOrder({
      trackingNumber,
      customerName:
        metadata.customer_name || (fromWebsite ? "Website customer" : "Yara customer"),
      itemDescription,
      customerPhone: metadata.phone || undefined,
      destination: metadata.country || undefined,
      shippingAddress: metadata.shipping_address || undefined,
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
    order.customerName &&
    order.customerName !== "Yara customer" &&
    order.customerName !== "Website customer"
      ? order.customerName.split(" ")[0]
      : null;
  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Echo the delivery address so a typo gets caught before we ship.
  const address = order.shippingAddress?.trim();
  const addressHtml = address
    ? `We'll ship to:<br><strong>${escapeHtml(address).replace(/\n/g, "<br>")}</strong><br>If anything looks wrong, reply to this email.`
    : null;

  const { html, text } = renderBrandedEmail({
    preheader: `Order ${order.trackingNumber} is confirmed and in the production queue.`,
    heading: "Your order is confirmed 🎉",
    paragraphsHtml: [
      `Thanks${firstName ? `, ${firstName}` : ""}! We've received your payment for:`,
      `<strong>${order.itemDescription}</strong>`,
      `Your order number is <strong>${order.trackingNumber}</strong> — keep it handy. You can follow every step of production with the button below.`,
      ...(addressHtml ? [addressHtml] : []),
      `To speed up the design, send your logo and card details (name, title, phone, website) to <a href="mailto:sales@laseryard.com" style="color:#b58900;">sales@laseryard.com</a>.`,
      `What's next: you'll approve a digital proof, then a single engraved sample card, before we produce the full batch — nothing is engraved until you've signed off.`,
    ],
    text: `Thanks${firstName ? `, ${firstName}` : ""}! We've received your payment for: ${order.itemDescription}

Your order number is ${order.trackingNumber}.
Track your order: ${trackUrl}
${address ? `\nWe'll ship to:\n${address}\nIf anything looks wrong, reply to this email.\n` : ""}
To speed up the design, send your logo and card details (name, title, phone, website) to sales@laseryard.com.

What's next: you'll approve a digital proof, then a single engraved sample card, before we produce the full batch — nothing is engraved until you've signed off.`,
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
          <h2>New paid order (via ${metadata.source === "website" ? "the website" : "Yara"})</h2>
          <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
            ${row("Tracking", order.trackingNumber)}
            ${row("Item", order.itemDescription)}
            ${row("Amount", amountUsd ? `$${amountUsd}` : undefined)}
            ${row("Design", metadata.design_service === "paid" ? "Design service ($50) — we design it" : metadata.design_service === "included" ? "Included free" : metadata.design_service === "none" ? "Customer supplies print-ready design" : undefined)}
            ${row("Customer", order.customerName)}
            ${row("Phone", order.customerPhone)}
            ${row("Email", metadata.email)}
            ${row("Destination", order.destination)}
            ${order.shippingAddress ? `<tr><td style="padding:8px 16px 8px 0;color:#666;vertical-align:top;">Ships to</td><td style="padding:8px 0;font-weight:600;">${esc(order.shippingAddress).replace(/\n/g, "<br>")}</td></tr>` : row("Ships to", "NOT PROVIDED — ask the customer")}
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
