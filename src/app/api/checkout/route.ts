import { NextRequest, NextResponse } from "next/server";
import { whop, WHOP_COMPANY_ID, WHOP_PRODUCT_ID } from "@/lib/whop";
import {
  CARD_COLORS,
  CARD_PRICING,
  CARD_QUANTITIES,
  DESIGN_FEE_USD,
  designIncluded,
  type CardQuantity,
} from "@/lib/constants";

/**
 * Website checkout. The browser sends what the customer chose; the price is
 * computed HERE from the lineup in constants.ts, so a tampered request can
 * never buy cards for an arbitrary amount. Contact details ride along in the
 * Whop metadata; the delivery address is collected by Whop's checkout page
 * (product setting collect_shipping_address) and both become the order when
 * the payment webhook fires — the same path Yara's orders take.
 */

const str = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const m = (body?.metadata ?? {}) as Record<string, unknown>;

    const quantity = Number(m.quantity);
    if (!(CARD_QUANTITIES as readonly number[]).includes(quantity)) {
      return NextResponse.json(
        { error: "Please choose a card quantity." },
        { status: 400 }
      );
    }
    const color = CARD_COLORS.find(
      (c) => c.label === m.color || c.id === m.color
    );
    if (!color) {
      return NextResponse.json(
        { error: "Please choose a card color." },
        { status: 400 }
      );
    }

    const wantsDesign = m.designService === "paid";
    const designFee = wantsDesign && !designIncluded(quantity) ? DESIGN_FEE_USD : 0;
    const amount =
      CARD_PRICING["0.8mm"].prices[quantity as CardQuantity] + designFee;

    const ship = {
      name: str(m.customerName, 120),
      email: str(m.email, 200).toLowerCase(),
      phone: str(m.phone, 40),
      line1: str(m.address1, 200),
      line2: str(m.address2, 200),
      city: str(m.city, 100),
      state: str(m.state, 100),
      postalCode: str(m.postalCode, 30),
      country: str(m.deliveryDestination, 120),
    };
    // Name and delivery address are typed on Whop's checkout form and read
    // back from the payment; only the email (which Whop doesn't return to us)
    // and the destination are required here.
    const missing = [
      !ship.email.includes("@") && "email",
      !ship.country && "delivery country",
    ].filter(Boolean);
    if (missing.length) {
      return NextResponse.json(
        { error: `Please add your ${missing.join(", ")} to continue.` },
        { status: 400 }
      );
    }

    // Optional: an address typed on our side (not shown on the product page
    // today — Whop's checkout collects it). Kept as a fallback the webhook
    // uses only when Whop returns no shipping address.
    const shippingAddress = ship.line1
      ? [
          ship.name,
          ship.line1,
          ship.line2,
          [ship.city, ship.state, ship.postalCode].filter(Boolean).join(", "),
          ship.country,
          ship.phone,
        ]
          .filter(Boolean)
          .join("\n")
      : "";
    const checkoutRef = crypto.randomUUID();

    const config = await whop.checkoutConfigurations.create({
      plan: {
        company_id: WHOP_COMPANY_ID,
        product_id: WHOP_PRODUCT_ID,
        initial_price: amount,
        currency: "usd",
        plan_type: "one_time",
      },
      metadata: {
        source: "website",
        checkout_ref: checkoutRef,
        country: ship.country,
        thickness: "0.8mm",
        quantity: String(quantity),
        color: color.label,
        design_service: designFee
          ? "paid"
          : designIncluded(quantity)
            ? "included"
            : "none",
        customer_name: ship.name,
        phone: ship.phone,
        email: ship.email,
        shipping_address: shippingAddress,
        total_usd: String(amount),
      },
    });

    return NextResponse.json({
      sessionId: config.id,
      purchaseUrl: config.purchase_url,
      amount,
      orderReference: checkoutRef,
    });
  } catch (e) {
    console.error("Checkout creation error:", e);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
