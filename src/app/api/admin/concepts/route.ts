import { NextRequest } from "next/server";
import { adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";
import {
  CONCEPT_IMAGE_TYPES,
  MAX_CONCEPT_BYTES,
  TASTE_GALLERY_REF,
  conceptsForOrder,
  picksForOrder,
  saveConcept,
  setConceptArchived,
} from "@/lib/concepts";
import { normalizeTrackingNumber } from "@/lib/orders";

// "taste" (any casing) addresses the standing gallery shown inside the
// brief form instead of a per-order set.
function resolveOrderRef(raw: string): string {
  const trimmed = raw.trim();
  if (/^_?taste$/i.test(trimmed)) return TASTE_GALLERY_REF;
  return normalizeTrackingNumber(trimmed);
}

/**
 * Admin: manage an order's concept set.
 *
 * GET   ?order=CODE          → concepts (archived included) + all pick rounds
 * POST  multipart            → upload mockups: field "order", optional
 *                              "style", one or more "file" parts (PNG/JPG/WebP,
 *                              8 MB each). Labels come from filenames.
 * PATCH {id, archived}       → hide or restore a concept on the picker
 *
 * curl -X POST https://laseryard.com/api/admin/concepts \
 *   -H "Authorization: Bearer $ORDERS_ADMIN_KEY" \
 *   -F "order=LY-Z54M-PSWZ" -F "style=minimal" \
 *   -F "file=@concept-01.png" -F "file=@concept-02.png"
 */

export function OPTIONS() {
  return adminPreflight();
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return adminJson({ error: "Unauthorized" }, 401);
  const orderRef = resolveOrderRef(request.nextUrl.searchParams.get("order") || "");
  if (!orderRef) return adminJson({ error: "order is required" }, 400);
  try {
    const [concepts, picks] = await Promise.all([
      conceptsForOrder(orderRef, true),
      picksForOrder(orderRef),
    ]);
    return adminJson({ order: orderRef, concepts, picks });
  } catch (e) {
    console.error("admin concepts GET error:", e);
    return adminJson({ error: "Failed to load concepts" }, 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return adminJson({ error: "Unauthorized" }, 401);
  try {
    const form = await request.formData();
    const orderRef = resolveOrderRef(String(form.get("order") || ""));
    if (!orderRef) return adminJson({ error: "order is required" }, 400);

    const styleRaw = String(form.get("style") || "").trim().toLowerCase();
    const style = /^[a-z0-9-]{1,40}$/.test(styleRaw) ? styleRaw : null;

    const files = form.getAll("file").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return adminJson({ error: "Send at least one 'file' part" }, 400);
    }

    const existing = await conceptsForOrder(orderRef, true);
    let sort = existing.length;
    const saved = [];
    for (const file of files) {
      if (!CONCEPT_IMAGE_TYPES[file.type]) {
        return adminJson(
          { error: `${file.name}: unsupported type ${file.type || "unknown"}. Allowed: PNG, JPEG, WebP` },
          415
        );
      }
      if (file.size > MAX_CONCEPT_BYTES) {
        return adminJson({ error: `${file.name}: larger than 8 MB` }, 413);
      }
      const label =
        (file.name || "concept").replace(/\.\w+$/, "").slice(0, 120) || "concept";
      const concept = await saveConcept({
        orderRef,
        label,
        style,
        contentType: file.type,
        data: Buffer.from(await file.arrayBuffer()),
        sort: sort++,
      });
      saved.push(concept);
    }
    return adminJson(
      {
        ok: true,
        added: saved.length,
        concepts: saved,
        picker:
          orderRef === TASTE_GALLERY_REF
            ? null // gallery designs show inside the brief form, not a picker page
            : `https://laseryard.com/concepts?order=${orderRef}`,
      },
      201
    );
  } catch (e) {
    console.error("admin concepts POST error:", e);
    return adminJson({ error: "Failed to upload concepts" }, 500);
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return adminJson({ error: "Unauthorized" }, 401);
  try {
    const body = await request.json();
    const id = Number.parseInt(String(body?.id), 10);
    if (!Number.isInteger(id) || id <= 0) {
      return adminJson({ error: "id is required" }, 400);
    }
    if (typeof body?.archived !== "boolean") {
      return adminJson({ error: "archived must be true or false" }, 400);
    }
    const found = await setConceptArchived(id, body.archived);
    if (!found) return adminJson({ error: "Concept not found" }, 404);
    return adminJson({ ok: true });
  } catch (e) {
    console.error("admin concepts PATCH error:", e);
    return adminJson({ error: "Failed to update concept" }, 500);
  }
}
