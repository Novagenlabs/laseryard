import { createHash } from "node:crypto";
import { getDb } from "@/lib/db";

/**
 * Design brief intake (design-onboarding form → studio).
 *
 * Briefs and uploaded logos live in Neon like order artwork does (see
 * designs.ts): the app's disk is ephemeral on the host, and a brief must
 * survive deploys. Every submission INSERTs a new row — a customer sending
 * the same order code twice lands twice and never overwrites the first.
 *
 * Logos are quarantined by design: there is no ClamAV in this deploy, so
 * .ai/.eps/.pdf uploads (not inert formats) are never served publicly and
 * never rendered inline. The only way out is the admin download route,
 * bearer-authed, with Content-Disposition: attachment. Files are sniffed
 * against their extension on the way in; a mismatch is rejected.
 */

export const MAX_LOGO_BYTES = 20 * 1024 * 1024; // matches the form's client cap

export const LOGO_CHOICES = ["upload", "later", "none"] as const;
export const BACK_CHOICES = ["logo", "name", "message", "blank"] as const;
export const DIRECTIONS = ["minimal", "bold", "classic", "technical"] as const;

const TEXT_CAPS = {
  short: 200, // name, jobTitle, company, filenames, infill custom
  value: 300, // engrave values, back text
  long: 2000, // references, avoid, notes
} as const;

const MAX_ENGRAVE_ENTRIES = 10;

export type CleanBrief = {
  order: string | null;
  submittedAt: string | null;
  name: string;
  jobTitle: string;
  company: string;
  logo: { choice: (typeof LOGO_CHOICES)[number]; filename: string | null };
  engrave: { field: string; value: string }[];
  back: { choice: (typeof BACK_CHOICES)[number]; text: string };
  finish: string;
  infill: { choice: string; custom: string };
  direction: (typeof DIRECTIONS)[number];
  references: string;
  avoid: string;
  deadline: string;
  notes: string;
  // Taste capture: the designs the customer tapped in the gallery step at
  // the end of the form. Null when the gallery was empty or unreachable.
  taste: { picks: { id: number; label: string | null }[]; shown: number } | null;
};

function str(v: unknown, cap: number): string {
  return typeof v === "string" ? v.trim().slice(0, cap) : "";
}

function oneOf<T extends readonly string[]>(
  v: unknown,
  allowed: T
): T[number] | null {
  return typeof v === "string" && (allowed as readonly string[]).includes(v)
    ? (v as T[number])
    : null;
}

const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,39}$/;
const DEADLINE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Re-validate the client-supplied brief. Returns the sanitized brief or the
 * first problem found. Stock availability is checked separately (it needs
 * the DB); this is shape and bounds only.
 */
