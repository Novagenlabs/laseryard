import { NextRequest } from "next/server";
import { getOrderWithEvents, isValidStatus, updateOrderDetails, updateOrderStatus, ORDER_STATUSES } from "@/lib/orders";
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

// Admin: update an order. Two kinds of change, combinable in one call:
//  - status (+ optional note) — appends a customer-visible timeline event
//  - detail fields (customerName, customerPhone, itemDescription,
//    destination, designUrl) — silent edits, no timeline event
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
    const { status, note, customerName, customerPhone, itemDescription, destination, designUrl } =
      body ?? {};

    const detailFields = { customerName, customerPhone, itemDescription, destination, designUrl };
    const hasDetails = Object.values(detailFields).some((v) => v !== undefined);

    if (status === undefined && !hasDetails) {
      return adminJson({ error: "Nothing to update" }, 400);
    }
    if (status !== undefined && (typeof status !== "string" || !isValidStatus(status))) {
      return adminJson(
        { error: `status must be one of: ${[...ORDER_STATUSES, "cancelled"].join(", ")}` },
        400
      );
    }
    for (const [key, value] of Object.entries(detailFields)) {
      if (value !== undefined && typeof value !== "string") {
        return adminJson({ error: `${key} must be a string` }, 400);
      }
    }
    if (customerName === "" || itemDescription === "") {
      return adminJson({ error: "customerName and itemDescription cannot be empty" }, 400);
    }

    let order = null;
    if (hasDetails) {
      order = await updateOrderDetails(trackingNumber, detailFields);
      if (!order) {
        return adminJson({ error: "Order not found" }, 404);
      }
    }
    if (status !== undefined) {
      order = await updateOrderStatus(
        trackingNumber,
        status,
        typeof note === "string" ? note : undefined
      );
      if (!order) {
        return adminJson({ error: "Order not found" }, 404);
      }
    }

    return adminJson({ order });
  } catch (e) {
    console.error("Order status update error:", e);
    return adminJson({ error: "Failed to update order" }, 500);
  }
}
