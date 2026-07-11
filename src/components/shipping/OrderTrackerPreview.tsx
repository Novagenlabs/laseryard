"use client";

import { DialRoot, useDialKit } from "dialkit";
import "dialkit/styles.css";
import {
  OrderTracker,
  type OrderEvent,
  type OrderInfo,
  type OrderStatus,
} from "./OrderTracker";

// Dev-only: DialKit panel to flip the /track page through every order state
// without touching the database. Rendered only when NODE_ENV=development.

const FLOW: OrderStatus[] = [
  "received",
  "in_production",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const NOTES: Record<OrderStatus, string> = {
  received: "We received your order and design brief. It is in the queue.",
  in_production: "Design approved. Engraving in progress.",
  shipped: "Engraving and QC complete. Handed to courier, waybill FZ-88214.",
  out_for_delivery: "Your package is with the rider and arriving today.",
  delivered: "Delivered. Enjoy your cards!",
  cancelled: "This order has been cancelled.",
};

const HOUR = 3600_000;

function buildPreview(d: {
  status: string;
  customerName: string;
  itemDescription: string;
  destination: string;
  placedDaysAgo: number;
}): { order: OrderInfo; events: OrderEvent[] } {
  const status = d.status as OrderStatus;
  const now = Date.now();
  const placedAt = now - d.placedDaysAgo * 24 * HOUR;

  const flow: OrderStatus[] =
    status === "cancelled"
      ? ["received", "cancelled"]
      : FLOW.slice(0, FLOW.indexOf(status) + 1);

  // Spread events evenly between order placement and ~2h ago
  const span = Math.max(now - 2 * HOUR - placedAt, HOUR);
  const events: OrderEvent[] = flow
    .map((s, i) => ({
      status: s,
      note: NOTES[s],
      createdAt: new Date(
        placedAt + (flow.length === 1 ? 0 : (span * i) / (flow.length - 1))
      ).toISOString(),
    }))
    .reverse();

  return {
    order: {
      trackingNumber: "LY-DEMO-CARD",
      customerName: d.customerName,
      itemDescription: d.itemDescription,
      destination: d.destination || null,
      status,
      createdAt: new Date(placedAt).toISOString(),
      updatedAt: new Date(now).toISOString(),
    },
    events,
  };
}

export function OrderTrackerPreview() {
  const d = useDialKit(
    "Track Page States",
    {
      livePreview: true, // off = the real page (form + DB lookup)
      status: {
        type: "select",
        default: "in_production",
        options: [...FLOW, "cancelled"],
      },
      customerName: {
        type: "text",
        default: "Ada Okafor",
        placeholder: "Customer name",
      },
      itemDescription: {
        type: "text",
        default: "100x Metal Business Cards (black anodized, custom logo)",
        placeholder: "Item description",
      },
      destination: {
        type: "text",
        default: "Lekki, Lagos",
        placeholder: "Destination",
      },
      placedDaysAgo: [4, 0, 30, 1],
    },
    { id: "track-page-states", persist: true }
  );

  return (
    <>
      <OrderTracker override={d.livePreview ? buildPreview(d) : null} />
      <DialRoot />
    </>
  );
}
