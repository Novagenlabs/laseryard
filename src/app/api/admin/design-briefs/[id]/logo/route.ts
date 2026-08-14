import { NextRequest, NextResponse } from "next/server";
import { ADMIN_CORS_HEADERS, adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";
import { getBrief, getBriefLogo } from "@/lib/design-briefs";

/**
 * Admin: download the logo uploaded with a design brief.
 *
 * {id} is the BRIEF id (what the console and email reference), not the raw
 * logo row. Always served as an attachment and never inline: .ai/.eps/.pdf
 * are not inert formats and there is no virus scanning in this deploy, so
 * customer uploads must never render in a browser or reach the public.
 * Open downloads in Illustrator or a viewer, not the browser tab.
 */

export function OPTIONS() {
  return adminPreflight();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) return adminJson({ error: "Unauthorized" }, 401);

  const { id } = await params;
  const briefId = Number.parseInt(id, 10);
  if (!Number.isInteger(briefId) || briefId <= 0) {
    return adminJson({ error: "Invalid brief id" }, 400);
  }

  try {
    const brief = await getBrief(briefId);
    if (!brief) return adminJson({ error: "Brief not found" }, 404);
    if (!brief.logoId) return adminJson({ error: "This brief has no logo" }, 404);

    const logo = await getBriefLogo(brief.logoId);
    if (!logo) return adminJson({ error: "Logo not found" }, 404);

    const safeName = logo.filename.replace(/[^\w.\- ]/g, "_") || "logo";
    return new NextResponse(new Uint8Array(logo.data), {
      headers: {
        ...ADMIN_CORS_HEADERS,
        "Content-Type": "application/octet-stream",
        "Content-Length": String(logo.bytes),
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error("brief logo download error:", e);
    return adminJson({ error: "Failed to load logo" }, 500);
  }
}
