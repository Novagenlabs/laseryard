import { getDb } from "@/lib/db";
import type { Carrier } from "@/lib/carriers";

export const ORDER_STATUSES = [
  "received",
  "processing",
  "in_production",
  "quality_check",
  "approved",
  "shipped",
  "delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number] | "cancelled";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Order Received",
  processing: "Processing",
  in_production: "In Production",
  quality_check: "Quality Check",
  approved: "Approved",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const DEFAULT_STATUS_NOTES: Record<OrderStatus, string> = {
  received: "We've received your order and it's in the queue.",
  processing: "We're preparing your design files for production.",
  in_production: "Your order is being engraved and finished.",
  quality_check: "Your order is going through quality inspection.",
  approved: "Quality check passed. Your order is ready to ship.",
  shipped: "Your order has been handed to the courier.",
  delivered: "Your order has been delivered.",
  cancelled: "This order has been cancelled.",
};

export function isValidStatus(value: string): value is OrderStatus {
  return value === "cancelled" || (ORDER_STATUSES as readonly string[]).includes(value);
}

export type Order = {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerPhone: string | null;
  itemDescription: string;
  destination: string | null;
  designUrl: string | null;
  status: OrderStatus;
  // Shipment details, all maintained by us — no carrier API involved.
  // The waybill is the courier's number, distinct from trackingNumber
  // (our own LY-XXXX-XXXX reference).
  carrier: Carrier | null;
  waybillNumber: string | null;
  shipmentStatus: string | null;
  shipmentDetail: string | null;
  estimatedDelivery: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderEvent = {
  id: number;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
};

// Unambiguous charset: no 0/O, 1/I/L to keep tracking numbers easy to
// read back over WhatsApp or the phone.
const TRACKING_CHARSET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateTrackingNumber(): string {
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  for (const b of bytes) {
    code += TRACKING_CHARSET[b % TRACKING_CHARSET.length];
  }
  return `LY-${code.slice(0, 4)}-${code.slice(4)}`;
}

export function normalizeTrackingNumber(input: string): string {
  return input.trim().toUpperCase();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToOrder(row: any): Order {
  return {
    id: row.id,
    trackingNumber: row.tracking_number,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    itemDescription: row.item_description,
    destination: row.destination,
    designUrl: row.design_url,
    status: row.status,
    carrier: row.carrier ?? null,
    waybillNumber: row.waybill_number ?? null,
    shipmentStatus: row.shipment_status ?? null,
    shipmentDetail: row.shipment_detail ?? null,
    estimatedDelivery: row.estimated_delivery
      ? new Date(row.estimated_delivery).toISOString().slice(0, 10)
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToEvent(row: any): OrderEvent {
  return {
    id: Number(row.id),
    status: row.status,
    note: row.note,
    createdAt: row.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getOrderWithEvents(
  trackingNumber: string
): Promise<{ order: Order; events: OrderEvent[] } | null> {
  const sql = getDb();
  const tn = normalizeTrackingNumber(trackingNumber);

  const orders = await sql`
    SELECT * FROM orders WHERE tracking_number = ${tn} LIMIT 1
  `;
  if (orders.length === 0) return null;

  const order = rowToOrder(orders[0]);
  const events = await sql`
    SELECT id, status, note, created_at FROM order_events
    WHERE order_id = ${order.id}
    ORDER BY created_at DESC, id DESC
  `;

  return { order, events: events.map(rowToEvent) };
}

export async function listOrders(limit = 100): Promise<Order[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM orders ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows.map(rowToOrder);
}

export async function createOrder(input: {
  customerName: string;
  itemDescription: string;
  customerPhone?: string;
  destination?: string;
  designUrl?: string;
  trackingNumber?: string;
  note?: string;
}): Promise<Order> {
  const sql = getDb();
  const tn = input.trackingNumber
    ? normalizeTrackingNumber(input.trackingNumber)
    : generateTrackingNumber();

  const rows = await sql`
    INSERT INTO orders (tracking_number, customer_name, customer_phone, item_description, destination, design_url)
    VALUES (${tn}, ${input.customerName}, ${input.customerPhone ?? null}, ${input.itemDescription}, ${input.destination ?? null}, ${input.designUrl ?? null})
    RETURNING *
  `;
  const order = rowToOrder(rows[0]);

  await sql`
    INSERT INTO order_events (order_id, status, note)
    VALUES (${order.id}, 'received', ${input.note ?? DEFAULT_STATUS_NOTES.received})
  `;

  return order;
}

// Update order details (not status). Undefined fields are left unchanged;
// empty strings clear the optional fields.
export async function updateOrderDetails(
  trackingNumber: string,
  fields: {
    customerName?: string;
    customerPhone?: string;
    itemDescription?: string;
    destination?: string;
    designUrl?: string;
    carrier?: string;
    waybillNumber?: string;
    shipmentStatus?: string;
    shipmentDetail?: string;
    estimatedDelivery?: string;
  }
): Promise<Order | null> {
  const sql = getDb();
  const tn = normalizeTrackingNumber(trackingNumber);

  const existing = await sql`
    SELECT * FROM orders WHERE tracking_number = ${tn} LIMIT 1
  `;
  if (existing.length === 0) return null;
  const cur = rowToOrder(existing[0]);

  const merged = {
    customerName: fields.customerName ?? cur.customerName,
    customerPhone:
      fields.customerPhone === undefined
        ? cur.customerPhone
        : fields.customerPhone || null,
    itemDescription: fields.itemDescription ?? cur.itemDescription,
    destination:
      fields.destination === undefined
        ? cur.destination
        : fields.destination || null,
    designUrl:
      fields.designUrl === undefined ? cur.designUrl : fields.designUrl || null,
    carrier:
      fields.carrier === undefined
        ? cur.carrier
        : ((fields.carrier || null) as Carrier | null),
    waybillNumber:
      fields.waybillNumber === undefined
        ? cur.waybillNumber
        : fields.waybillNumber.trim().toUpperCase() || null,
    shipmentStatus:
      fields.shipmentStatus === undefined
        ? cur.shipmentStatus
        : fields.shipmentStatus.trim() || null,
    shipmentDetail:
      fields.shipmentDetail === undefined
        ? cur.shipmentDetail
        : fields.shipmentDetail.trim() || null,
    estimatedDelivery:
      fields.estimatedDelivery === undefined
        ? cur.estimatedDelivery
        : fields.estimatedDelivery.trim() || null,
  };

  const rows = await sql`
    UPDATE orders SET
      customer_name = ${merged.customerName},
      customer_phone = ${merged.customerPhone},
      item_description = ${merged.itemDescription},
      destination = ${merged.destination},
      design_url = ${merged.designUrl},
      carrier = ${merged.carrier},
      waybill_number = ${merged.waybillNumber},
      shipment_status = ${merged.shipmentStatus},
      shipment_detail = ${merged.shipmentDetail},
      estimated_delivery = ${merged.estimatedDelivery},
      updated_at = now()
    WHERE tracking_number = ${tn}
    RETURNING *
  `;
  return rowToOrder(rows[0]);
}

// Delete a single timeline event; only if it belongs to the order.
export async function deleteOrderEvent(
  trackingNumber: string,
  eventId: number
): Promise<boolean> {
  const sql = getDb();
  const tn = normalizeTrackingNumber(trackingNumber);
  const rows = await sql`
    DELETE FROM order_events WHERE id = ${eventId} AND order_id = (
      SELECT id FROM orders WHERE tracking_number = ${tn}
    ) RETURNING id
  `;
  return rows.length > 0;
}

// Delete an order (events cascade via FK). If the artwork lives in our
// designs table, remove that too.
export async function deleteOrder(trackingNumber: string): Promise<boolean> {
  const sql = getDb();
  const tn = normalizeTrackingNumber(trackingNumber);

  const rows = await sql`
    DELETE FROM orders WHERE tracking_number = ${tn} RETURNING design_url
  `;
  if (rows.length === 0) return false;

  const designUrl: string | null = rows[0].design_url;
  const m = designUrl?.match(/^\/api\/designs\/([0-9a-f-]{36})$/i);
  if (m) {
    await sql`DELETE FROM designs WHERE id = ${m[1]}`;
  }
  return true;
}

export async function updateOrderStatus(
  trackingNumber: string,
  status: OrderStatus,
  note?: string
): Promise<Order | null> {
  const sql = getDb();
  const tn = normalizeTrackingNumber(trackingNumber);

  const rows = await sql`
    UPDATE orders SET status = ${status}, updated_at = now()
    WHERE tracking_number = ${tn}
    RETURNING *
  `;
  if (rows.length === 0) return null;

  const order = rowToOrder(rows[0]);
  await sql`
    INSERT INTO order_events (order_id, status, note)
    VALUES (${order.id}, ${status}, ${note ?? DEFAULT_STATUS_NOTES[status]})
  `;

  return order;
}
