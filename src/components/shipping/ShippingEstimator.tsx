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

// Fallback export locations in case the API is unreachable
const FALLBACK_EXPORT_LOCATIONS: ExportLocation[] = [
  { id: 28, name: "Afghanistan" }, { id: 29, name: "Albania" }, { id: 30, name: "Algeria" },
  { id: 32, name: "Andorra" }, { id: 33, name: "Angola" }, { id: 35, name: "Antigua" },
  { id: 36, name: "Argentina" }, { id: 37, name: "Armenia" }, { id: 9, name: "Australia" },
  { id: 19, name: "Austria" }, { id: 39, name: "Azerbaijan" }, { id: 40, name: "Bahamas" },
  { id: 41, name: "Bahrain" }, { id: 42, name: "Bangladesh" }, { id: 43, name: "Barbados" },
  { id: 44, name: "Belarus" }, { id: 45, name: "Belgium" }, { id: 46, name: "Belize" },
  { id: 47, name: "Republic of Benin" }, { id: 49, name: "Bhutan" }, { id: 50, name: "Boliva" },
  { id: 52, name: "Bosnia & Herzegovina" }, { id: 53, name: "Botswana" }, { id: 54, name: "Brazil" },
  { id: 55, name: "Brunei" }, { id: 56, name: "Bulgaria" }, { id: 57, name: "Burkina Faso" },
  { id: 58, name: "Burundi" }, { id: 59, name: "Cambodia" }, { id: 141, name: "Cape Verde" },
  { id: 1, name: "Canada" }, { id: 142, name: "Cayman Islands" },
  { id: 62, name: "Central African Republic" }, { id: 63, name: "Chad" }, { id: 64, name: "Chile" },
  { id: 10, name: "China" }, { id: 65, name: "Colombia" }, { id: 67, name: "Congo" },
  { id: 70, name: "Costa Rica" }, { id: 7, name: "Cote D'Ivoire" }, { id: 71, name: "Croatia" },
  { id: 72, name: "Cuba" }, { id: 20, name: "Cyprus" }, { id: 74, name: "Czech Republic" },
  { id: 68, name: "Democratic Republic of Congo" }, { id: 75, name: "Denmark" },
  { id: 76, name: "Djibouti" }, { id: 77, name: "Dominica" }, { id: 78, name: "Dominican Republic" },
  { id: 79, name: "Ecuador" }, { id: 23, name: "Egypt" }, { id: 80, name: "El Salvador" },
  { id: 81, name: "Eritrea" }, { id: 82, name: "Estonia" }, { id: 83, name: "Eswatini" },
  { id: 84, name: "Ethiopia" }, { id: 87, name: "Fiji" }, { id: 88, name: "Finland" },
  { id: 22, name: "France" }, { id: 11, name: "Gabon" }, { id: 12, name: "Gambia" },
  { id: 90, name: "Georgia" }, { id: 91, name: "Germany" }, { id: 5, name: "Ghana" },
  { id: 93, name: "Greece" }, { id: 95, name: "Grenada" }, { id: 98, name: "Guatemala" },
  { id: 13, name: "Guinea" }, { id: 100, name: "Guinea Bissau" }, { id: 103, name: "Haiti" },
  { id: 104, name: "Honduras" }, { id: 105, name: "Hong Kong" }, { id: 106, name: "Hungary" },
  { id: 107, name: "Iceland" }, { id: 17, name: "India" }, { id: 108, name: "Indonesia" },
  { id: 109, name: "Iran" }, { id: 110, name: "Iraq" }, { id: 8, name: "Ireland" },
  { id: 111, name: "Israel" }, { id: 21, name: "Italy" }, { id: 112, name: "Jamaica" },
  { id: 113, name: "Japan" }, { id: 115, name: "Jordan" }, { id: 116, name: "Kazakhstan" },
  { id: 117, name: "Kenya" }, { id: 122, name: "Kuwait" }, { id: 124, name: "Laos" },
  { id: 125, name: "Latvia" }, { id: 16, name: "Lebanon" }, { id: 126, name: "Lesotho" },
  { id: 15, name: "Liberia" }, { id: 127, name: "Libya" }, { id: 129, name: "Lithuania" },
  { id: 130, name: "Luxembourg" }, { id: 132, name: "Madagascar" }, { id: 133, name: "Malawi" },
  { id: 134, name: "Malaysia" }, { id: 135, name: "Maldives" }, { id: 136, name: "Mali" },
  { id: 137, name: "Malta" }, { id: 149, name: "Mauritania" }, { id: 150, name: "Mauritius" },
  { id: 152, name: "Mexico" }, { id: 155, name: "Mongolia" }, { id: 157, name: "Morocco" },
  { id: 158, name: "Mozambique" }, { id: 159, name: "Myanmar" }, { id: 160, name: "Namibia" },
  { id: 161, name: "Nepal" }, { id: 220, name: "The Netherlands" }, { id: 164, name: "New Zealand" },
  { id: 165, name: "Nicaragua" }, { id: 14, name: "Niger" }, { id: 167, name: "North Macedonia" },
  { id: 168, name: "Norway" }, { id: 169, name: "Oman" }, { id: 170, name: "Pakistan" },
  { id: 172, name: "Panama" }, { id: 174, name: "Paraguay" }, { id: 175, name: "Peru" },
  { id: 221, name: "The Philippines" }, { id: 176, name: "Poland" }, { id: 177, name: "Portugal" },
  { id: 179, name: "Qatar" }, { id: 186, name: "Romania" }, { id: 187, name: "Russian Federation" },
  { id: 188, name: "Rwanda" }, { id: 193, name: "Saudi Arabia" }, { id: 194, name: "Senegal" },
  { id: 184, name: "Serbia" }, { id: 195, name: "Seychelles" }, { id: 196, name: "Sierra Leone" },
  { id: 197, name: "Singapore" }, { id: 198, name: "Slovakia" }, { id: 199, name: "Slovenia" },
  { id: 201, name: "Somalia" }, { id: 24, name: "South Africa" }, { id: 119, name: "South Korea" },
  { id: 202, name: "South Sudan" }, { id: 25, name: "Spain" }, { id: 203, name: "Sri Lanka" },
  { id: 210, name: "Sudan" }, { id: 212, name: "Sweden" }, { id: 213, name: "Switzerland" },
  { id: 214, name: "Syria" }, { id: 216, name: "Taiwan" }, { id: 218, name: "Tanzania" },
  { id: 219, name: "Thailand" }, { id: 223, name: "Togo" }, { id: 225, name: "Trinidad And Tobago" },
  { id: 226, name: "Tunisia" }, { id: 227, name: "Turkey" }, { id: 231, name: "Uganda" },
  { id: 232, name: "Ukraine" }, { id: 6, name: "United Arab Emirates" },
  { id: 18, name: "United Kingdom" }, { id: 3, name: "United States of America" },
  { id: 233, name: "Uruguay" }, { id: 234, name: "Uzbekistan" }, { id: 237, name: "Venezuela" },
  { id: 238, name: "Vietnam" }, { id: 241, name: "Zambia" }, { id: 242, name: "Zimbabwe" },
].sort((a, b) => a.name.localeCompare(b.name));

