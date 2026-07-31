import { NextRequest, NextResponse } from "next/server";
import { saveOrderFeedback } from "@/lib/orders";

// Rate limit: max submissions per IP per hour. Lower than the tracking
// lookup ceiling — there is no legitimate reason to post many reviews.
const RATE_LIMIT = 10;
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

const MAX_COMMENT = 2000;

// Public: a customer rates their delivered order. The tracking number is
// the only credential — the same secret that already reveals the order —
// and feedback is private to us, so nothing here is published.
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { trackingNumber, rating, comment } = body ?? {};

    if (!trackingNumber || typeof trackingNumber !== "string") {
      return NextResponse.json(
        { error: "trackingNumber is required" },
        { status: 400 }
      );
    }
    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { error: "rating must be a whole number from 1 to 5" },
        { status: 400 }
      );
    }
    if (comment !== undefined && comment !== null && typeof comment !== "string") {
      return NextResponse.json(
        { error: "comment must be a string" },
        { status: 400 }
      );
    }
    if (typeof comment === "string" && comment.length > MAX_COMMENT) {
      return NextResponse.json(
        { error: `comment must be ${MAX_COMMENT} characters or fewer` },
        { status: 400 }
      );
    }

    const result = await saveOrderFeedback(
      trackingNumber,
      rating,
      typeof comment === "string" ? comment : null
    );

    if (result === "not_found") {
      return NextResponse.json(
        { error: "No order found with that tracking number." },
        { status: 404 }
      );
    }
    if (result === "not_delivered") {
      return NextResponse.json(
        { error: "You can leave feedback once your order has been delivered." },
        { status: 409 }
      );
    }

    return NextResponse.json({ feedback: result });
  } catch (e) {
    console.error("Order feedback error:", e);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}
