import { getDb } from "@/lib/db";

export const ORDER_STATUSES = [
  "received",
  "in_production",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number] | "cancelled";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Order Received",
  in_production: "In Production",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const DEFAULT_STATUS_NOTES: Record<OrderStatus, string> = {
  received: "We've received your order and it's in the queue.",
  in_production: "Your order is being engraved and finished.",
  shipped: "Your order has been handed to the courier.",
  out_for_delivery: "Your order is on its way to you today.",
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
  createdAt: string;
  updatedAt: string;
};

export type OrderEvent = {
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToEvent(row: any): OrderEvent {
  return {
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
    SELECT status, note, created_at FROM order_events
    WHERE order_id = ${order.id}
    ORDER BY created_at DESC, id DESC
  `;

  return { order, events: events.map(rowToEvent) };
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
