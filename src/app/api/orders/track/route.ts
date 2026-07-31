import { NextRequest, NextResponse } from "next/server";
import { getOrderFeedback, getOrderWithEvents } from "@/lib/orders";
import { carrierTrackingUrl } from "@/lib/carriers";

// Rate limit: max lookups per IP per hour
const RATE_LIMIT = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Purge expired entries to prevent unbounded memory growth
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many lookups. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const trackingNumber = body?.trackingNumber;

    if (!trackingNumber || typeof trackingNumber !== "string") {
      return NextResponse.json(
        { error: "trackingNumber is required" },
        { status: 400 }
      );
    }

    const result = await getOrderWithEvents(trackingNumber);
    if (!result) {
      return NextResponse.json(
        { error: "No order found with that tracking number." },
        { status: 404 }
      );
    }

    const { order, events } = result;
    // Only so the page can show what they already left, and let them
    // revise it, rather than inviting a review they have given.
    const feedback =
      order.status === "delivered" ? await getOrderFeedback(order.id) : null;

    // Public shape — never expose the customer's phone number
    return NextResponse.json({
      order: {
        trackingNumber: order.trackingNumber,
        customerName: order.customerName,
        itemDescription: order.itemDescription,
        destination: order.destination,
        designUrl: order.designUrl,
        status: order.status,
        carrier: order.carrier,
        waybillNumber: order.waybillNumber,
        shipmentStatus: order.shipmentStatus,
        shipmentDetail: order.shipmentDetail,
        estimatedDelivery: order.estimatedDelivery,
        carrierUrl: carrierTrackingUrl(order.carrier, order.waybillNumber),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      events,
      feedback,
    });
  } catch (e) {
    console.error("Order tracking error:", e);
    return NextResponse.json(
      { error: "Failed to look up order" },
      { status: 500 }
    );
  }
}
