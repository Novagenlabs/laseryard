import { getDb } from "@/lib/db";

/**
 * Concept mockups and taste capture.
 *
 * The studio uploads a set of card mockups per order (hand-made in Canva for
 * now, autofill later if the plan allows). The customer opens
 * laseryard.com/concepts?order=CODE, picks the 5-10 that look good, and the
 * picks plus notes come back here. The point is capturing the customer's
 * taste, not choosing the one final card, so multi-select is the model and
 * a later submission never overwrites an earlier one.
 *
 * Mockup images are studio-authored (trusted), stored base64 in Neon like
 * everything else that must survive a deploy, and served publicly inline.
 * Customer input in this flow is only the picks array and a notes string.
 */

export const CONCEPT_IMAGE_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

// Canva PNG exports at 2x can be heavy; the console compresses, but leave
// headroom for direct curl uploads of raw exports.
export const MAX_CONCEPT_BYTES = 8 * 1024 * 1024;

export const MAX_PICKS = 10;

// order_ref sentinel for the standing taste gallery shown inside the brief
// form. Uppercase with a leading underscore so it can never collide with a
// real LY- tracking code (normalizeTrackingNumber only trims + uppercases).
export const TASTE_GALLERY_REF = "_TASTE";

let ensured: Promise<unknown> | null = null;
function ensureTables() {
  if (!ensured) {
    const sql = getDb();
    ensured = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS design_concepts (
          id SERIAL PRIMARY KEY,
          order_ref TEXT NOT NULL,
          label TEXT,
          style TEXT,
          content_type TEXT NOT NULL,
          data TEXT NOT NULL,
          sort INTEGER NOT NULL DEFAULT 0,
          archived BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS concept_picks (
          id SERIAL PRIMARY KEY,
          order_ref TEXT NOT NULL,
          picks JSONB NOT NULL,
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
    })();
  }
  return ensured;
}

export type Concept = {
  id: number;
  orderRef: string;
  label: string | null;
  style: string | null;
  contentType: string;
  sort: number;
  archived: boolean;
  createdAt: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToConcept(row: any): Concept {
  return {
    id: row.id,
    orderRef: row.order_ref,
    label: row.label,
    style: row.style,
    contentType: row.content_type,
    sort: row.sort,
    archived: row.archived,
    createdAt: row.created_at,
  };
}

export async function saveConcept(input: {
  orderRef: string;
  label: string | null;
  style: string | null;
  contentType: string;
  data: Buffer;
  sort?: number;
}): Promise<Concept> {
  await ensureTables();
  const sql = getDb();
  const rows = await sql`
    INSERT INTO design_concepts (order_ref, label, style, content_type, data, sort)
    VALUES (${input.orderRef}, ${input.label}, ${input.style},
            ${input.contentType}, ${input.data.toString("base64")},
            ${input.sort ?? 0})
    RETURNING id, order_ref, label, style, content_type, sort, archived, created_at
  `;
  return rowToConcept(rows[0]);
}

export async function conceptsForOrder(
  orderRef: string,
  includeArchived = false
): Promise<Concept[]> {
  await ensureTables();
  const sql = getDb();
  const rows = includeArchived
    ? await sql`
        SELECT id, order_ref, label, style, content_type, sort, archived, created_at
        FROM design_concepts WHERE order_ref = ${orderRef}
        ORDER BY sort, id
      `
    : await sql`
        SELECT id, order_ref, label, style, content_type, sort, archived, created_at
        FROM design_concepts WHERE order_ref = ${orderRef} AND archived = false
        ORDER BY sort, id
      `;
  return rows.map(rowToConcept);
}

export async function getConceptImage(
  id: number
): Promise<{ contentType: string; data: Buffer; archived: boolean } | null> {
  await ensureTables();
  const sql = getDb();
  const rows = await sql`
    SELECT content_type, data, archived FROM design_concepts WHERE id = ${id} LIMIT 1
  `;
  if (rows.length === 0) return null;
  return {
    contentType: rows[0].content_type,
    data: Buffer.from(rows[0].data, "base64"),
    archived: rows[0].archived,
  };
}

export async function setConceptArchived(
  id: number,
  archived: boolean
): Promise<boolean> {
  await ensureTables();
  const sql = getDb();
  const rows = await sql`
    UPDATE design_concepts SET archived = ${archived} WHERE id = ${id} RETURNING id
  `;
  return rows.length > 0;
}

export type ConceptPick = {
  id: number;
  orderRef: string;
  picks: number[];
  notes: string | null;
  createdAt: string;
};

function rowToPick(row: any): ConceptPick {
  return {
    id: row.id,
    orderRef: row.order_ref,
    picks:
      typeof row.picks === "string" ? JSON.parse(row.picks) : row.picks,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function savePicks(input: {
  orderRef: string;
  picks: number[];
  notes: string | null;
}): Promise<ConceptPick> {
  await ensureTables();
  const sql = getDb();
  const rows = await sql`
    INSERT INTO concept_picks (order_ref, picks, notes)
    VALUES (${input.orderRef}, ${JSON.stringify(input.picks)}::jsonb, ${input.notes})
    RETURNING *
  `;
  return rowToPick(rows[0]);
}

export async function picksForOrder(orderRef: string): Promise<ConceptPick[]> {
  await ensureTables();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM concept_picks WHERE order_ref = ${orderRef}
    ORDER BY created_at DESC
  `;
  return rows.map(rowToPick);
}

export async function latestPickForOrder(
  orderRef: string
): Promise<ConceptPick | null> {
  const all = await picksForOrder(orderRef);
  return all.length ? all[0] : null;
}
