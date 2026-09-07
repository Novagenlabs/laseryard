import { NextRequest, NextResponse } from "next/server";
import { whop, WHOP_COMPANY_ID, WHOP_PRODUCT_ID } from "@/lib/whop";
import { isAuthorizedAgentRequest } from "@/lib/agent-auth";
import {
  renderBrandedEmail,
  resolveEmailRecipient,
  ccFor,
} from "@/lib/email-template";
import { CARD_QUANTITIES } from "@/lib/constants";

/**
 * Checkout link generator for the Yara ElevenLabs agent.
 *
 * Prices are all-in, delivered totals (worldwide shipping included) — the
 * same for every customer, computed server-side, so the agent can never
 * quote or charge an arbitrary amount. Since 2026-09-07 these match the
 * website's prices exactly.
 */

// 0.4mm was retired from the lineup on 2026-09-07. It stays accepted here
// (at its old prices) only so checkout links from the LIVE agent keep
// working until its prompt stops offering 0.4mm — remove the row after the
// live-agent push.
type AgentThickness = "0.4mm" | "0.8mm";

const AGENT_PRICES: Record<AgentThickness, Record<number, number>> = {
  "0.4mm": { 30: 250, 50: 365, 100: 650, 200: 1185 },
  "0.8mm": { 15: 250, 30: 450, 50: 715, 100: 1350, 200: 2550 },
};

// Design policy (2026-09-07): design is included free with orders of 30
// cards or more. Only the 15-card pack pays a flat design fee when the
// customer wants us to create the design. (Legacy 0.4mm keeps its 2026-08-29
// rule: free at 50+, fee on the 30-card pack.)
const DESIGN_FEE_USD = 50;

function designIncluded(thickness: AgentThickness, quantity: number): boolean {
  return thickness === "0.8mm" ? quantity >= 30 : quantity >= 50;
}

function inclusionNote(
  thickness: AgentThickness,
  quantity: number,
  designService: boolean
): string {
  if (designIncluded(thickness, quantity)) return "design and shipping included";
  if (designService) return `design service ($${DESIGN_FEE_USD}) and shipping included`;
  return "shipping included, using your own print-ready design";
}

const THICKNESSES: AgentThickness[] = ["0.4mm", "0.8mm"];
// Countries we cannot ship to at all. Germany/EU became shippable with the
// 2026-07-29 policy (0.4mm EU orders pay shipping separately) — keep this
// list in sync with the agent prompt's SHIPPING section.
const BLOCKED_COUNTRIES: string[] = [];

// CHECKOUT_LINK_STYLE=site serves the Whop checkout embedded on our own
// domain (laseryard.com/checkout) — customers asked to "pay on the website".
// Default stays "whop" (the hosted purchase_url) until the page is proven.
function customerCheckoutUrl(purchaseUrl: string): string {
  if ((process.env.CHECKOUT_LINK_STYLE || "whop") !== "site") return purchaseUrl;
  const plan = purchaseUrl.match(/plan_[A-Za-z0-9]+/)?.[0];
  if (!plan) return purchaseUrl;
  const session = purchaseUrl.match(/ch_[A-Za-z0-9]+/)?.[0];
  return `https://laseryard.com/checkout?plan=${plan}${session ? `&session=${session}` : ""}`;
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
      design_service,
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

    const basePrice = AGENT_PRICES[thickness as AgentThickness][quantity as number];
    if (basePrice === undefined) {
      // e.g. the 15-card tier only exists for 0.8mm.
      return NextResponse.json(
        {
          error: `The ${quantity}-card option isn't available in ${thickness}. Offer the 0.8mm lineup instead.`,
        },
        { status: 400 }
      );
    }

    const wantsDesignService = design_service === true || design_service === "true";
    const designFeeApplies =
      wantsDesignService &&
      !designIncluded(thickness as AgentThickness, quantity as number);
    const amount = basePrice + (designFeeApplies ? DESIGN_FEE_USD : 0);
    const included = inclusionNote(
      thickness as AgentThickness,
      quantity as number,
      wantsDesignService
    );
    const checkoutRef = crypto.randomUUID();
    let customerUrl = "";

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
        design_service: designFeeApplies ? "paid" : designIncluded(thickness as AgentThickness, quantity as number) ? "included" : "none",
      },
    });

    customerUrl = customerCheckoutUrl(config.purchase_url ?? "");

    // Email the checkout link too when we know their address — better
    // conversion than a link buried in chat history.
    let emailSent = false;
    if (
      email &&
      typeof email === "string" &&
      email.includes("@") &&
      process.env.RESEND_API_KEY
    ) {
      const summaryLine = `${quantity}x ${thickness} metal business cards — $${amount}, ${included}`;
      const { html, text } = renderBrandedEmail({
        preheader: "Your secure checkout link is inside.",
        heading: "Complete your order",
        paragraphsHtml: [
          `Here's everything ready to go:`,
          `<strong>${summaryLine}</strong>`,
          `Pay securely with the button below. Once your order is placed, the design team gets started right away.`,
        ],
        text: `Here's everything ready to go:\n\n${summaryLine}\n\nPay securely: ${customerUrl}\n\nOnce your order is placed, the design team gets started right away.`,
        cta: { label: "Pay securely", url: customerUrl },
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
      checkout_url: customerUrl,
      order_reference: checkoutRef,
      email_sent: emailSent,
      price_usd: amount,
      summary: `${quantity}x ${thickness} metal cards to ${country} — $${amount} (${included})`,
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
