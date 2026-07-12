import { NextRequest, NextResponse } from "next/server";
import { getDesign } from "@/lib/designs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Public: serve order artwork (the tracking page loads it in an <img>).
// Immutable cache — a new upload always gets a new id.
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const design = await getDesign(id);
    if (!design) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(design.data), {
      headers: {
        "Content-Type": design.contentType,
        "Content-Disposition": `inline; filename="${design.filename.replace(/[^\w.\-]/g, "_")}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        // uploaded SVGs render in <img>; block scripts if opened directly
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
      },
    });
  } catch (e) {
    console.error("Design fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch design" }, { status: 500 });
  }
}
