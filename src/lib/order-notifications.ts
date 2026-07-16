import { getDb } from "@/lib/db";
import { Order, OrderStatus } from "@/lib/orders";
import {
  renderBrandedEmail,
  resolveEmailRecipient,
  ccFor,
} from "@/lib/email-template";

/**
 * Customer notifications for order status changes, driven from the admin
 * PATCH route (orders console). The orders table gains a nullable
 * customer_email column, populated at creation for agent orders; console
 * orders without an email simply never notify.
 *
 * Which statuses notify (and their copy) is defined in NOTIFY below —
 * add an entry to start notifying on another stage.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = "Laseryard Orders <orders@updates.laseryard.com>";

let ensured: Promise<unknown> | null = null;
function ensureColumn() {
  if (!ensured) {
    const sql = getDb();
    ensured = sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT`;
  }
  return ensured;
}

export async function setOrderCustomerEmail(
  trackingNumber: string,
  email: string
): Promise<void> {
  await ensureColumn();
  const sql = getDb();
  await sql`
    UPDATE orders SET customer_email = ${email.trim().toLowerCase()}
    WHERE tracking_number = ${trackingNumber}
  `;
}

async function getOrderCustomerEmail(
  trackingNumber: string
): Promise<string | null> {
  await ensureColumn();
  const sql = getDb();
  const rows = await sql`
    SELECT customer_email FROM orders WHERE tracking_number = ${trackingNumber}
  `;
  return rows.length ? rows[0].customer_email : null;
}

const NOTIFY: Partial<
  Record<
    OrderStatus,
    { subject: (o: Order) => string; heading: string; lead: string }
  >
> = {
  shipped: {
    subject: (o) => `Your order ${o.trackingNumber} is on its way`,
    heading: "Your order is on its way 🚚",
    lead: "Your cards just left production and are with the courier.",
  },
  delivered: {
    subject: (o) => `Your order ${o.trackingNumber} has been delivered`,
    heading: "Delivered 🎉",
    lead: "Your order has arrived — we hope the cards make every introduction count.",
  },
};

export async function notifyOrderStatusChange(
  order: Order,
  note?: string
): Promise<boolean> {
  const config = NOTIFY[order.status];
  if (!config) return false;
  if (!RESEND_API_KEY) return false;

  const email = await getOrderCustomerEmail(order.trackingNumber);
  if (!email) return false;

  const trackUrl = `https://laseryard.com/track?order=${order.trackingNumber}`;
  const firstName =
    order.customerName && order.customerName !== "Yara customer"
      ? order.customerName.split(" ")[0]
      : null;

  const paragraphsHtml = [
    `${firstName ? `${firstName}, ` : ""}${config.lead}`,
    `<strong>${order.itemDescription}</strong> — order <strong>${order.trackingNumber}</strong>.`,
  ];
  if (note) paragraphsHtml.push(note);
  paragraphsHtml.push(
    `Track the latest status anytime with the button below.`
  );

  const { html, text } = renderBrandedEmail({
    preheader: `${config.heading} — order ${order.trackingNumber}`,
    heading: config.heading,
    paragraphsHtml,
    text: `${config.lead}

${order.itemDescription} — order ${order.trackingNumber}.
${note ? `${note}\n` : ""}
Track your order: ${trackUrl}`,
    cta: { label: "Track your order", url: trackUrl },
  });

  const { to, subjectPrefix } = resolveEmailRecipient(email);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        // One notification per order per status, even if the console
        // flips a status back and forth.
        "Idempotency-Key": `status-${order.trackingNumber}-${order.status}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to,
        cc: ccFor(to),
        subject: `${subjectPrefix}${config.subject(order)}`,
        html,
        text,
      }),
    });
    if (!res.ok) {
      console.error("Status notification error:", await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("Status notification failed:", e);
    return false;
  }
}
