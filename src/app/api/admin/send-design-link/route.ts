import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import { adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";
import { getOrderWithEvents, normalizeTrackingNumber } from "@/lib/orders";
import {
  getOrderCustomerEmail,
  setOrderCustomerEmail,
} from "@/lib/order-notifications";

/**
 * Admin: send the design onboarding email for an order (the console's
 * "Design link" button). Fills design-link.html with the order's customer
 * first name and tracking code and sends it to the order's stored customer
 * email, or to the email provided in the request (which is then stored on
 * the order for future notifications).
 *
 * POST { trackingNumber, email? }
 * 422 {error:"no_email"} when the order has no stored email and none was
 * provided; the console prompts and retries.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = "Laser Yard Design Team <design-team@updates.laseryard.com>";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function OPTIONS() {
  return adminPreflight();
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return adminJson({ error: "Unauthorized" }, 401);

  try {
    const body = await request.json();
    const tn = normalizeTrackingNumber(String(body?.trackingNumber || ""));
    if (!tn) return adminJson({ error: "trackingNumber is required" }, 400);

    const found = await getOrderWithEvents(tn);
    if (!found) return adminJson({ error: "Order not found" }, 404);
    const order = found.order;

    const override =
      typeof body?.email === "string" && body.email.includes("@")
        ? body.email.trim().toLowerCase()
        : null;
    const to = override || (await getOrderCustomerEmail(tn));
    if (!to) {
      return adminJson(
        { error: "no_email", note: "No customer email stored for this order. Provide one." },
        422
      );
    }
    if (override) await setOrderCustomerEmail(tn, override);

    if (!RESEND_API_KEY) {
      return adminJson({ error: "RESEND_API_KEY is not configured" }, 500);
    }

    const template = await readFile(
      path.join(process.cwd(), "public", "emails", "design-link.html"),
      "utf8"
    );
    const firstName = (order.customerName || "").trim().split(/\s+/)[0] || "there";
    const html = template
      .replaceAll("{{CUSTOMER_NAME}}", escapeHtml(firstName))
      .replaceAll("{{ORDER_CODE}}", tn);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to,
        reply_to: "hello@laseryard.com",
        subject: `Start your card design, order ${tn}`,
        html,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      console.error("send-design-link resend error:", res.status, await res.text());
      return adminJson({ error: "Email service rejected the send" }, 502);
    }

    return adminJson({ sent: true, to, order: tn });
  } catch (e) {
    console.error("send-design-link error:", e);
    return adminJson({ error: "Failed to send design link" }, 500);
  }
}
