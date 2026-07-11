import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { isAdminRequest } from "@/lib/admin-auth";

// Admin: create a new trackable order.
// curl -X POST https://laseryard.com/api/orders \
//   -H "Authorization: Bearer $ORDERS_ADMIN_KEY" \
//   -H "Content-Type: application/json" \
//   -d '{"customerName":"Ada O.","itemDescription":"50x metal business cards","destination":"Lagos"}'
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { customerName, itemDescription, customerPhone, destination, trackingNumber, note } =
      body ?? {};

    if (!customerName || typeof customerName !== "string") {
      return NextResponse.json(
        { error: "customerName is required" },
        { status: 400 }
      );
    }
    if (!itemDescription || typeof itemDescription !== "string") {
      return NextResponse.json(
        { error: "itemDescription is required" },
        { status: 400 }
      );
    }

    const order = await createOrder({
      customerName,
      itemDescription,
      customerPhone: typeof customerPhone === "string" ? customerPhone : undefined,
      destination: typeof destination === "string" ? destination : undefined,
      trackingNumber: typeof trackingNumber === "string" ? trackingNumber : undefined,
      note: typeof note === "string" ? note : undefined,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message.includes("duplicate key")) {
      return NextResponse.json(
        { error: "That tracking number already exists" },
        { status: 409 }
      );
    }
    console.error("Order creation error:", e);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
