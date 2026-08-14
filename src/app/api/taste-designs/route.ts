import { NextResponse } from "next/server";
import { conceptsForOrder, TASTE_GALLERY_REF } from "@/lib/concepts";

/**
 * Public: the standing taste gallery shown at the end of the design brief
 * form. Order-independent — these are generic card designs (pulled from the
 * studio's Canva) whose only job is reading the customer's taste; the picks
 * travel inside the brief payload, not through /api/concepts POST.
 *
 * Image URLs are absolute so the form works from any origin (it is also
 * opened as a plain file during testing).
 */

const SITE = process.env.SITE_ORIGIN || "https://laseryard.com";

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=300",
} as const;

const CACHE_MS = 60_000;
let cache: { at: number; value: unknown } | null = null;

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: HEADERS });
}

export async function GET() {
  try {
    if (!cache || Date.now() - cache.at >= CACHE_MS) {
      const designs = await conceptsForOrder(TASTE_GALLERY_REF);
      cache = {
        at: Date.now(),
        value: {
          designs: designs.map((d) => ({
            id: d.id,
            label: d.label,
            style: d.style,
            image: `${SITE}/api/concepts/${d.id}/image`,
          })),
        },
      };
    }
    return NextResponse.json(cache.value, { headers: HEADERS });
  } catch (e) {
    // The form quietly skips the taste step when this is unreachable.
    console.error("taste-designs error:", e);
    return NextResponse.json({ error: "unavailable" }, { status: 500, headers: HEADERS });
  }
}
