import { getDb } from "@/lib/db";

/**
 * Availability for the design brief form (finishes and infill colours).
 *
 * The form ships hardcoded `available` flags as its offline fallback; this
 * module is the live layer it merges on top. Source of truth is the
 * design_stock table so stock can be flipped from the admin route without a
 * redeploy. Ids the table does not mention fall back to DEFAULT_FINISHES /
 * DEFAULT_INFILL below, which mirror the form's hardcoded flags — keep the
 * two in sync when the catalogue changes.
 *
 * Only booleans ever leave this module: the public endpoint must not leak
 * counts, cost or supplier detail.
 */

export const STOCK_KINDS = ["finish", "infill"] as const;
export type StockKind = (typeof STOCK_KINDS)[number];

// Mirrors CONFIG.finishes in the form. Laser Yard currently stocks exactly
// one finish; the form renders a statement instead of a one-option question.
export const DEFAULT_FINISHES: Record<string, boolean> = {
  "black-matte": true,
  gold: false,
  "silver-brushed": false,
};

// The owner has confirmed colour infill is offered but not yet which
// colours, so no server defaults: ids absent from design_stock keep the
// form's hardcoded flags. Add rows (or trim the form CONFIG) once the real
// range is settled.
export const DEFAULT_INFILL: Record<string, boolean> = {};

const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,39}$/;

export function isValidStockId(id: string): boolean {
  return ID_PATTERN.test(id);
}

let ensured: Promise<unknown> | null = null;
function ensureTable() {
  if (!ensured) {
    const sql = getDb();
    ensured = sql`
      CREATE TABLE IF NOT EXISTS design_stock (
        id TEXT NOT NULL,
        kind TEXT NOT NULL,
        available BOOLEAN NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (kind, id)
      )
    `;
  }
  return ensured;
}

export type AvailabilityMap = {
  finishes: Record<string, boolean>;
  infill: Record<string, boolean>;
};

// The form fetches this on every page load, so serve from a short in-memory
// cache instead of hitting Neon each time. 60s staleness is fine for stock.
const CACHE_MS = 60_000;
let cache: { at: number; value: AvailabilityMap } | null = null;

export function invalidateStockCache(): void {
  cache = null;
}

export async function getAvailability(): Promise<AvailabilityMap> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.value;

  await ensureTable();
  const sql = getDb();
  const rows = await sql`SELECT id, kind, available FROM design_stock`;

  const value: AvailabilityMap = {
    finishes: { ...DEFAULT_FINISHES },
    infill: { ...DEFAULT_INFILL },
  };
  for (const row of rows) {
    if (row.kind === "finish") value.finishes[row.id] = row.available;
    else if (row.kind === "infill") value.infill[row.id] = row.available;
  }

  cache = { at: Date.now(), value };
  return value;
}

export async function setStock(
  kind: StockKind,
  id: string,
  available: boolean
): Promise<void> {
  await ensureTable();
  const sql = getDb();
  await sql`
    INSERT INTO design_stock (kind, id, available)
    VALUES (${kind}, ${id}, ${available})
    ON CONFLICT (kind, id) DO UPDATE
      SET available = ${available}, updated_at = now()
  `;
  invalidateStockCache();
}

export async function listStock(): Promise<
  { kind: string; id: string; available: boolean; updatedAt: string }[]
> {
  await ensureTable();
  const sql = getDb();
  const rows = await sql`
    SELECT kind, id, available, updated_at FROM design_stock
    ORDER BY kind, id
  `;
  return rows.map((r) => ({
    kind: r.kind,
    id: r.id,
    available: r.available,
    updatedAt: r.updated_at,
  }));
}

/**
 * Server-side re-validation for brief submission. Finishes are a closed set
 * (the merged map); an unknown finish id is rejected — if a finish is added
 * to the form CONFIG it must be added to DEFAULT_FINISHES or design_stock
 * too. Infill is open while the owner settles the colour range: any
 * well-formed id passes unless a design_stock row explicitly marks it
 * unavailable. "custom" is always a valid infill choice.
 */
export async function checkBriefStock(
  finish: string,
  infillChoice: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const map = await getAvailability();

  if (!(finish in map.finishes)) {
    return { ok: false, reason: `Unknown finish "${finish}"` };
  }
  if (!map.finishes[finish]) {
    return { ok: false, reason: `Finish "${finish}" is not available` };
  }

  if (infillChoice !== "custom" && map.infill[infillChoice] === false) {
    return { ok: false, reason: `Infill "${infillChoice}" is not available` };
  }

  return { ok: true };
}
