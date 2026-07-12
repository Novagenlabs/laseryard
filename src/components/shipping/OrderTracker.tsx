"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IBM_Plex_Mono } from "next/font/google";
import {
  Search,
  Loader2,
  Package,
  Check,
  Truck,
  Flame,
  MapPin,
  ClipboardCheck,
  XCircle,
} from "lucide-react";
import styles from "./OrderTracker.module.css";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
});

export type OrderStatus =
  | "received"
  | "in_production"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderInfo = {
  trackingNumber: string;
  customerName: string;
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

// Visual tuning knobs (dev DialKit panel); omit for the production look
export type TrackerLook = {
  plateStyle?: "steel" | "anodized" | "brass";
  laserColor?: string;
  glow?: number; // 0–2
  sparkSpeed?: number; // seconds per pass
  pulseSpeed?: number; // seconds per pulse
  engraveDepth?: number; // px
  cardRadius?: number; // px
  sheen?: boolean;
  beamEdge?: boolean;
  screws?: boolean;
};

const STEPS: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: "received", label: "Received", icon: ClipboardCheck },
  { status: "in_production", label: "In Production", icon: Flame },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
  { status: "delivered", label: "Delivered", icon: Check },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Order Received",
  in_production: "In Production",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function statusIcon(status: OrderStatus) {
  if (status === "cancelled") return XCircle;
  return STEPS.find((s) => s.status === status)?.icon ?? Package;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Minimal search: navigates to /track?order=… ─────────────────── */

export function TrackSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/track?order=${encodeURIComponent(trimmed.toUpperCase())}`);
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${styles.tracker}`}>
      <h1 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-[40px] font-extrabold tracking-tight text-center mb-12">
        Track Your Order
      </h1>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter your order number"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className={`${plexMono.className} w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-gold/70 transition-shadow`}
          />
        </div>
        <button
          type="submit"
          disabled={!value.trim()}
          className={`${styles.trackButton} px-6 py-3 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50`}
        >
          Track
        </button>
      </form>
    </div>
  );
}

/* ── Details view: driven by the order number in the URL ─────────── */

