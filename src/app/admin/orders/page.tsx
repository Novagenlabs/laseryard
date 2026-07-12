"use client";

// Local admin console for order tracking. Everything goes through the
// same admin API any other app can use (Bearer ORDERS_ADMIN_KEY) —
// this page is just a thin client; the key never leaves the browser
// except as the Authorization header.

import { useCallback, useEffect, useState, FormEvent } from "react";
import { IBM_Plex_Mono } from "next/font/google";
import { Loader2, Copy, Check, Plus, RefreshCw } from "lucide-react";

const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600"] });

const STATUSES = [
  "received",
  "in_production",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

type Order = {
  trackingNumber: string;
  customerName: string;
  customerPhone: string | null;
  itemDescription: string;
  destination: string | null;
  designUrl: string | null;
  status: (typeof STATUSES)[number];
  createdAt: string;
};

const KEY_STORAGE = "ly-orders-admin-key";

export default function AdminOrdersPage() {
  const [apiKey, setApiKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");

  // create form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [destination, setDestination] = useState("");
  const [designUrl, setDesignUrl] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(KEY_STORAGE);
    if (saved) setApiKey(saved);
  }, []);

  const loadOrders = useCallback(
    async (key: string) => {
      setError("");
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${key}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setOrders(null);
        setError(
          res.status === 401
            ? "That API key was rejected."
            : data.error || "Failed to load orders."
        );
        if (res.status === 401) {
          localStorage.removeItem(KEY_STORAGE);
          setApiKey("");
        }
        return;
      }
      setOrders(data.orders);
    },
    []
  );

  useEffect(() => {
    if (apiKey) loadOrders(apiKey);
  }, [apiKey, loadOrders]);

  function handleConnect(e: FormEvent) {
    e.preventDefault();
    const key = keyInput.trim();
    if (!key) return;
    localStorage.setItem(KEY_STORAGE, key);
    setApiKey(key);
    setKeyInput("");
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          customerName,
          itemDescription,
          customerPhone: customerPhone || undefined,
          destination: destination || undefined,
          designUrl: designUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create order.");
      } else {
        setCustomerName("");
        setCustomerPhone("");
        setItemDescription("");
        setDestination("");
        setDesignUrl("");
        await loadOrders(apiKey);
        copyShareLink(data.order.trackingNumber);
      }
    } catch {
      setError("Failed to create order.");
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusChange(trackingNumber: string, status: string) {
    setError("");
    const res = await fetch(`/api/orders/${encodeURIComponent(trackingNumber)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update status.");
    }
    await loadOrders(apiKey);
  }

  function copyShareLink(trackingNumber: string) {
    const url = `${window.location.origin}/track?order=${trackingNumber}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(trackingNumber);
      setTimeout(() => setCopied(""), 2000);
    });
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/70";

  if (!apiKey) {
    return (
      <section className="pt-40 pb-24 min-h-screen">
        <div className="mx-auto max-w-sm px-4">
          <h1 className="font-[family-name:var(--font-montserrat)] text-2xl font-extrabold tracking-tight mb-2">
            Orders Console
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Paste an orders API key to connect.
          </p>
          <form onSubmit={handleConnect} className="flex flex-col gap-3">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="API key"
              className={`${plexMono.className} ${inputClass}`}
            />
            <button
              type="submit"
              disabled={!keyInput.trim()}
              className="px-6 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              Connect
            </button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-40 pb-24 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-[family-name:var(--font-montserrat)] text-2xl font-extrabold tracking-tight">
            Orders Console
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadOrders(apiKey)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-foreground/5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={() => {
                localStorage.removeItem(KEY_STORAGE);
                setApiKey("");
                setOrders(null);
              }}
              className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-foreground/5"
            >
              Disconnect
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* New order */}
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-2xl bg-card border border-border mb-10"
        >
          <p className={`${plexMono.className} text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4`}>
            New Order
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name *" required className={inputClass} />
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone (optional)" className={inputClass} />
            <input value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="Item description *" required className={`${inputClass} sm:col-span-2`} />
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination (optional)" className={inputClass} />
            <input value={designUrl} onChange={(e) => setDesignUrl(e.target.value)} placeholder="Design URL, e.g. /designs/card.svg (optional)" className={inputClass} />
          </div>
          <button
            type="submit"
            disabled={busy || !customerName.trim() || !itemDescription.trim()}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create order
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            The share link is copied to your clipboard on creation.
          </p>
        </form>

        {/* Orders */}
        <p className={`${plexMono.className} text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4`}>
          Orders
        </p>
        {orders === null ? (
          <div className="flex items-center gap-3 text-muted-foreground py-8">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8">No orders yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((o) => (
              <div
                key={o.trackingNumber}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-card border border-border"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`${plexMono.className} text-sm font-semibold`}>
                      {o.trackingNumber}
                    </span>
                    <button
                      onClick={() => copyShareLink(o.trackingNumber)}
                      title="Copy share link"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {copied === o.trackingNumber ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm truncate">{o.itemDescription}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {o.customerName}
                    {o.destination ? ` · ${o.destination}` : ""}
                    {o.customerPhone ? ` · ${o.customerPhone}` : ""}
                  </p>
                </div>
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.trackingNumber, e.target.value)}
                  className={`${plexMono.className} px-3 py-2 rounded-lg border border-border bg-background text-xs uppercase tracking-wider`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
