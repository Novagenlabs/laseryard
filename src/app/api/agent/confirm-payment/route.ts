import { NextRequest, NextResponse } from "next/server";
import { whop, WHOP_COMPANY_ID } from "@/lib/whop";
import { isAuthorizedAgentRequest } from "@/lib/agent-auth";
import {
  trackingNumberForRef,
  ensureOrderForCheckoutRef,
  notifyTeamOfPaidOrder,
  sendOrderConfirmationEmail,
  CheckoutMetadata,
} from "@/lib/agent-orders";
import { getOrderWithEvents } from "@/lib/orders";

// How far back to scan Whop payments for the checkout_ref. Conversations
// rarely span more than a couple of days between link and payment.
const LOOKBACK_MS = 72 * 60 * 60 * 1000;
const MAX_PAYMENTS_SCANNED = 200;

/**
 * Payment confirmation for the Yara ElevenLabs agent.
 *
 * Never trusts "I paid" — an order only exists once the payment is verified.
 * Fast path: the Whop webhook already created the order (deterministic
 * tracking number from the checkout_ref). Slow path: webhook delayed or
 * missed, so verify directly against the Whop payments API.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorizedAgentRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const ref = body?.order_reference;

    if (!ref || typeof ref !== "string") {
      return NextResponse.json(
        {
          error:
            "order_reference is required — it comes from the generate_checkout_link response in this conversation.",
        },
        { status: 400 }
      );
    }

    // Fast path: webhook already created the order.
    const trackingNumber = trackingNumberForRef(ref);
    const existing = await getOrderWithEvents(trackingNumber);
    if (existing) {
      const trackUrl = `https://laseryard.com/track?order=${trackingNumber}`;
      return NextResponse.json({
        paid: true,
        tracking_number: trackingNumber,
        track_url: trackUrl,
        summary: `Payment confirmed. Order ${trackingNumber} is in the queue. Send the customer this tracking link: ${trackUrl}`,
      });
    }

    // Slow path: check Whop directly.
    const createdAfter = new Date(Date.now() - LOOKBACK_MS).toISOString();
    let matched: CheckoutMetadata | null = null;
    let scanned = 0;

    for await (const payment of whop.payments.list({
      company_id: WHOP_COMPANY_ID,
      created_after: createdAfter,
    })) {
      scanned++;
      const metadata = (payment.metadata || {}) as CheckoutMetadata & {
        source?: string;
      };
      if (
        metadata.checkout_ref === ref &&
        payment.substatus === "succeeded"
      ) {
        matched = metadata;
        break;
      }
      if (scanned >= MAX_PAYMENTS_SCANNED) break;
    }

    if (!matched) {
      return NextResponse.json(
        {
          paid: false,
          error:
            "No completed payment found for this order yet. Tell the customer the payment hasn't come through — ask them to finish checkout, then check again. If they insist they paid, tell them the team will verify manually and follow up.",
        },
        { status: 404 }
      );
    }

    const { order, created } = await ensureOrderForCheckoutRef(ref, matched);
    let emailSent = false;
    if (created) {
      await notifyTeamOfPaidOrder(order, matched);
      emailSent = await sendOrderConfirmationEmail(order, matched);
    }

    const trackUrl = `https://laseryard.com/track?order=${order.trackingNumber}`;
    return NextResponse.json({
      paid: true,
      tracking_number: order.trackingNumber,
      track_url: trackUrl,
      email_sent: emailSent,
      summary: `Payment confirmed. Order ${order.trackingNumber} is in the queue. Send the customer this tracking link: ${trackUrl}${emailSent ? ` We also emailed their confirmation — tell them to check their spam folder if they don't see it.` : ""}`,
    });
  } catch (e) {
    console.error("Agent payment confirmation error:", e);
    return NextResponse.json(
      {
        error:
          "Could not verify the payment right now. Reassure the customer the team will confirm it and follow up by email shortly.",
      },
      { status: 500 }
    );
  }
}
