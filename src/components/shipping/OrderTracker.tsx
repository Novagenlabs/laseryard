"use client";

import { useState, FormEvent } from "react";
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
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type OrderEvent = {
  status: OrderStatus;
  note: string | null;
  createdAt: string;
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

export function OrderTracker({
  override,
}: {
  // Dev preview: render this order/timeline instead of live lookup state
  override?: { order: OrderInfo; events: OrderEvent[] } | null;
}) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [fetchedOrder, setFetchedOrder] = useState<OrderInfo | null>(null);
  const [fetchedEvents, setFetchedEvents] = useState<OrderEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const order = override ? override.order : fetchedOrder;
  const events = override ? override.events : fetchedEvents;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = trackingNumber.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setFetchedOrder(null);
    setFetchedEvents([]);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Could not look up that tracking number.");
      } else {
        setFetchedOrder(data.order);
        setFetchedEvents(data.events || []);
      }
    } catch {
      setError("Could not track order. Please try again.");
    } finally {
      setLoading(false);
    }
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

  const cancelled = order?.status === "cancelled";
  const currentStep = order
    ? STEPS.findIndex((s) => s.status === order.status)
    : -1;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={override ? override.order.trackingNumber : trackingNumber}
            readOnly={!!override}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter your tracking number (e.g. LY-XXXX-XXXX)"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow"
          />
        </div>
        <button
          type="submit"
          disabled={loading || (!override && !trackingNumber.trim()) || !!override}
          className="px-6 py-3 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Track"}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {order && (
        <div className="mt-8 space-y-6">
          {/* Order Summary */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{order.trackingNumber}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  cancelled
                    ? "bg-red-500/10 text-red-500"
                    : order.status === "delivered"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-foreground/10"
                }`}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Order</p>
                <p className="font-medium">{order.itemDescription}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  for {order.customerName}
                  {order.destination ? ` · ${order.destination}` : ""}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Placed</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Progress Stepper */}
          {!cancelled && (
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-start">
                {STEPS.map((step, i) => {
                  const done = i <= currentStep;
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.status}
                      className="flex-1 flex flex-col items-center relative"
                    >
                      {i > 0 && (
                        <div
                          className={`absolute top-4 right-1/2 w-full h-0.5 ${
                            done ? "bg-foreground" : "bg-border"
                          }`}
                        />
                      )}
                      <div
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                          done
                            ? "bg-foreground text-background"
                            : "bg-card border border-border text-foreground/40"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <p
                        className={`mt-2 text-[11px] sm:text-xs text-center leading-tight ${
                          i === currentStep
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

          {/* Timeline */}
          {events.length > 0 && (
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-semibold mb-6">Order Timeline</h3>
              <div className="space-y-0">
                {events.map((entry, i) => {
                  const Icon = statusIcon(entry.status);
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            i === 0
                              ? "bg-foreground text-background"
                              : "bg-foreground/10 text-foreground/60"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {i < events.length - 1 && (
                          <div className="w-px h-full min-h-8 bg-border my-1" />
                        )}
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
                        <p className="text-muted-foreground/60 text-xs mt-1">
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
      )}
    </div>
  );
}
