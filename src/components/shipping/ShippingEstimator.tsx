"use client";

import { useState, useEffect } from "react";
import { Truck, Loader2 } from "lucide-react";

type FezState = { id: number; state: string };
type ExportLocation = { id: number; name: string };

type DomesticCost = {
  state: string;
  cost: number;
  vat: number;
  totalCost: number;
};

type ExportCost = {
  price: number;
  discountedRate: number;
};

const NIGERIA_VALUE = "__nigeria__";

// Flat delivery fee (USD) charged when the live Fez quote can't be fetched,
// so a shipping-API outage never blocks checkout.
const FLAT_DELIVERY_FALLBACK_USD = 65;

export type DeliverySelection = {
  destination: string;
  usd: number;
};

interface ShippingEstimatorProps {
  /** Called whenever the estimated delivery cost changes; null while nothing is selected. */
  onDeliveryChange?: (delivery: DeliverySelection | null) => void;
}

export function ShippingEstimator({ onDeliveryChange }: ShippingEstimatorProps = {}) {
  const [states, setStates] = useState<FezState[]>([]);
  const [exportLocations, setExportLocations] = useState<ExportLocation[]>([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const [domesticCost, setDomesticCost] = useState<DomesticCost | null>(null);
  const [exportCost, setExportCost] = useState<ExportCost | null>(null);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  // True when the live quote couldn't be fetched for the current selection —
  // we then charge the flat fallback fee instead of blocking checkout.
  const [costFailed, setCostFailed] = useState(false);

  const isNigeria = selectedCountry === NIGERIA_VALUE;

  // Load states and export locations on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/shipping/states").then((r) => r.json()),
      fetch("/api/shipping/export-locations").then((r) => r.json()),
    ])
      .then(([statesData, exportData]) => {
        if (statesData.states) {
          const sorted = [...statesData.states].sort(
            (a: FezState, b: FezState) => a.state.localeCompare(b.state)
          );
          setStates(sorted);
        }
        if (exportData.locations) {
          // Sort alphabetically
          const sorted = [...exportData.locations].sort(
            (a: ExportLocation, b: ExportLocation) =>
              a.name.localeCompare(b.name)
          );
          setExportLocations(sorted);
        }
      })
      .catch(() => setError("Could not load shipping data"))
      .finally(() => setDataLoading(false));
  }, []);

  // Reset sub-selection when country changes
  useEffect(() => {
    setSelectedState("");
    setDomesticCost(null);
    setExportCost(null);
    setError("");
    setCostFailed(false);
  }, [selectedCountry]);

  // Fetch domestic cost when state selected
  useEffect(() => {
    if (!isNigeria || !selectedState) {
      setDomesticCost(null);
      return;
    }

    setLoading(true);
    setError("");
    setCostFailed(false);

    fetch("/api/shipping/cost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: selectedState }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setCostFailed(true);
        else setDomesticCost(data);
      })
      .catch(() => setCostFailed(true))
      .finally(() => setLoading(false));
  }, [isNigeria, selectedState]);

  // Fetch export cost when international country selected
  useEffect(() => {
    if (isNigeria || !selectedCountry) {
      setExportCost(null);
      return;
    }

    const locationId = parseInt(selectedCountry);
    if (isNaN(locationId)) return;

    setLoading(true);
    setError("");
    setCostFailed(false);

    // weightId 19 = 0.5kg, covers a standard 30-card order with packaging
    fetch("/api/shipping/export-cost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exportLocationId: locationId, weightId: 19 }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setCostFailed(true);
        else setExportCost(data);
      })
      .catch(() => setCostFailed(true))
      .finally(() => setLoading(false));
  }, [isNigeria, selectedCountry]);

  const [ngnToUsd, setNgnToUsd] = useState<number | null>(null);

  // Fetch NGN→USD rate on mount
  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/NGN")
      .then((r) => r.json())
      .then((data) => {
        if (data.rates?.USD) setNgnToUsd(data.rates.USD);
      })
      .catch(() => {
        // Fallback rate if API fails
        setNgnToUsd(1 / 1600);
      });
  }, []);

  // Report the selected delivery cost (in USD, rounded up) to the parent
  useEffect(() => {
    if (!onDeliveryChange) return;

    if (ngnToUsd && domesticCost && !loading) {
      onDeliveryChange({
        destination: `${domesticCost.state}, Nigeria`,
        usd: Math.ceil(domesticCost.totalCost * ngnToUsd),
      });
    } else if (ngnToUsd && exportCost && !loading) {
      const location = exportLocations.find(
        (l) => String(l.id) === selectedCountry
      );
      onDeliveryChange({
        destination: location?.name || "International",
        usd: Math.ceil(exportCost.price * ngnToUsd),
      });
    } else if (costFailed && !loading) {
      // Live quote failed but the customer picked a destination — charge the
      // flat fallback fee so checkout isn't blocked by a shipping-API outage.
      const location = exportLocations.find(
        (l) => String(l.id) === selectedCountry
      );
      const destination = isNigeria
        ? selectedState
          ? `${selectedState}, Nigeria`
          : "Nigeria"
        : location?.name || "your location";
      onDeliveryChange({ destination, usd: FLAT_DELIVERY_FALLBACK_USD });
    } else {
      onDeliveryChange(null);
    }
  }, [
    onDeliveryChange,
    domesticCost,
    exportCost,
    ngnToUsd,
    loading,
    costFailed,
    isNigeria,
    selectedState,
    exportLocations,
    selectedCountry,
  ]);

  const formatUsd = (ngnAmount: number) => {
    if (!ngnToUsd) return "...";
    const usd = ngnAmount * ngnToUsd;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(usd);
  };

  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-2.5 mb-4">
        <Truck className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Delivery Estimate</h3>
      </div>

      {dataLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </div>
      ) : (
        <div className="space-y-3">
          {/* Country selector */}
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow"
          >
            <option value="">Select your country</option>
            <option value={NIGERIA_VALUE}>Nigeria</option>
            {exportLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          {/* State selector for Nigeria */}
          {isNigeria && (
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
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          Calculating...
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

      {/* Fallback flat fee when the live quote is unavailable */}
      {costFailed && !loading && (
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm font-semibold">
            <span>Flat Delivery Fee</span>
            <span>${FLAT_DELIVERY_FALLBACK_USD.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            We couldn&apos;t reach our courier for a live rate, so a flat
            delivery fee applies. Final amount confirmed at checkout.
          </p>
        </div>
      )}

      {/* Domestic cost result */}
      {domesticCost && !loading && (
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Delivery to {domesticCost.state}
            </span>
            <span>{formatUsd(domesticCost.cost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">VAT</span>
            <span>{formatUsd(domesticCost.vat)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border">
            <span>Estimated Total</span>
            <span>{formatUsd(domesticCost.totalCost)}</span>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Standard delivery. Final amount confirmed at checkout.
          </p>
        </div>
      )}

      {/* International cost result */}
      {exportCost && !loading && (
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm font-semibold">
            <span>Shipping Cost</span>
            <span>{formatUsd(exportCost.price)}</span>
          </div>
          {exportCost.discountedRate < exportCost.price && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discounted Rate</span>
              <span className="text-green-600 dark:text-green-400">
                {formatUsd(exportCost.discountedRate)}
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground pt-1">
            International shipping for a standard order. Final amount confirmed
            at checkout.
          </p>
        </div>
      )}
    </div>
  );
}
