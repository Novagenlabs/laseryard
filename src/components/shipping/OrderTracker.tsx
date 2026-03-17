"use client";

import { useState, FormEvent } from "react";
import { Search, Loader2, Package, Check, Truck, Clock } from "lucide-react";

type OrderInfo = {
  orderNo: string;
  orderStatus: string;
  recipientName: string;
  recipientAddress: string;
  recipientState: string;
  senderName: string;
  senderAddress: string;
  createdAt: string;
};

type HistoryEntry = {
  orderStatus: string;
  statusCreationDate: string;
  statusDescription: string;
};

const STATUS_ICONS: Record<string, typeof Package> = {
  "Picked-Up": Package,
  Dispatched: Truck,
  Delivered: Check,
};

function StatusIcon({ status }: { status: string }) {
  const Icon = STATUS_ICONS[status] || Clock;
  return <Icon className="w-4 h-4" />;
}

export function OrderTracker() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setOrder(null);
    setHistory([]);
    setSearched(true);

    try {
      const res = await fetch("/api/shipping/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: trimmed }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setOrder(data.order);
        setHistory(data.history || []);
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Enter your order number"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !orderNumber.trim()}
          className="px-6 py-3 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Track"
          )}
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
              <h3 className="font-semibold">Order {order.orderNo}</h3>
              <span className="px-3 py-1 rounded-full bg-foreground/10 text-xs font-medium">
                {order.orderStatus}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Recipient</p>
                <p className="font-medium">{order.recipientName}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {order.recipientState}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Created</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {history.length > 0 && (
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-semibold mb-6">Delivery Timeline</h3>
              <div className="space-y-0">
                {history.map((entry, i) => (
                  <div key={i} className="flex gap-4">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          i === 0
                            ? "bg-foreground text-background"
                            : "bg-foreground/10 text-foreground/60"
                        }`}
                      >
                        <StatusIcon status={entry.orderStatus} />
                      </div>
                      {i < history.length - 1 && (
                        <div className="w-px h-full min-h-8 bg-border my-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pb-6 ${i === history.length - 1 ? "pb-0" : ""}`}>
                      <p className="font-medium text-sm">{entry.orderStatus}</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {entry.statusDescription}
                      </p>
                      <p className="text-muted-foreground/60 text-xs mt-1">
                        {formatDate(entry.statusCreationDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {searched && !loading && !order && !error && (
        <div className="mt-8 text-center py-12">
          <Package className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">
            No order found with that number. Check and try again.
          </p>
        </div>
      )}
    </div>
  );
}