export function sanitizeBrief(
  raw: unknown
): { ok: true; brief: CleanBrief } | { ok: false; error: string } {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, error: "brief must be a JSON object" };
  }
  const b = raw as Record<string, unknown>;

  const name = str(b.name, TEXT_CAPS.short);
  if (!name) return { ok: false, error: "name is required" };

  const logoRaw = (b.logo ?? {}) as Record<string, unknown>;
  const logoChoice = oneOf(logoRaw.choice, LOGO_CHOICES);
  if (!logoChoice) return { ok: false, error: "logo.choice is invalid" };

  const backRaw = (b.back ?? {}) as Record<string, unknown>;
  const backChoice = oneOf(backRaw.choice, BACK_CHOICES);
  if (!backChoice) return { ok: false, error: "back.choice is invalid" };

  const direction = oneOf(b.direction, DIRECTIONS);
  if (!direction) return { ok: false, error: "direction is invalid" };

  const finish = str(b.finish, 40);
  if (!ID_PATTERN.test(finish)) return { ok: false, error: "finish is invalid" };

  const infillRaw = (b.infill ?? {}) as Record<string, unknown>;
  const infillChoice = str(infillRaw.choice, 40);
  if (!ID_PATTERN.test(infillChoice) && infillChoice !== "custom") {
    return { ok: false, error: "infill.choice is invalid" };
  }
  const infillCustom = str(infillRaw.custom, TEXT_CAPS.short);
  if (infillChoice === "custom" && !infillCustom) {
    return { ok: false, error: "infill.custom is required for a custom colour" };
  }

  const engraveRaw = Array.isArray(b.engrave) ? b.engrave : [];
  if (engraveRaw.length > MAX_ENGRAVE_ENTRIES) {
    return { ok: false, error: "too many engrave entries" };
  }
  const engrave: { field: string; value: string }[] = [];
  for (const entry of engraveRaw) {
    const e = (entry ?? {}) as Record<string, unknown>;
    const field = str(e.field, 40);
    const value = str(e.value, TEXT_CAPS.value);
    if (!field || !value) continue;
    engrave.push({ field, value });
  }

  const deadlineRaw = str(b.deadline, 10);
  const deadline = DEADLINE_PATTERN.test(deadlineRaw) ? deadlineRaw : "";

  const submittedAtRaw = str(b.submittedAt, 40);
  const submittedAt = Number.isNaN(Date.parse(submittedAtRaw))
    ? null
    : submittedAtRaw;

  let taste: CleanBrief["taste"] = null;
  const tasteRaw = b.taste as Record<string, unknown> | undefined;
  if (tasteRaw && Array.isArray(tasteRaw.picks)) {
    const picks = tasteRaw.picks
      .slice(0, 10)
      .map((p) => {
        const pick = (p ?? {}) as Record<string, unknown>;
        const id = Number.parseInt(String(pick.id), 10);
        if (!Number.isInteger(id) || id <= 0) return null;
        return { id, label: str(pick.label, 120) || null };
      })
      .filter((p): p is { id: number; label: string | null } => p !== null);
    const shownRaw = Number.parseInt(String(tasteRaw.shown), 10);
    if (picks.length > 0) {
      taste = {
        picks,
        shown: Number.isInteger(shownRaw)
          ? Math.max(picks.length, Math.min(shownRaw, 500))
          : picks.length,
      };
    }
  }

  return {
    ok: true,
    brief: {
      order: str(b.order, 40) || null,
      submittedAt,
      name,
      jobTitle: str(b.jobTitle, TEXT_CAPS.short),
      company: str(b.company, TEXT_CAPS.short),
      logo: {
        choice: logoChoice,
        filename: str(logoRaw.filename, TEXT_CAPS.short) || null,
      },
      engrave,
      back: { choice: backChoice, text: str(backRaw.text, TEXT_CAPS.value) },
      finish,
      infill: { choice: infillChoice, custom: infillCustom },
      direction,
      references: str(b.references, TEXT_CAPS.long),
      avoid: str(b.avoid, TEXT_CAPS.long),
      deadline,
      notes: str(b.notes, TEXT_CAPS.long),
      taste,
    },
  };
}

// --- Logo file checks -------------------------------------------------------

const LOGO_EXTENSIONS = [".svg", ".ai", ".eps", ".pdf", ".png", ".jpg", ".jpeg"];

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

function startsWith(data: Buffer, bytes: number[], offset = 0): boolean {
  if (data.length < offset + bytes.length) return false;
  return bytes.every((b, i) => data[offset + i] === b);
}

/**
 * The browser's MIME type is unreliable for .ai/.eps (often empty or
 * generic), so the contract is: extension allow-list + content sniff, and
 * the two must agree. Modern .ai files are PDF-compatible; legacy ones are
 * PostScript, so .ai accepts either signature.
 */
export function checkLogoFile(
  filename: string,
  data: Buffer
): { ok: true; extension: string } | { ok: false; error: string } {
  const ext = extensionOf(filename);
  if (!LOGO_EXTENSIONS.includes(ext)) {
    return { ok: false, error: `File type ${ext || "unknown"} is not accepted` };
  }
  if (data.length === 0) return { ok: false, error: "File is empty" };
  if (data.length > MAX_LOGO_BYTES) {
    return { ok: false, error: "File is larger than 20 MB" };
  }

  const head = data.subarray(0, 4096);
  const headText = head.toString("latin1");
  const isPdf = headText.includes("%PDF");
  const isPostscript = startsWith(data, [0x25, 0x21]) || // "%!"
    startsWith(data, [0xc5, 0xd0, 0xd3, 0xc6]); // DOS EPS binary header

  let matches = false;
  switch (ext) {
    case ".png":
      matches = startsWith(data, [0x89, 0x50, 0x4e, 0x47]);
      break;
    case ".jpg":
    case ".jpeg":
      matches = startsWith(data, [0xff, 0xd8, 0xff]);
      break;
    case ".pdf":
      matches = isPdf;
      break;
    case ".ai":
      matches = isPdf || isPostscript;
      break;
    case ".eps":
      matches = isPostscript;
      break;
    case ".svg":
      matches = headText.toLowerCase().includes("<svg");
      break;
  }
  if (!matches) {
    return {
      ok: false,
      error: `File content does not look like ${ext}`,
    };
  }
  return { ok: true, extension: ext };
}

