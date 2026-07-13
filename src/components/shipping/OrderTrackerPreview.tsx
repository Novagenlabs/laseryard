"use client";

import { DialRoot, useDialKit } from "dialkit";
import "dialkit/styles.css";
import {
  OrderDetails,
  TrackSearch,
  type OrderEvent,
  type OrderInfo,
  type OrderStatus,
  type TrackerLook,
} from "./OrderTracker";

// Dev-only: DialKit panel to flip the /track page through every order state
// and tune the job-ticket look, without touching the database.
// Rendered only when NODE_ENV=development.

const FLOW: OrderStatus[] = [
  "received",
  "processing",
  "in_production",
  "quality_check",
  "approved",
  "shipped",
  "delivered",
];

const NOTES: Record<OrderStatus, string> = {
  received: "We received your order and design brief. It is in the queue.",
  processing: "Design files prepared and queued for the laser.",
  in_production: "Engraving in progress.",
  quality_check: "Inspecting every card against the approved design.",
  approved: "Quality check passed. Packing your order.",
  shipped: "Handed to courier, waybill FZ-88214.",
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
  showDesign: boolean;
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
      designUrl: d.showDesign ? "/designs/barista-card.svg" : null,
      status,
      createdAt: new Date(placedAt).toISOString(),
      updatedAt: new Date(now).toISOString(),
    },
    events,
  };
}

export function OrderTrackerPreview({ orderParam }: { orderParam?: string }) {
  const d = useDialKit(
    "Track Page",
    {
      livePreview: false, // on = force the demo order + dial state
      state: {
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
        showDesign: true,
      },
      look: {
        plateStyle: {
          type: "select",
          default: "auto",
          options: ["auto", "steel", "anodized", "brass"],
        },
        laserColor: { type: "color", default: "#eec335" },
        glow: [1, 0, 2, 0.05],
        engraveDepth: [1, 0, 2.5, 0.1],
        cardRadius: [16, 0, 28, 1],
        sheen: true,
        beamEdge: false,
        screws: false,
      },
      motion: {
        sparkSpeed: [2.2, 0.5, 5, 0.1],
        pulseSpeed: [1.6, 0.5, 4, 0.1],
      },
    },
    { id: "track-page-v3", persist: true }
  );

  const look: TrackerLook = {
    plateStyle:
      d.look.plateStyle === "auto"
        ? undefined
        : (d.look.plateStyle as TrackerLook["plateStyle"]),
    laserColor: d.look.laserColor,
    glow: d.look.glow,
    engraveDepth: d.look.engraveDepth,
    cardRadius: d.look.cardRadius,
    sheen: d.look.sheen,
    beamEdge: d.look.beamEdge,
    screws: d.look.screws,
    sparkSpeed: d.motion.sparkSpeed,
    pulseSpeed: d.motion.pulseSpeed,
  };

  return (
    <>
      {d.livePreview ? (
        <OrderDetails
          trackingNumber="LY-DEMO-CARD"
          override={buildPreview(d.state)}
          look={look}
        />
      ) : orderParam ? (
        <OrderDetails trackingNumber={orderParam} look={look} />
      ) : (
        <TrackSearch />
      )}
      <DialRoot />
    </>
  );
}
