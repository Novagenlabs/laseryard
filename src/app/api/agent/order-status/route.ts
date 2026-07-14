import { NextRequest, NextResponse } from "next/server";
import {
  getOrderWithEvents,
  normalizeTrackingNumber,
  STATUS_LABELS,
} from "@/lib/orders";
import { isAuthorizedAgentRequest } from "@/lib/agent-auth";

/**
 * Order status lookup for the Yara ElevenLabs agent.
 *
 * Uses the shared agent secret instead of the public /api/orders/track
 * endpoint so agent traffic is not subject to the per-IP rate limit
 * (all ElevenLabs tool calls share egress IPs).
 */
export async function POST(request: NextRequest) {
  if (!isAuthorizedAgentRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const trackingNumber = body?.tracking_number;

    if (!trackingNumber || typeof trackingNumber !== "string") {
      return NextResponse.json(
        {
          error:
            "tracking_number is required. Ask the customer for their order number (format LY-XXXX-XXXX).",
        },
        { status: 400 }
      );
    }

    const result = await getOrderWithEvents(
      normalizeTrackingNumber(trackingNumber)
    );

    if (!result) {
      return NextResponse.json(
        {
          error:
            "No order found with that tracking number. Ask the customer to double-check it — it's in the format LY-XXXX-XXXX from their confirmation message.",
        },
        { status: 404 }
      );
    }

    const { order, events } = result;
    const latest = events[0];
    const trackUrl = `https://laseryard.com/track?order=${order.trackingNumber}`;

    return NextResponse.json({
      tracking_number: order.trackingNumber,
      status: order.status,
      status_label: STATUS_LABELS[order.status],
      latest_note: latest?.note || null,
      last_update: latest?.createdAt || order.updatedAt,
      item_description: order.itemDescription,
      track_url: trackUrl,
      summary: `Order ${order.trackingNumber} (${order.itemDescription}) is at "${STATUS_LABELS[order.status]}". ${latest?.note || ""} Full timeline: ${trackUrl}`,
    });
  } catch (e) {
    console.error("Agent order status error:", e);
    return NextResponse.json(
      {
        error:
          "Could not look up the order right now. Point the customer to https://laseryard.com/track to check directly.",
      },
      { status: 500 }
    );
  }
}
