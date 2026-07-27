import { getDb } from "@/lib/db";

// Live carrier tracking. We store the courier's waybill on the order and
// pull transit events from the carrier's API so customers stay on our
// site instead of being bounced to dhl.com.
//
// DHL's Unified Shipment Tracking API is rate limited (250 calls/day and
// 1 call per 5s on the free tier), so every lookup goes through a DB
// cache. A page view costs a carrier call at most once per CACHE_TTL_MS.

const DHL_API_URL = "https://api-eu.dhl.com/track/shipments";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
// Once a shipment is delivered its events never change again, so the
// cached copy can be served indefinitely.
const DELIVERED_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const CARRIERS = ["dhl", "fez", "other"] as const;
export type Carrier = (typeof CARRIERS)[number];

export const CARRIER_LABELS: Record<Carrier, string> = {
  dhl: "DHL",
  fez: "Fez Delivery",
  other: "Courier",
};

export function isValidCarrier(value: string): value is Carrier {
  return (CARRIERS as readonly string[]).includes(value);
}

export type CarrierEvent = {
  timestamp: string;
  description: string;
  location: string | null;
};

export type CarrierTracking = {
  carrier: Carrier;
  trackingNumber: string;
  status: string | null;
  statusDetail: string | null;
  estimatedDelivery: string | null;
  delivered: boolean;
  events: CarrierEvent[];
  /** External URL, kept as a fallback link — not the primary path. */
  carrierUrl: string;
  fetchedAt: string;
};

export function carrierTrackingUrl(
  carrier: Carrier,
  trackingNumber: string
): string {
  const tn = encodeURIComponent(trackingNumber);
  if (carrier === "dhl") {
    return `https://www.dhl.com/en/express/tracking.html?AWB=${tn}&brand=DHL`;
  }
  if (carrier === "fez") {
    return `https://fezdelivery.co/track?orderNo=${tn}`;
  }
  return "";
}

/* ── DHL Unified Shipment Tracking ────────────────────────────────── */

/* eslint-disable @typescript-eslint/no-explicit-any */
function parseDhl(data: any, trackingNumber: string): CarrierTracking | null {
  const shipment = data?.shipments?.[0];
  if (!shipment) return null;

  const events: CarrierEvent[] = Array.isArray(shipment.events)
    ? shipment.events
        .map((e: any) => ({
          timestamp: e?.timestamp ?? "",
          description: e?.description || e?.status || "Update",
          location: e?.location?.address?.addressLocality ?? null,
        }))
        .filter((e: CarrierEvent) => e.timestamp)
    : [];

  // DHL returns events oldest-first; our timeline renders newest-first.
  events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const statusCode: string | undefined = shipment.status?.statusCode;

  return {
    carrier: "dhl",
    trackingNumber,
    status: shipment.status?.status ?? shipment.status?.description ?? null,
    statusDetail: shipment.status?.description ?? null,
    estimatedDelivery: shipment.estimatedTimeOfDelivery ?? null,
    delivered: statusCode === "delivered",
    events,
    carrierUrl: carrierTrackingUrl("dhl", trackingNumber),
    fetchedAt: new Date().toISOString(),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function fetchDhl(trackingNumber: string): Promise<CarrierTracking | null> {
  const key = process.env.DHL_API_KEY;
  if (!key) return null;

  const url = `${DHL_API_URL}?trackingNumber=${encodeURIComponent(trackingNumber)}`;
  const res = await fetch(url, {
    headers: { "DHL-API-Key": key, Accept: "application/json" },
    // Never let a slow carrier API hang the order page.
    signal: AbortSignal.timeout(8000),
  });

  // 404 = DHL has no record yet (label created but not scanned). Treat it
  // the same as "no data" rather than an error.
  if (res.status === 404) return null;
  if (res.status === 429) {
    console.warn("DHL tracking rate limit hit");
    return null;
  }
  if (!res.ok) {
    console.error("DHL tracking failed:", res.status);
    return null;
  }

  return parseDhl(await res.json(), trackingNumber);
}

/* ── Cache ────────────────────────────────────────────────────────── */

async function readCache(
  trackingNumber: string
): Promise<{ tracking: CarrierTracking; fetchedAt: Date } | null> {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT payload, fetched_at FROM carrier_tracking_cache
      WHERE tracking_number = ${trackingNumber} LIMIT 1
    `;
    if (rows.length === 0) return null;
    return {
      tracking: rows[0].payload as CarrierTracking,
      fetchedAt: new Date(rows[0].fetched_at),
    };
  } catch (e) {
    console.error("Carrier cache read failed:", e);
    return null;
  }
}

async function writeCache(tracking: CarrierTracking): Promise<void> {
  try {
    const sql = getDb();
    await sql`
      INSERT INTO carrier_tracking_cache (tracking_number, carrier, payload, fetched_at)
      VALUES (${tracking.trackingNumber}, ${tracking.carrier}, ${JSON.stringify(tracking)}, now())
      ON CONFLICT (tracking_number) DO UPDATE
        SET carrier = EXCLUDED.carrier,
            payload = EXCLUDED.payload,
            fetched_at = now()
    `;
  } catch (e) {
    console.error("Carrier cache write failed:", e);
  }
}

/**
 * Live tracking for a courier waybill, cached.
 *
 * Returns null when we can't get carrier data — no API key configured,
 * the carrier has no record yet, or the API is down. Callers should fall
 * back to our own order timeline rather than showing an error: a missing
 * carrier feed is normal for the first hours after a label is created.
 */
export async function getCarrierTracking(
  carrier: Carrier,
  trackingNumber: string
): Promise<CarrierTracking | null> {
  const cached = await readCache(trackingNumber);
  if (cached) {
    const age = Date.now() - cached.fetchedAt.getTime();
    const ttl = cached.tracking.delivered
      ? DELIVERED_CACHE_TTL_MS
      : CACHE_TTL_MS;
    if (age < ttl) return cached.tracking;
  }

  let fresh: CarrierTracking | null = null;
  try {
    if (carrier === "dhl") {
      fresh = await fetchDhl(trackingNumber);
    }
    // Fez exposes tracking via our own order number, which the tracker
    // already surfaces through the job log — no separate lookup here.
  } catch (e) {
    console.error("Carrier tracking fetch failed:", e);
  }

  if (fresh) {
    await writeCache(fresh);
    return fresh;
  }

  // Fetch failed but we have something stale — better than nothing.
  return cached?.tracking ?? null;
}
