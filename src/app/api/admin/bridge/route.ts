import { NextRequest } from "next/server";
import { adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";
import { closeQuestion, getQuestion, openQuestions, recentQuestions } from "@/lib/bridge";

export function OPTIONS() {
  return adminPreflight();
}

/**
 * Admin: view the human-bridge queue (open questions the team hasn't answered
 * yet, plus recent answered/closed ones) and close stale questions.
 * The console's Bridge panel drives this. Answering still happens over
 * WhatsApp — this is the visibility backstop so no question strands silently.
 */

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return adminJson({ error: "Unauthorized" }, 401);
  try {
    const [open, recent] = await Promise.all([openQuestions(), recentQuestions()]);
    return adminJson({ open, recent });
  } catch (e) {
    console.error("Admin bridge list error:", e);
    return adminJson({ error: "Failed to load bridge questions" }, 500);
  }
}

/** POST { action: "close", id } — close a stale/handled-elsewhere question. */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return adminJson({ error: "Unauthorized" }, 401);
  try {
    const body = await request.json();
    if (body?.action !== "close") {
      return adminJson({ error: "action must be 'close'" }, 400);
    }
    const id = Number.parseInt(String(body?.id ?? ""), 10);
    if (!Number.isFinite(id)) return adminJson({ error: "id is required" }, 400);
    const q = await getQuestion(id);
    if (!q) return adminJson({ error: `No question #${id}` }, 404);
    await closeQuestion(id);
    return adminJson({ closed: true, id });
  } catch (e) {
    console.error("Admin bridge close error:", e);
    return adminJson({ error: "Failed to close question" }, 500);
  }
}
