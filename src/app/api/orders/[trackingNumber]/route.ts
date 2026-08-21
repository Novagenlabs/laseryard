import { NextRequest } from "next/server";
import { deleteOrder, getOrderWithEvents, isValidStatus, updateOrderDetails, updateOrderStatus, ORDER_STATUSES } from "@/lib/orders";
import { adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";
import { notifyOrderStatusChange } from "@/lib/order-notifications";
import { isValidCarrier, CARRIERS } from "@/lib/carriers";

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
//    destination, designUrl, carrier, waybillNumber, shipmentStatus,
//    shipmentDetail, estimatedDelivery) — silent edits, no timeline event
//
// curl -X PATCH https://laseryard.com/api/orders/LY-XXXX-XXXX \
//   -H "Authorization: Bearer $ORDERS_ADMIN_KEY" \
//   -H "Content-Type: application/json" \
//   -d '{"status":"shipped","note":"Handed to the courier"}'
//
// Record the shipment once the parcel is handed over. We maintain these
// by hand — there is no carrier API — so one call sets everything the
// order page shows:
//   -d '{"status":"shipped","carrier":"dhl","waybillNumber":"7614882903",
//        "shipmentStatus":"On the way",
//        "shipmentDetail":"Departed our studio, bound for London",
//        "estimatedDelivery":"2026-07-29"}'
export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return adminJson({ error: "Unauthorized" }, 401);
  }

  try {
    const { trackingNumber } = await context.params;
    const body = await request.json();
    const {
      status,
      note,
      customerName,
      customerPhone,
      itemDescription,
      destination,
      designUrl,
      carrier,
      waybillNumber,
      shipmentStatus,
      shipmentDetail,
      estimatedDelivery,
    } = body ?? {};

    const detailFields = {
      customerName,
      customerPhone,
      itemDescription,
      destination,
      designUrl,
      carrier,
      waybillNumber,
      shipmentStatus,
      shipmentDetail,
      estimatedDelivery,
    };
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
    // "" clears the carrier; any other value must name one we support.
    if (carrier !== undefined && carrier !== "" && !isValidCarrier(carrier)) {
      return adminJson(
        { error: `carrier must be one of: ${CARRIERS.join(", ")}` },
        400
      );
    }
    // Stored as a date column — reject anything Postgres would choke on.
    if (
      estimatedDelivery !== undefined &&
      estimatedDelivery !== "" &&
      !/^\d{4}-\d{2}-\d{2}$/.test(estimatedDelivery)
    ) {
      return adminJson(
        { error: "estimatedDelivery must be an ISO date (YYYY-MM-DD)" },
        400
      );
    }

    let order = null;
    if (hasDetails) {
      order = await updateOrderDetails(trackingNumber, detailFields);
      if (!order) {
        return adminJson({ error: "Order not found" }, 404);
      }
    }
    let notified = false;
    if (status !== undefined) {
      order = await updateOrderStatus(
        trackingNumber,
        status,
        typeof note === "string" ? note : undefined
      );
      if (!order) {
        return adminJson({ error: "Order not found" }, 404);
      }
      notified = await notifyOrderStatusChange(
        order,
        typeof note === "string" ? note : undefined
      ).catch((e) => {
        console.error("Status notification error:", e);
        return false;
      });
    }

    return adminJson({ order, notified });
  } catch (e) {
    console.error("Order status update error:", e);
    return adminJson({ error: "Failed to update order" }, 500);
  }
}

// Admin: delete an order (timeline events cascade; attached artwork in
// the designs table is removed too).
export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return adminJson({ error: "Unauthorized" }, 401);
  }

  try {
    const { trackingNumber } = await context.params;
    const deleted = await deleteOrder(trackingNumber);
    if (!deleted) {
      return adminJson({ error: "Order not found" }, 404);
    }
    return adminJson({ deleted: true });
  } catch (e) {
    console.error("Order delete error:", e);
    return adminJson({ error: "Failed to delete order" }, 500);
  }
}
