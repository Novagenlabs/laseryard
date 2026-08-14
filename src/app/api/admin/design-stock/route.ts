import { NextRequest } from "next/server";
import { adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";
import {
  isValidStockId,
  listStock,
  setStock,
  getAvailability,
  STOCK_KINDS,
  type StockKind,
} from "@/lib/design-stock";

/**
 * Admin: flip finish/infill availability without a redeploy.
 *
 * GET  → { merged: {finishes, infill}, overrides: [...] }
 * POST → { kind: "finish" | "infill", id: "gold", available: true }
 *
 * curl -X POST https://laseryard.com/api/admin/design-stock \
 *   -H "Authorization: Bearer $ORDERS_ADMIN_KEY" \
 *   -H "Content-Type: application/json" \
 *   -d '{"kind":"finish","id":"gold","available":true}'
 */

export function OPTIONS() {
  return adminPreflight();
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return adminJson({ error: "Unauthorized" }, 401);
  try {
    const [merged, overrides] = await Promise.all([
      getAvailability(),
      listStock(),
    ]);
    return adminJson({ merged, overrides });
  } catch (e) {
    console.error("design-stock GET error:", e);
    return adminJson({ error: "Failed to load stock" }, 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return adminJson({ error: "Unauthorized" }, 401);
  try {
    const body = await request.json();
    const kind = body?.kind as StockKind;
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    const available = body?.available;

    if (!STOCK_KINDS.includes(kind)) {
      return adminJson({ error: `kind must be one of: ${STOCK_KINDS.join(", ")}` }, 400);
    }
    if (!isValidStockId(id)) {
      return adminJson({ error: "id must be a lowercase slug (a-z, 0-9, dashes)" }, 400);
    }
    if (typeof available !== "boolean") {
      return adminJson({ error: "available must be true or false" }, 400);
    }

    await setStock(kind, id, available);
    const merged = await getAvailability();
    return adminJson({ ok: true, merged });
  } catch (e) {
    console.error("design-stock POST error:", e);
    return adminJson({ error: "Failed to update stock" }, 500);
  }
}
