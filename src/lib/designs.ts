import { getDb } from "@/lib/db";

// Design artwork lives in Neon (base64 text) rather than the filesystem —
// the app's disk is ephemeral on the host, and files must survive deploys.

export const ALLOWED_DESIGN_TYPES: Record<string, string> = {
  "image/svg+xml": ".svg",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

export const MAX_DESIGN_BYTES = 5 * 1024 * 1024; // 5MB (console compresses before upload)

export type StoredDesign = {
  id: string;
  filename: string;
  contentType: string;
  data: Buffer;
};

export async function saveDesign(
  filename: string,
  contentType: string,
  data: Buffer
): Promise<string> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO designs (filename, content_type, data)
    VALUES (${filename}, ${contentType}, ${data.toString("base64")})
    RETURNING id
  `;
  return rows[0].id as string;
}

export async function getDesign(id: string): Promise<StoredDesign | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, filename, content_type, data FROM designs WHERE id = ${id} LIMIT 1
  `;
  if (rows.length === 0) return null;
  return {
    id: rows[0].id,
    filename: rows[0].filename,
    contentType: rows[0].content_type,
    data: Buffer.from(rows[0].data, "base64"),
  };
}
