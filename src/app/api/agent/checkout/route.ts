import { NextRequest, NextResponse } from "next/server";
import { whop, WHOP_COMPANY_ID, WHOP_PRODUCT_ID } from "@/lib/whop";
import { isAuthorizedAgentRequest } from "@/lib/agent-auth";
import {
  renderBrandedEmail,
  resolveEmailRecipient,
  ccFor,
} from "@/lib/email-template";

/**
 * Checkout link generator for the Yara ElevenLabs agent.
 *
 * Called as a webhook tool from the agent mid-conversation. The agent passes
 * the customer's country and order details; the pricing tier and price are
 * ALWAYS computed server-side from the same matrix as yara-system-prompt-v2.md,
 * so the agent can never quote or charge an arbitrary amount or pick the
 * wrong tier.
 */

type Tier = "international" | "west_africa";
type Thickness = "0.4mm" | "0.8mm";

const PRICES: Record<Tier, Record<Thickness, Record<number, number>>> = {
  international: {
    "0.4mm": { 30: 300, 100: 500 },
    "0.8mm": { 30: 450, 100: 750 },
  },
  west_africa: {
    "0.4mm": { 30: 250, 100: 450 },
    "0.8mm": { 30: 400, 100: 700 },
  },
};

const WEST_AFRICA_COUNTRIES = [
  "nigeria",
  "ghana",
  "togo",
  "benin",
  "ivory coast",
  "cote d'ivoire",
  "côte d'ivoire",
  "senegal",
  "burkina faso",
  "niger",
  "gambia",
  "sierra leone",
  "liberia",
];

// Per yara-system-prompt-v2.md: we currently do not ship to Germany.
const BLOCKED_COUNTRIES = ["germany"];

const THICKNESSES: Thickness[] = ["0.4mm", "0.8mm"];
const QUANTITIES = [30, 100];

function tierForCountry(country: string): Tier | "blocked" {
  const normalized = country.trim().toLowerCase();
  if (BLOCKED_COUNTRIES.includes(normalized)) return "blocked";
  if (WEST_AFRICA_COUNTRIES.includes(normalized)) return "west_africa";
  return "international";
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedAgentRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      country,
      thickness,
      quantity,
      customer_name,
      phone,
      email,
      card_details,
    } = body;

    if (!country || typeof country !== "string") {
      return NextResponse.json(
        { error: "country is required. Ask the customer where they are based." },
        { status: 400 }
      );
    }
    if (!THICKNESSES.includes(thickness)) {
      return NextResponse.json(
        { error: `thickness must be one of: ${THICKNESSES.join(", ")}` },
        { status: 400 }
      );
    }
    if (!QUANTITIES.includes(quantity)) {
      return NextResponse.json(
        {
          error: `quantity must be one of: ${QUANTITIES.join(
            ", "
          )}. For custom quantities, tell the customer to email hello@laseryard.com for a custom quote.`,
        },
        { status: 400 }
      );
    }

    const tier = tierForCountry(country);
    if (tier === "blocked") {
      return NextResponse.json(
        {
          error:
            "We currently do not ship to this country. Apologize and let the customer know.",
        },
        { status: 422 }
      );
    }

    const amount = PRICES[tier][thickness as Thickness][quantity];
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
        source: "yara-agent",
        checkout_ref: checkoutRef,
        country,
        pricing_tier: tier,
        thickness,
        quantity: String(quantity),
        customer_name: customer_name || "",
        phone: phone || "",
        email: email || "",
        card_details: card_details || "",
      },
    });

    // Email the checkout link too when we know their address — better
    // conversion than a link buried in chat history.
    let emailSent = false;
    if (email && typeof email === "string" && email.includes("@") && process.env.RESEND_API_KEY) {
      const summaryLine = `${quantity}x ${thickness} metal business cards — $${amount}, design and ${tier === "west_africa" ? "delivery" : "shipping"} included`;
      const { html, text } = renderBrandedEmail({
        preheader: "Your secure checkout link is inside.",
        heading: "Complete your order",
        paragraphsHtml: [
          `Here's everything ready to go:`,
          `<strong>${summaryLine}</strong>`,
          `Pay securely with the button below. Once your order is placed, the design team gets started right away.`,
        ],
        text: `Here's everything ready to go:\n\n${summaryLine}\n\nPay securely: ${config.purchase_url}\n\nOnce your order is placed, the design team gets started right away.`,
        cta: { label: "Pay securely", url: config.purchase_url ?? "" },
      });
      const { to, subjectPrefix } = resolveEmailRecipient(email);
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `checkout-link-${checkoutRef}`,
        },
        body: JSON.stringify({
          from: "Laseryard Orders <orders@updates.laseryard.com>",
          to,
          cc: ccFor(to),
          subject: `${subjectPrefix}Your Laseryard checkout link`,
          html,
          text,
        }),
      })
        .then((r) => { emailSent = r.ok; })
        .catch((e) => console.error("Checkout link email failed:", e));
    }

    return NextResponse.json({
      checkout_url: config.purchase_url,
      order_reference: checkoutRef,
      email_sent: emailSent,
      price_usd: amount,
      summary: `${quantity}x ${thickness} metal cards to ${country} — $${amount} (design and ${
        tier === "west_africa" ? "delivery" : "shipping"
      } included)`,
    });
  } catch (e) {
    console.error("Agent checkout creation error:", e);
    return NextResponse.json(
      {
        error:
          "Could not create the checkout link right now. Ask the customer to email hello@laseryard.com instead.",
      },
      { status: 500 }
    );
  }
}
