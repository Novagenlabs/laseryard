import { NextRequest, NextResponse } from "next/server";
import {
  checkLogoFile,
  sanitizeBrief,
  saveBrief,
  saveBriefLogo,
  type BriefRecord,
  type CleanBrief,
} from "@/lib/design-briefs";
import { checkBriefStock } from "@/lib/design-stock";
import { getOrderWithEvents, normalizeTrackingNumber } from "@/lib/orders";

/**
 * Public: design brief submission from the design-onboarding form.
 *
 * POST multipart/form-data with two parts:
 *   brief — JSON string (shape defined by the form)
 *   logo  — optional file (.svg .ai .eps .pdf .png .jpg, max 20 MB)
 *
 * The form only reads the status code: 2xx means success, anything else
 * shows the customer a retry message. Everything client-supplied is
 * re-validated here; the order code arrives via URL query string and is not
 * authenticated, so an unknown or missing code files the brief as a lead
 * instead of attaching it to an order, and the response never echoes order
 * details back.
 */

const PUBLIC_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: PUBLIC_CORS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: PUBLIC_CORS });
}

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Expected multipart/form-data" }, 400);
  }

  const briefPart = form.get("brief");
  if (typeof briefPart !== "string") {
    return json({ error: "Missing brief part" }, 400);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(briefPart);
  } catch {
    return json({ error: "brief is not valid JSON" }, 400);
  }

  const sanitized = sanitizeBrief(parsed);
  if (!sanitized.ok) return json({ error: sanitized.error }, 422);
  const brief = sanitized.brief;

  // Re-check finish and infill against live stock: the customer can sit on
  // the form while an item sells out, and the client flags are advisory.
  const stock = await checkBriefStock(brief.finish, brief.infill.choice);
  if (!stock.ok) return json({ error: stock.reason }, 422);

  // Validate the logo before any row is written so a bad file rejects the
  // whole submission and the customer retries once, not piecemeal.
  const logoPart = form.get("logo");
  let logoFile: { filename: string; contentType: string; data: Buffer } | null =
    null;
  if (logoPart instanceof File && logoPart.size > 0) {
    if (logoPart.size > 20 * 1024 * 1024) {
      return json({ error: "Logo is larger than 20 MB" }, 413);
    }
    const data = Buffer.from(await logoPart.arrayBuffer());
    const check = checkLogoFile(logoPart.name || "logo", data);
    if (!check.ok) return json({ error: check.error }, 415);
    logoFile = {
      filename: (logoPart.name || `logo${check.extension}`).slice(0, 200),
      contentType: logoPart.type,
      data,
    };
  }
  if (brief.logo.choice === "upload" && !logoFile) {
    return json({ error: "logo.choice is upload but no file arrived" }, 400);
  }

  try {
    let orderRef: string | null = null;
    if (brief.order) {
      const tn = normalizeTrackingNumber(brief.order);
      const found = await getOrderWithEvents(tn).catch(() => null);
      if (found) orderRef = tn;
    }

    const logoId = logoFile
      ? await saveBriefLogo(logoFile.filename, logoFile.contentType, logoFile.data)
      : null;

    const record = await saveBrief({
      orderRef,
      providedCode: brief.order,
      isLead: !orderRef,
      brief,
      logoId,
    });

    // A brief that lands silently in the database is the same as no brief,
    // so the studio email is awaited. If Resend is down the brief is still
    // stored and listed in the console; do not bounce the customer for it.
    const notified = await notifyStudio(record, brief, logoFile).catch((e) => {
      console.error("design-brief notify error:", e);
      return false;
    });

    return json({ ok: true, ref: `B#${record.id}`, notified });
  } catch (e) {
    console.error("design-brief error:", e);
    return json({ error: "Failed to store brief" }, 500);
  }
}

// --- Studio notification ----------------------------------------------------

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const STUDIO_TO = process.env.BRIEF_NOTIFY_TO || "hello@laseryard.com";
const FROM_ADDRESS = "Laser Yard Design Team <design-team@updates.laseryard.com>";