// --- Storage ----------------------------------------------------------------

let ensured: Promise<unknown> | null = null;
function ensureTables() {
  if (!ensured) {
    const sql = getDb();
    ensured = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS brief_logos (
          id SERIAL PRIMARY KEY,
          filename TEXT NOT NULL,
          content_type TEXT NOT NULL,
          bytes INTEGER NOT NULL,
          sha256 TEXT NOT NULL,
          data TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS design_briefs (
          id SERIAL PRIMARY KEY,
          order_ref TEXT,
          provided_code TEXT,
          is_lead BOOLEAN NOT NULL DEFAULT false,
          customer_name TEXT NOT NULL,
          brief JSONB NOT NULL,
          logo_id INTEGER,
          client_submitted_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
    })();
  }
  return ensured;
}

export async function saveBriefLogo(
  filename: string,
  contentType: string,
  data: Buffer
): Promise<number> {
  await ensureTables();
  const sql = getDb();
  const sha256 = createHash("sha256").update(data).digest("hex");
  const rows = await sql`
    INSERT INTO brief_logos (filename, content_type, bytes, sha256, data)
    VALUES (${filename}, ${contentType || "application/octet-stream"},
            ${data.length}, ${sha256}, ${data.toString("base64")})
    RETURNING id
  `;
  return rows[0].id as number;
}

export type StoredBriefLogo = {
  id: number;
  filename: string;
  contentType: string;
  bytes: number;
  sha256: string;
  data: Buffer;
};

export async function getBriefLogo(
  id: number
): Promise<StoredBriefLogo | null> {
  await ensureTables();
  const sql = getDb();
  const rows = await sql`
    SELECT id, filename, content_type, bytes, sha256, data
    FROM brief_logos WHERE id = ${id} LIMIT 1
  `;
  if (rows.length === 0) return null;
  return {
    id: rows[0].id,
    filename: rows[0].filename,
    contentType: rows[0].content_type,
    bytes: rows[0].bytes,
    sha256: rows[0].sha256,
    data: Buffer.from(rows[0].data, "base64"),
  };
}

export type BriefRecord = {
  id: number;
  orderRef: string | null;
  providedCode: string | null;
  isLead: boolean;
  customerName: string;
  brief: CleanBrief;
  logoId: number | null;
  clientSubmittedAt: string | null;
  createdAt: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToBrief(row: any): BriefRecord {
  return {
    id: row.id,
    orderRef: row.order_ref,
    providedCode: row.provided_code,
    isLead: row.is_lead,
    customerName: row.customer_name,
    brief: typeof row.brief === "string" ? JSON.parse(row.brief) : row.brief,
    logoId: row.logo_id,
    clientSubmittedAt: row.client_submitted_at,
    createdAt: row.created_at,
  };
}

export async function saveBrief(input: {
  orderRef: string | null;
  providedCode: string | null;
  isLead: boolean;
  brief: CleanBrief;
  logoId: number | null;
}): Promise<BriefRecord> {
  await ensureTables();
  const sql = getDb();
  const rows = await sql`
    INSERT INTO design_briefs
      (order_ref, provided_code, is_lead, customer_name, brief, logo_id,
       client_submitted_at)
    VALUES
      (${input.orderRef}, ${input.providedCode}, ${input.isLead},
       ${input.brief.name}, ${JSON.stringify(input.brief)}::jsonb,
       ${input.logoId}, ${input.brief.submittedAt})
    RETURNING *
  `;
  return rowToBrief(rows[0]);
}

export async function listBriefs(limit = 50): Promise<BriefRecord[]> {
  await ensureTables();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM design_briefs ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows.map(rowToBrief);
}

export async function getBrief(id: number): Promise<BriefRecord | null> {
  await ensureTables();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM design_briefs WHERE id = ${id} LIMIT 1
  `;
  return rows.length ? rowToBrief(rows[0]) : null;
}
