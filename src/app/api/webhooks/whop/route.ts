import { NextRequest, NextResponse } from "next/server";
import { whop } from "@/lib/whop";
import {
  ensureOrderForCheckoutRef,
  notifyTeamOfPaidOrder,
  sendOrderConfirmationEmail,
  shippingAddressFromPayment,
  customerNameFromPayment,
  CheckoutMetadata,
} from "@/lib/agent-orders";

/**
 * Whop payment webhook: the source of truth for "the customer actually paid".
 *
 * On payment.succeeded for a checkout we generated (metadata.source is
 * "yara-agent" for Yara's links or "website" for the product page), creates
 * the order in Neon and emails the team + customer. Idempotent via the
 * deterministic tracking number derived from metadata.checkout_ref, so
 * webhook retries and the agent's confirm_payment tool can overlap safely.
 */
const ORDER_SOURCES = new Set(["yara-agent", "website"]);
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
      const raw = (payment.metadata || {}) as CheckoutMetadata;
      // The address the customer typed into Whop's checkout wins; anything
      // collected earlier (chat, our form) is the fallback.
      const metadata: CheckoutMetadata = {
        ...raw,
        customer_name: raw.customer_name || customerNameFromPayment(payment),
        shipping_address:
          shippingAddressFromPayment(payment) || raw.shipping_address,
      };

      if (metadata.source && ORDER_SOURCES.has(metadata.source) && metadata.checkout_ref) {
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
