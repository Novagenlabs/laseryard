import { NextRequest, NextResponse } from "next/server";
import { getDeliveryCost } from "@/lib/fez-delivery";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { state, weight } = body;

    if (!state || typeof state !== "string") {
      return NextResponse.json(
        { error: "state is required" },
        { status: 400 }
      );
    }

    const result = await getDeliveryCost(state, weight);
    return NextResponse.json(result);
  } catch (e) {
    console.error("Shipping cost error:", e);
    return NextResponse.json(
      { error: "Failed to fetch delivery cost" },
      { status: 500 }
    );
  }
}
