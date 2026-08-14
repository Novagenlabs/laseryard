import { NextRequest, NextResponse } from "next/server";
import { getConceptImage } from "@/lib/concepts";

// Public: serve a concept mockup (the picker page loads them in <img>).
// Studio-authored raster images only, so inline rendering is safe.
// Immutable cache: a replaced mockup is a new row with a new id.
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const conceptId = Number.parseInt(id, 10);
  if (!Number.isInteger(conceptId) || conceptId <= 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const image = await getConceptImage(conceptId);
    if (!image || image.archived) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(image.data), {
      headers: {
        "Content-Type": image.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
      },
    });
  } catch (e) {
    console.error("concept image error:", e);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
