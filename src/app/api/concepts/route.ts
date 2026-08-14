import { NextRequest, NextResponse } from "next/server";
import {
  conceptsForOrder,
  latestPickForOrder,
  savePicks,
  MAX_PICKS,
} from "@/lib/concepts";
import { listBriefs } from "@/lib/design-briefs";
import { normalizeTrackingNumber } from "@/lib/orders";

/**
 * Public API for the concept picker page (laseryard.com/concepts?order=CODE).
 *
 * GET  ?order=CODE → the concept set for that order plus display context.
 * POST {order, picks: [conceptId, ...], notes} → store the customer's taste
 *      picks. Every submission INSERTs; resubmitting never erases history.
 *
 * Exposure model matches /track: the order code is the capability. Codes are
 * high entropy and concepts are marketing-safe mockups, so no auth beyond
 * the code. Nothing here mutates an order.
 */

const PUBLIC_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: PUBLIC_CORS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: PUBLIC_CORS });
}

async function finishForOrder(orderRef: string): Promise<string | null> {
  // The chosen finish lives on the latest brief for the order; the picker
  // uses it to draw mockups on the right metal.
  try {
    const briefs = await listBriefs(200);
    const match = briefs.find((b) => b.orderRef === orderRef);
    return match ? match.brief.finish : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("order") || "";
  const orderRef = normalizeTrackingNumber(raw);
  if (!orderRef) return json({ error: "order is required" }, 400);

  try {
    const [concepts, lastPick, finish] = await Promise.all([
      conceptsForOrder(orderRef),
      latestPickForOrder(orderRef),
      finishForOrder(orderRef),
    ]);
    return json({
      order: orderRef,
      finish,
      concepts: concepts.map((c) => ({
        id: c.id,
        label: c.label,
        style: c.style,
        image: `/api/concepts/${c.id}/image`,
      })),
      pickedAt: lastPick ? lastPick.createdAt : null,
      pickedIds: lastPick ? lastPick.picks : [],
      maxPicks: MAX_PICKS,
    });
  } catch (e) {
    console.error("concepts GET error:", e);
    return json({ error: "Failed to load concepts" }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderRef = normalizeTrackingNumber(
      typeof body?.order === "string" ? body.order : ""
    );
    if (!orderRef) return json({ error: "order is required" }, 400);

    const picksRaw = Array.isArray(body?.picks) ? body.picks : [];
    const picks = [...new Set(picksRaw)]
      .map((p) => Number.parseInt(String(p), 10))
      .filter((p) => Number.isInteger(p) && p > 0);
    if (picks.length === 0) return json({ error: "Pick at least one design" }, 422);
    if (picks.length > MAX_PICKS) {
      return json({ error: `Pick at most ${MAX_PICKS} designs` }, 422);
    }

    const notes =
      typeof body?.notes === "string"
        ? body.notes.trim().slice(0, 2000) || null
        : null;

    // Picks must reference this order's own live concepts.
    const valid = new Map(
      (await conceptsForOrder(orderRef)).map((c) => [c.id, c])
    );
    if (valid.size === 0) return json({ error: "No concepts for this order" }, 404);
    if (!picks.every((p) => valid.has(p))) {
      return json({ error: "One of those designs does not belong to this order" }, 422);
    }

    const saved = await savePicks({ orderRef, picks, notes });

    const labels = picks.map((p) => valid.get(p)?.label || `#${p}`);
    await notifyStudio(orderRef, labels, notes).catch((e) =>
      console.error("concept picks notify error:", e)
    );

    return json({ ok: true, ref: `P#${saved.id}`, picked: picks.length });
  } catch (e) {
    console.error("concepts POST error:", e);
    return json({ error: "Failed to save picks" }, 500);
  }
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const STUDIO_TO = process.env.BRIEF_NOTIFY_TO || "hello@laseryard.com";
const FROM_ADDRESS = "Laser Yard Design Team <design-team@updates.laseryard.com>";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function notifyStudio(
  orderRef: string,
  labels: string[],
  notes: string | null
): Promise<void> {
  if (!RESEND_API_KEY) return;
  const items = labels.map((l) => `<li>${escapeHtml(l)}</li>`).join("");
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px 0;color:#1A1A24;">
      <h2 style="font-size:18px;margin:0 0 4px;">Concept picks are in</h2>
      <p style="margin:0 0 16px;color:#6b6b76;">${escapeHtml(orderRef)}, ${labels.length} selected</p>
      <ul style="font-size:14px;line-height:1.7;margin:0 0 16px;">${items}</ul>
      ${notes ? `<p style="font-size:14px;"><strong>Notes:</strong> ${escapeHtml(notes)}</p>` : ""}
      <p style="margin-top:24px;font-size:12px;color:#6b6b76;">From the concept picker on laseryard.com</p>
    </div>
  `;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: STUDIO_TO,
      subject: `Concept picks, ${orderRef}, ${labels.length} selected`,
      html,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    console.error("concept picks notify failed:", res.status, await res.text());
  }
}
