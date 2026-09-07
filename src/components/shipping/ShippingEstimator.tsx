"use client";

import { useState, useEffect } from "react";
import { Truck, Loader2 } from "lucide-react";

type FezState = { id: number; state: string };
type ExportLocation = { id: number; name: string };

const NIGERIA_VALUE = "__nigeria__";

// 2026-09-07: every card price is an all-in delivered total, so this component
// no longer quotes courier fees — it only captures the delivery destination
// (needed for fulfillment) and confirms shipping is included.
export type DeliverySelection = {
  destination: string;
};

interface ShippingEstimatorProps {
  /** Called whenever the destination changes; null while nothing is selected. */
  onDeliveryChange?: (delivery: DeliverySelection | null) => void;
}

export function ShippingEstimator({ onDeliveryChange }: ShippingEstimatorProps = {}) {
  const [states, setStates] = useState<FezState[]>([]);
  const [exportLocations, setExportLocations] = useState<ExportLocation[]>([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, [selectedCountry]);

  // Resolve the selected destination (Nigeria needs a state too)
  const location = exportLocations.find((l) => String(l.id) === selectedCountry);
  const destination = isNigeria
    ? selectedState
      ? `${selectedState}, Nigeria`
      : null
    : location
      ? location.name
      : null;

  // Report the selected destination to the parent
  useEffect(() => {
    if (!onDeliveryChange) return;
    onDeliveryChange(destination ? { destination } : null);
  }, [onDeliveryChange, destination]);

  // United States leads the country list; everything else, Nigeria included,
  // stays alphabetical (stable second sort just lifts the US to the top).
  const isUnitedStates = (name: string) =>
    /united states|^u\.?s\.?a?\.?$/i.test(name.trim());
  const countryOptions = [
    ...exportLocations.map((loc) => ({ value: String(loc.id), label: loc.name })),
    { value: NIGERIA_VALUE, label: "Nigeria" },
  ]
    .sort((a, b) => a.label.localeCompare(b.label))
    .sort(
      (a, b) => Number(isUnitedStates(b.label)) - Number(isUnitedStates(a.label))
    );

  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-2.5 mb-4">
        <Truck className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Delivery Destination</h3>
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
            {countryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
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

      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

      {destination && (
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm font-semibold">
            <span>Delivery to {destination}</span>
            <span className="text-gold">Included</span>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Worldwide shipping is included in every price. Most orders arrive
            7-14 business days after dispatch.
          </p>
        </div>
      )}
    </div>
  );
}
