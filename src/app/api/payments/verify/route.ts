import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference || typeof reference !== "string") {
      return NextResponse.json(
        { error: "reference is required" },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Payment verification unavailable" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (!data.status || !data.data || data.data.status !== "success") {
      return NextResponse.json(
        { verified: false, message: data.data?.gateway_response || "Payment not successful" }
      );
    }

    return NextResponse.json({
      verified: true,
      reference: data.data.reference,
      amount: data.data.amount / 100, // Paystack returns amount in kobo/cents
      currency: data.data.currency,
      paidAt: data.data.paid_at,
      customer: data.data.customer?.email,
    });
  } catch (e) {
    console.error("Payment verification error:", e);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
