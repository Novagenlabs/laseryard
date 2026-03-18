import { NextRequest, NextResponse } from "next/server";
import { whop, WHOP_COMPANY_ID, WHOP_PRODUCT_ID } from "@/lib/whop";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = "usd", metadata } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    const config = await whop.checkoutConfigurations.create({
      plan: {
        company_id: WHOP_COMPANY_ID,
        product_id: WHOP_PRODUCT_ID,
        initial_price: amount,
        currency,
        plan_type: "one_time",
      },
      metadata: metadata || undefined,
    });

    return NextResponse.json({
      sessionId: config.id,
      purchaseUrl: config.purchase_url,
    });
  } catch (e) {
    console.error("Checkout creation error:", e);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
