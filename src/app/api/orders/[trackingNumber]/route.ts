import { NextRequest } from "next/server";
import { getOrderWithEvents, isValidStatus, updateOrderStatus, ORDER_STATUSES } from "@/lib/orders";
import { adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";

export function OPTIONS() {
  return adminPreflight();
}

type RouteContext = { params: Promise<{ trackingNumber: string }> };

// Admin: fetch full order (including phone) with its event history.
export async function GET(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return adminJson({ error: "Unauthorized" }, 401);
  }

  try {
    const { trackingNumber } = await context.params;
    const result = await getOrderWithEvents(trackingNumber);
    if (!result) {
      return adminJson({ error: "Order not found" }, 404);
    }
    return adminJson(result);
  } catch (e) {
    console.error("Order fetch error:", e);
    return adminJson({ error: "Failed to fetch order" }, 500);
  }
}

// Admin: update order status (appends a timeline event).
// curl -X PATCH https://laseryard.com/api/orders/LY-XXXX-XXXX \
//   -H "Authorization: Bearer $ORDERS_ADMIN_KEY" \
//   -H "Content-Type: application/json" \
//   -d '{"status":"shipped","note":"Handed to Fez, waybill 12345"}'
export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return adminJson({ error: "Unauthorized" }, 401);
  }

  try {
    const { trackingNumber } = await context.params;
    const body = await request.json();
    const { status, note } = body ?? {};

    if (!status || typeof status !== "string" || !isValidStatus(status)) {
      return adminJson(
        { error: `status must be one of: ${[...ORDER_STATUSES, "cancelled"].join(", ")}` },
        400
      );
    }

    const order = await updateOrderStatus(
      trackingNumber,
      status,
      typeof note === "string" ? note : undefined
    );
    if (!order) {
      return adminJson({ error: "Order not found" }, 404);
    }

    return adminJson({ order });
  } catch (e) {
    console.error("Order status update error:", e);
    return adminJson({ error: "Failed to update order" }, 500);
  }
}