export function ShippingEstimator() {
  const [states, setStates] = useState<FezState[]>([]);
  const [exportLocations, setExportLocations] = useState<ExportLocation[]>(FALLBACK_EXPORT_LOCATIONS);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const [domesticCost, setDomesticCost] = useState<DomesticCost | null>(null);
  const [exportCost, setExportCost] = useState<ExportCost | null>(null);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");

  const isNigeria = selectedCountry === NIGERIA_VALUE;

  // Load states and export locations on mount
  useEffect(() => {
    setDataLoading(true);
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
        if (exportData.locations?.length) {
          const sorted = [...exportData.locations].sort(
            (a: ExportLocation, b: ExportLocation) =>
              a.name.localeCompare(b.name)
          );
          setExportLocations(sorted);
        }
      })
      .catch(() => {
        // Fallback locations are already set as default state
      })
      .finally(() => setDataLoading(false));
  }, []);

  // Reset sub-selection when country changes
  useEffect(() => {
    setSelectedState("");
    setDomesticCost(null);
    setExportCost(null);
    setError("");
  }, [selectedCountry]);

  // Fetch domestic cost when state selected
  useEffect(() => {
    if (!isNigeria || !selectedState) {
      setDomesticCost(null);
      return;
    }

    setLoading(true);
    setError("");

    fetch("/api/shipping/cost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: selectedState }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setDomesticCost(data);
      })
      .catch(() => setError("Could not fetch delivery cost"))
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

    // weightId 19 = 0.5kg, covers a standard 30-card order with packaging
    fetch("/api/shipping/export-cost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exportLocationId: locationId, weightId: 19 }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setExportCost(data);
      })
      .catch(() => setError("Could not fetch delivery cost"))
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
