import { NextRequest, NextResponse } from "next/server";
import { whop, WHOP_COMPANY_ID, WHOP_PRODUCT_ID } from "@/lib/whop";
import { isAuthorizedAgentRequest } from "@/lib/agent-auth";
import {
  renderBrandedEmail,
  resolveEmailRecipient,
  ccFor,
} from "@/lib/email-template";
import {
  CARD_QUANTITIES,
  CardThickness,
  CardQuantity,
} from "@/lib/constants";

/**
 * Checkout link generator for the Yara ElevenLabs agent.
 *
 * Prices are the agent's all-in, delivered totals (design + shipping
 * included) — the same for every customer, computed server-side, so the
 * agent can never quote or charge an arbitrary amount. These are the
 * agent-channel prices and may differ from the website's card-only prices.
 */

const AGENT_PRICES: Record<CardThickness, Record<number, number>> = {
  "0.4mm": { 30: 250, 50: 365, 100: 650, 200: 1185 },
  "0.8mm": { 30: 450, 50: 715, 100: 1350, 200: 2550 },
};

const THICKNESSES: CardThickness[] = ["0.4mm", "0.8mm"];
// We currently do not ship to Germany.
const BLOCKED_COUNTRIES = ["germany"];

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
        {
          error:
            "country is required. Ask the customer where they're based (needed to confirm we can ship there).",
        },
        { status: 400 }
      );
    }
    if (!THICKNESSES.includes(thickness)) {
      return NextResponse.json(
        { error: `thickness must be one of: ${THICKNESSES.join(", ")}` },
        { status: 400 }
      );
    }
    if (!(CARD_QUANTITIES as readonly number[]).includes(quantity)) {
      return NextResponse.json(
        {
          error: `quantity must be one of: ${CARD_QUANTITIES.join(
            ", "
          )}. For other quantities, tell the customer to email hello@laseryard.com for a custom quote.`,
        },
        { status: 400 }
      );
    }
    if (BLOCKED_COUNTRIES.includes(country.trim().toLowerCase())) {
      return NextResponse.json(
        {
          error:
            "We currently do not ship to this country. Apologize and let the customer know.",
        },
        { status: 422 }
      );
    }

    const amount =
      AGENT_PRICES[thickness as CardThickness][quantity as CardQuantity];
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
    if (
      email &&
      typeof email === "string" &&
      email.includes("@") &&
      process.env.RESEND_API_KEY
    ) {
      const summaryLine = `${quantity}x ${thickness} metal business cards — $${amount}, design and shipping included`;
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
        .then((r) => {
          emailSent = r.ok;
        })
        .catch((e) => console.error("Checkout link email failed:", e));
    }

    return NextResponse.json({
      checkout_url: config.purchase_url,
      order_reference: checkoutRef,
      email_sent: emailSent,
      price_usd: amount,
      summary: `${quantity}x ${thickness} metal cards to ${country} — $${amount} (design and shipping included)`,
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
