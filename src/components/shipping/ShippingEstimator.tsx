"use client";

import { useState, useEffect } from "react";
import { Truck, Loader2 } from "lucide-react";

type FezState = { id: number; state: string };
type CostResult = {
  state: string;
  cost: number;
  vat: number;
  totalCost: number;
};

export function ShippingEstimator() {
  const [states, setStates] = useState<FezState[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [cost, setCost] = useState<CostResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/shipping/states")
      .then((r) => r.json())
      .then((data) => {
        if (data.states) {
          const sorted = [...data.states].sort((a: FezState, b: FezState) =>
            a.state.localeCompare(b.state)
          );
          setStates(sorted);
        }
      })
      .catch(() => setError("Could not load states"))
      .finally(() => setStatesLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedState) {
      setCost(null);
      return;
    }

    setLoading(true);
    setError("");
    setCost(null);

    fetch("/api/shipping/cost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: selectedState }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setCost(data);
        }
      })
      .catch(() => setError("Could not fetch delivery cost"))
      .finally(() => setLoading(false));
  }, [selectedState]);

  const formatNaira = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-2.5 mb-4">
        <Truck className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Delivery Estimate</h3>
      </div>

      {statesLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading states...
        </div>
      ) : (
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow"
        >
          <option value="">Select your state</option>
          {states.map((s) => (
            <option key={s.id} value={s.state}>
              {s.state}
            </option>
          ))}
        </select>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          Calculating...
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-3">{error}</p>
      )}

      {cost && !loading && (
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery to {cost.state}</span>
            <span>{formatNaira(cost.cost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">VAT</span>
            <span>{formatNaira(cost.vat)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border">
            <span>Estimated Total</span>
            <span>{formatNaira(cost.totalCost)}</span>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Shipping cost for standard delivery. Final amount confirmed at checkout.
          </p>
        </div>
      )}
    </div>
  );
}
