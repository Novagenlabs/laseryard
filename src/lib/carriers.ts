// Couriers we hand parcels to. We record the waybill they issue and update
// shipment status ourselves — there's no carrier API integration, so nothing
// here can fail or go stale on its own.

export const CARRIERS = ["dhl", "fedex", "ups", "fez", "other"] as const;
export type Carrier = (typeof CARRIERS)[number];

export const CARRIER_LABELS: Record<Carrier, string> = {
  dhl: "DHL",
  fedex: "FedEx",
  ups: "UPS",
  fez: "Fez Delivery",
  other: "Courier",
};

export function isValidCarrier(value: string): value is Carrier {
  return (CARRIERS as readonly string[]).includes(value);
}

export function carrierLabel(carrier: string | null | undefined): string {
  if (!carrier) return "the courier";
  return CARRIER_LABELS[carrier as Carrier] ?? "the courier";
}

// Where the customer can check the waybill on the courier's own site. We show
// this as a secondary link — our page is the primary source of truth.
export function carrierTrackingUrl(
  carrier: string | null | undefined,
  waybill: string | null | undefined
): string | null {
  if (!carrier || !waybill) return null;
  const tn = encodeURIComponent(waybill.replace(/\s+/g, ""));
  switch (carrier) {
    case "dhl":
      return `https://www.dhl.com/en/express/tracking.html?AWB=${tn}&brand=DHL`;
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${tn}`;
    case "ups":
      return `https://www.ups.com/track?tracknum=${tn}`;
    case "fez":
      return `https://fezdelivery.co/track?orderNo=${tn}`;
    default:
      return null;
  }
}