// Resend caps messages around 40 MB after base64; keep attachments well
// under it so the notification never bounces because of the artwork.
const MAX_ATTACH_BYTES = 10 * 1024 * 1024;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string): string {
  if (!value) return "";
  return `<tr>
    <td style="padding:6px 16px 6px 0;color:#6b6b76;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;color:#1A1A24;font-weight:600;">${escapeHtml(value)}</td>
  </tr>`;
}

async function notifyStudio(
  record: BriefRecord,
  brief: CleanBrief,
  logoFile: { filename: string; contentType: string; data: Buffer } | null
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("design-brief: RESEND_API_KEY not set, brief stored unnotified");
    return false;
  }

  const orderLabel = record.orderRef || `LEAD (sent code: ${brief.order || "none"})`;
  const engrave = brief.engrave
    .map((e) => `${e.field}: ${e.value}`)
    .join("\n");
  const infill =
    brief.infill.choice === "custom"
      ? `custom (${brief.infill.custom})`
      : brief.infill.choice;
  const back =
    brief.back.choice === "message"
      ? `message (${brief.back.text})`
      : brief.back.choice;
  const logoLine = logoFile
    ? logoFile.data.length <= MAX_ATTACH_BYTES
      ? `${logoFile.filename} (attached)`
      : `${logoFile.filename} (${Math.round(logoFile.data.length / 1024 / 1024)} MB, too large to attach, download from the orders console)`
    : brief.logo.choice === "later"
      ? "customer will send later"
      : "none";

  const customerEmail =
    brief.engrave.find((e) => e.field === "email")?.value || null;

  const site = process.env.SITE_ORIGIN || "https://laseryard.com";
  const tasteBlock = brief.taste
    ? `<p style="margin:20px 0 8px;font-size:14px;"><strong>Taste picks</strong>, ${brief.taste.picks.length} of ${brief.taste.shown} shown</p>
       <div>${brief.taste.picks
         .map(
           (p) =>
             `<a href="${site}/api/concepts/${p.id}/image" style="display:inline-block;margin:0 6px 6px 0;">` +
             `<img src="${site}/api/concepts/${p.id}/image" alt="${escapeHtml(p.label || `design ${p.id}`)}" width="120" style="border-radius:6px;background:#26262e;vertical-align:top;"></a>`
         )
         .join("")}</div>`
    : "";

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px 0;color:#1A1A24;">
      <h2 style="font-size:18px;margin:0 0 4px;">New design brief</h2>
      <p style="margin:0 0 20px;color:#6b6b76;">Brief B#${record.id}, ${escapeHtml(orderLabel)}</p>
      <table style="border-collapse:collapse;font-size:14px;">
        ${row("Name", brief.name)}
        ${row("Title", brief.jobTitle)}
        ${row("Company", brief.company)}
        ${row("Engrave", engrave)}
        ${row("Back of card", back)}
        ${row("Finish", brief.finish)}
        ${row("Infill", infill)}
        ${row("Direction", brief.direction)}
        ${row("References", brief.references)}
        ${row("Avoid", brief.avoid)}
        ${row("Deadline", brief.deadline)}
        ${row("Notes", brief.notes)}
        ${row("Logo", logoLine)}
      </table>
      ${tasteBlock}
      <p style="margin-top:24px;font-size:12px;color:#6b6b76;">From the design brief form on laseryard.com</p>
    </div>
  `;

  const payload: Record<string, unknown> = {
    from: FROM_ADDRESS,
    to: STUDIO_TO,
    subject: `New design brief, ${record.orderRef || "lead"}, ${brief.name}`,
    html,
  };
  if (customerEmail) payload.reply_to = customerEmail;
  if (logoFile && logoFile.data.length <= MAX_ATTACH_BYTES) {
    payload.attachments = [
      {
        filename: logoFile.filename,
        content: logoFile.data.toString("base64"),
      },
    ];
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    console.error("design-brief notify failed:", res.status, await res.text());
    return false;
  }
  return true;
}
