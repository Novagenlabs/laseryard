import { NextRequest, NextResponse } from "next/server";
import { getOrderWithEvents, isValidStatus, updateOrderStatus, ORDER_STATUSES } from "@/lib/orders";
import { isAdminRequest } from "@/lib/admin-auth";

type RouteContext = { params: Promise<{ trackingNumber: string }> };

// Admin: fetch full order (including phone) with its event history.
export async function GET(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { trackingNumber } = await context.params;
    const result = await getOrderWithEvents(trackingNumber);
    if (!result) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (e) {
    console.error("Order fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

// Admin: update order status (appends a timeline event).
// curl -X PATCH https://laseryard.com/api/orders/LY-XXXX-XXXX \
//   -H "Authorization: Bearer $ORDERS_ADMIN_KEY" \
//   -H "Content-Type: application/json" \
//   -d '{"status":"shipped","note":"Handed to Fez, waybill 12345"}'
export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { trackingNumber } = await context.params;
    const body = await request.json();
    const { status, note } = body ?? {};

    if (!status || typeof status !== "string" || !isValidStatus(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${[...ORDER_STATUSES, "cancelled"].join(", ")}` },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(
      trackingNumber,
      status,
      typeof note === "string" ? note : undefined
    );
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (e) {
    console.error("Order status update error:", e);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
