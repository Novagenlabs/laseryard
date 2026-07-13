import { NextRequest } from "next/server";
import { deleteOrderEvent } from "@/lib/orders";
import { adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";

export function OPTIONS() {
  return adminPreflight();
}

// Admin: delete a single timeline entry (fix a mis-click without
// touching the order's current status).
// curl -X DELETE https://laseryard.com/api/orders/LY-XXXX-XXXX/events/42 \
//   -H "Authorization: Bearer $ORDERS_ADMIN_KEY"
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ trackingNumber: string; eventId: string }> }
) {
  if (!isAdminRequest(request)) {
    return adminJson({ error: "Unauthorized" }, 401);
  }

  try {
    const { trackingNumber, eventId } = await context.params;
    const id = Number(eventId);
    if (!Number.isInteger(id) || id <= 0) {
      return adminJson({ error: "Invalid event id" }, 400);
    }
    const deleted = await deleteOrderEvent(trackingNumber, id);
    if (!deleted) {
      return adminJson({ error: "Event not found on that order" }, 404);
    }
    return adminJson({ deleted: true });
  } catch (e) {
    console.error("Event delete error:", e);
    return adminJson({ error: "Failed to delete event" }, 500);
  }
}
