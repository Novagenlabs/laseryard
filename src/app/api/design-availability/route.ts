import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/design-stock";

/**
 * Public: live stock for the design brief form (CONFIG.availability.endpoint).
 *
 * Flat id → boolean maps, nothing else — this is public data on a public
 * page, so no counts, cost or supplier detail may appear here. The form
 * merges these flags over its hardcoded ones on page load; ids absent here
 * keep their hardcoded value, and if this endpoint is down the form carries
 * on with the hardcoded flags.
 *
 * Flip values from the admin design-stock route; changes show up here
 * within a minute (in-memory cache) with no redeploy.
 */

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=60",
} as const;

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: HEADERS });
}

export async function GET() {
  try {
    const map = await getAvailability();
    return NextResponse.json(
      { finishes: map.finishes, infill: map.infill },
      { headers: HEADERS }
    );
  } catch (e) {
    // The form falls back to its hardcoded flags on any failure.
    console.error("design-availability error:", e);
    return NextResponse.json({ error: "unavailable" }, { status: 500, headers: HEADERS });
  }
}