export function OrderDetails({
  trackingNumber,
  override,
  look,
}: {
  trackingNumber: string;
  // Dev preview: render this order/timeline instead of fetching
  override?: { order: OrderInfo; events: OrderEvent[] } | null;
  look?: TrackerLook;
}) {
  const [fetched, setFetched] = useState<{
    order: OrderInfo;
    events: OrderEvent[];
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (override) return;
    let alive = true;

    fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!alive) return;
        if (!res.ok || data.error) {
          setError(data.error || "Could not look up that order number.");
        } else {
          setFetched({ order: data.order, events: data.events || [] });
        }
      })
      .catch(() => {
        if (alive) setError("Could not track order. Please try again.");
      });

    return () => {
      alive = false;
    };
  }, [trackingNumber, override]);

  const order = override ? override.order : fetched?.order;
  const events = override ? override.events : (fetched?.events ?? []);

  const cancelled = order?.status === "cancelled";
  const delivered = order?.status === "delivered";
  const currentStep = order
    ? STEPS.findIndex((s) => s.status === order.status)
    : -1;

  const showScrews = look?.screws ?? false;
  const showBeamEdge = look?.beamEdge ?? false;
  const plateClass =
    look?.plateStyle === "anodized"
      ? styles.plateAnodized
      : look?.plateStyle === "brass"
        ? styles.plateBrass
        : "";
  const lookVars = {
    ...(look?.laserColor ? { "--laser": look.laserColor } : {}),
    ...(look?.glow !== undefined ? { "--glow": look.glow } : {}),
    ...(look?.sparkSpeed !== undefined ? { "--spark-s": `${look.sparkSpeed}s` } : {}),
    ...(look?.pulseSpeed !== undefined ? { "--pulse-s": `${look.pulseSpeed}s` } : {}),
    ...(look?.engraveDepth !== undefined ? { "--engrave": `${look.engraveDepth}px` } : {}),
    ...(look?.cardRadius !== undefined ? { "--card-r": `${look.cardRadius}px` } : {}),
  } as React.CSSProperties;

  const loading = !override && !fetched && !error;

  const header = (
    <>
      <h1 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-[40px] font-extrabold tracking-tight text-center">
        Order {(order?.trackingNumber ?? trackingNumber).toUpperCase()}
      </h1>
      <div className="w-full flex mt-2">
        <Link
          href="/track"
          className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
        >
          <span aria-hidden>&lsaquo;</span> Back
        </Link>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className={`w-full max-w-2xl mx-auto ${styles.tracker}`}>
        {header}
        <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className={`${plexMono.className} text-sm tracking-widest uppercase`}>
            Locating {trackingNumber}
          </span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={`w-full max-w-2xl mx-auto ${styles.tracker}`}>
        {header}
        <div className={`${styles.reveal} mt-8 p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center`}>
          <p className="text-sm text-red-500">
            {error || "No order found with that number."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-2xl mx-auto ${styles.tracker}`}
      style={lookVars}
    >
      {header}
      <div className="space-y-4 mt-8" key={order.trackingNumber + order.status}>
        {/* Job Ticket */}
        <div className={`${styles.reveal} ${styles.card} bg-card border border-border overflow-hidden`}>
          {showBeamEdge && <div className={styles.beamEdge} />}
          <div className="p-6 flex flex-col sm:flex-row gap-5 items-start">
            <div
              className={`${styles.plate} ${plateClass} ${
                look?.sheen === false ? styles.plateStill : ""
              } w-full sm:w-[360px] h-[215px] shrink-0 flex flex-col gap-2`}
            >
              {showScrews && (
                <>
                  <span className={styles.screw} style={{ top: 7, left: 7 }} />
                  <span className={styles.screw} style={{ top: 7, right: 7 }} />
                  <span className={styles.screw} style={{ bottom: 7, left: 7 }} />
                  <span className={styles.screw} style={{ bottom: 7, right: 7 }} />
                </>
              )}
              <p className={`${plexMono.className} ${styles.plateLabel} text-[10px] font-medium uppercase`}>
                Laser Yard · Job Ticket
              </p>
              <div className="flex items-center justify-between gap-3">
                <h3 className={`${plexMono.className} ${styles.engraved} text-[26px] leading-8 font-semibold`}>
                  {order.trackingNumber}
                </h3>
                <span
                  className={`${plexMono.className} ${styles.stamp} ${
                    cancelled ? `${styles.stampCancelled} text-red-600` : ""
                  } ${delivered ? "text-gold-dark" : ""} ${
                    !cancelled && !delivered ? styles.stampNeutral : ""
                  } text-[11px] font-semibold uppercase shrink-0`}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </div>

              {/* The job itself: customer's design on the plate */}
              {order.designUrl && (
                <div className="flex flex-1 min-h-0 justify-center items-center pt-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.designUrl}
                    alt={`Design preview for ${order.trackingNumber}`}
                    className={styles.designPreview}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6 text-sm flex-1">
              <div className="flex flex-col gap-1">
                <p className={`${plexMono.className} text-[10px] uppercase tracking-[0.2em] text-muted-foreground`}>
                  Order
                </p>
                <p className="font-medium">{order.itemDescription}</p>
                <p className="text-muted-foreground text-xs">
                  for {order.customerName}
                  {order.destination ? ` · ${order.destination}` : ""}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className={`${plexMono.className} text-[10px] uppercase tracking-[0.2em] text-muted-foreground`}>
                  Placed
                </p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Laser Stepper */}
        {!cancelled && (
          <div className={`${styles.reveal} ${styles.revealDelay1} ${styles.card} p-6 bg-card border border-border shadow-sm`}>
            <div className="flex items-start">
              {STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep && !delivered;
                const Icon = step.icon;
                return (
                  <div
                    key={step.status}
                    className="flex-1 flex flex-col items-center relative"
                  >
                    {i > 0 && (
                      <div className="absolute top-4 right-1/2 w-full h-[3px] -mt-px overflow-visible rounded-full">
                        <div
                          className={`h-full w-full rounded-full ${
                            done ? styles.trackDone : styles.trackTodo
                          }`}
                        />
                        {active && <span className={styles.spark} />}
                      </div>
                    )}
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                        active
                          ? styles.nodeActive
                          : done
                            ? delivered && i === STEPS.length - 1
                              ? styles.nodeFinal
                              : "bg-foreground text-background"
                            : "bg-card border border-border text-foreground/40"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <p
                      className={`mt-2 text-[11px] sm:text-xs text-center leading-tight ${
                        active
                          ? "font-semibold"
                          : done
                            ? "text-foreground/70"
                            : "text-muted-foreground/60"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Job Log */}
        {events.length > 0 && (
          <div className={`${styles.reveal} ${styles.revealDelay2} ${styles.card} p-6 bg-card border border-border shadow-sm`}>
            <p className={`${plexMono.className} text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6`}>
              Job Log
            </p>
            <div className="space-y-0">
              {events.map((entry, i) => {
                const Icon = statusIcon(entry.status);
                const latest = i === 0;
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          latest
                            ? `bg-foreground text-background ${
                                entry.status === "cancelled"
                                  ? styles.logLatestDotCancelled
                                  : styles.logLatestDot
                              }`
                            : "bg-foreground/10 text-foreground/60"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {i < events.length - 1 && <div className={styles.rail} />}
                    </div>

                    <div className={i === events.length - 1 ? "pb-0" : "pb-6"}>
                      <p className="font-medium text-sm">
                        {STATUS_LABELS[entry.status] ?? entry.status}
                      </p>
                      {entry.note && (
                        <p className="text-muted-foreground text-xs mt-1">
                          {entry.note}
                        </p>
                      )}
                      <p className={`${plexMono.className} text-muted-foreground/70 text-[11px] mt-1`}>
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
