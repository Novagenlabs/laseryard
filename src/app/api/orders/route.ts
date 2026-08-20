import { NextRequest } from "next/server";
import { createOrder, getFeedbackByOrderIds, listOrders } from "@/lib/orders";
import { adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";

export function OPTIONS() {
  return adminPreflight();
}

// Admin: list recent orders (newest first).
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return adminJson({ error: "Unauthorized" }, 401);
  }

  try {
    const orders = await listOrders();
    // Attach any customer feedback so the console can show it inline.
    const feedback = await getFeedbackByOrderIds(orders.map((o) => o.id));
    return adminJson({
      orders: orders.map((o) => ({ ...o, feedback: feedback[o.id] ?? null })),
    });
  } catch (e) {
    console.error("Order list error:", e);
    return adminJson({ error: "Failed to list orders" }, 500);
  }
}

// Admin: create a new trackable order.
// curl -X POST https://laseryard.com/api/orders \
//   -H "Authorization: Bearer $ORDERS_ADMIN_KEY" \
//   -H "Content-Type: application/json" \
//   -d '{"customerName":"Ada O.","itemDescription":"50x metal business cards","destination":"London"}'
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return adminJson({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await request.json();
    const { customerName, itemDescription, customerPhone, destination, designUrl, trackingNumber, note } =
      body ?? {};

    if (!customerName || typeof customerName !== "string") {
      return adminJson({ error: "customerName is required" }, 400);
    }
    if (!itemDescription || typeof itemDescription !== "string") {
      return adminJson({ error: "itemDescription is required" }, 400);
    }

    const order = await createOrder({
      customerName,
      itemDescription,
      customerPhone: typeof customerPhone === "string" ? customerPhone : undefined,
      destination: typeof destination === "string" ? destination : undefined,
      designUrl: typeof designUrl === "string" ? designUrl : undefined,
      trackingNumber: typeof trackingNumber === "string" ? trackingNumber : undefined,
      note: typeof note === "string" ? note : undefined,
    });

    return adminJson({ order }, 201);
  } catch (e) {
    if (e instanceof Error && e.message.includes("duplicate key")) {
      return adminJson({ error: "That tracking number already exists" }, 409);
    }
    console.error("Order creation error:", e);
    return adminJson({ error: "Failed to create order" }, 500);
  }
}
