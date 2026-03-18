import { NextRequest, NextResponse } from "next/server";
import { trackOrder } from "@/lib/fez-delivery";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber } = body;

    if (!orderNumber || typeof orderNumber !== "string") {
      return NextResponse.json(
        { error: "orderNumber is required" },
        { status: 400 }
      );
    }

    const result = await trackOrder(orderNumber);
    return NextResponse.json(result);
  } catch (e) {
    console.error("Order tracking error:", e);
    return NextResponse.json(
      { error: "Failed to track order" },
      { status: 500 }
    );
  }
}
