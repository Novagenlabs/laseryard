import { NextRequest, NextResponse } from "next/server";
import { whop } from "@/lib/whop";
import {
  ensureOrderForCheckoutRef,
  notifyTeamOfPaidOrder,
  sendOrderConfirmationEmail,
  CheckoutMetadata,
} from "@/lib/agent-orders";

/**
 * Whop payment webhook: the source of truth for "the customer actually paid".
 *
 * On payment.succeeded for an agent-generated checkout (metadata.source ===
 * "yara-agent"), creates the order in Neon and emails the team. Idempotent
 * via the deterministic tracking number derived from metadata.checkout_ref,
 * so webhook retries and the agent's confirm_payment tool can overlap safely.
 */
export async function POST(request: NextRequest) {
  const key = process.env.WHOP_WEBHOOK_SECRET;
  if (!key) {
    console.error("WHOP_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  let event;
  try {
    const body = await request.text();
    event = whop.webhooks.unwrap(body, {
      headers: Object.fromEntries(request.headers),
      key,
    });
  } catch (e) {
    console.error("Whop webhook verification failed:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    if (event.type === "payment.succeeded") {
      const payment = event.data;
      const metadata = (payment.metadata || {}) as CheckoutMetadata & {
        source?: string;
      };

      if (metadata.source === "yara-agent" && metadata.checkout_ref) {
        const { order, created } = await ensureOrderForCheckoutRef(
          metadata.checkout_ref,
          metadata
        );
        if (created) {
          await notifyTeamOfPaidOrder(order, metadata);
          await sendOrderConfirmationEmail(order, metadata);
          console.log(
            `Order ${order.trackingNumber} created from payment ${payment.id}`
          );
        }
      }
    }
  } catch (e) {
    // Log but still 200: Whop retries on non-2xx, and the confirm_payment
    // tool provides a second path to order creation.
    console.error("Whop webhook processing error:", e);
  }

  return NextResponse.json({ received: true });
}
