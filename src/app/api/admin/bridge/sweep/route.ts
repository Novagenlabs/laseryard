import { NextRequest } from "next/server";
import { adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";
import { sweepOpenQuestions } from "@/lib/bridge";

export function OPTIONS() {
  return adminPreflight();
}

/**
 * Admin: run the bridge re-ping sweep now. The server also runs it every
 * 10 minutes on its own — this exists for verification and impatience.
 */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return adminJson({ error: "Unauthorized" }, 401);
  try {
    const result = await sweepOpenQuestions();
    return adminJson(result);
  } catch (e) {
    console.error("bridge sweep endpoint error:", e);
    return adminJson({ error: "Sweep failed" }, 500);
  }
}
