import { NextRequest } from "next/server";
import { adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";
import { listBriefs } from "@/lib/design-briefs";

/**
 * Admin: list submitted design briefs, newest first. Each row carries the
 * full sanitized brief plus logoId; download the logo from
 * /api/admin/design-briefs/{id}/logo.
 */

export function OPTIONS() {
  return adminPreflight();
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return adminJson({ error: "Unauthorized" }, 401);
  try {
    const briefs = await listBriefs(50);
    return adminJson({ briefs });
  } catch (e) {
    console.error("design-briefs GET error:", e);
    return adminJson({ error: "Failed to load briefs" }, 500);
  }
}
