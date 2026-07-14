import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { isAuthorizedAgentRequest } from "@/lib/agent-auth";

/**
 * Order creation for the Yara ElevenLabs agent.
 *
 * Called as a webhook tool after a customer has paid, so Yara can hand
 * them a tracking link in the same conversation.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorizedAgentRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { customer_name, item_description, phone, destination } = body;

    if (!customer_name || typeof customer_name !== "string") {
      return NextResponse.json(
        { error: "customer_name is required. Ask the customer for their name." },
        { status: 400 }
      );
    }
    if (!item_description || typeof item_description !== "string") {
      return NextResponse.json(
        {
          error:
            "item_description is required, e.g. '30x 0.4mm metal business cards'.",
        },
        { status: 400 }
      );
    }

    const order = await createOrder({
      customerName: customer_name,
      itemDescription: item_description,
      customerPhone: phone || undefined,
      destination: destination || undefined,
      note: "Order placed with Yara. We've received it and it's in the queue.",
    });

    const trackUrl = `https://laseryard.com/track?order=${order.trackingNumber}`;

    return NextResponse.json({
      tracking_number: order.trackingNumber,
      track_url: trackUrl,
      summary: `Order ${order.trackingNumber} created for ${customer_name}. Send the customer this tracking link: ${trackUrl}`,
    });
  } catch (e) {
    console.error("Agent order creation error:", e);
    return NextResponse.json(
      {
        error:
          "Could not create the order right now. Reassure the customer that the team will set up their order and follow up by email.",
      },
      { status: 500 }
    );
  }
}
