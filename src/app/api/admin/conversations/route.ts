import { NextRequest } from "next/server";
import { adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";
import { xiFetch, AGENT_ID, elevenLabsConfigured } from "@/lib/elevenlabs";

export function OPTIONS() {
  return adminPreflight();
}

// Admin: list recent agent conversations (newest first) for the console.
// GET /api/admin/conversations?page_size=30&cursor=...
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return adminJson({ error: "Unauthorized" }, 401);
  if (!elevenLabsConfigured())
    return adminJson({ error: "ELEVENLABS_API_KEY not set on server" }, 503);

  try {
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(request.nextUrl.searchParams.get("page_size") || "30", 10))
    );
    const cursor = request.nextUrl.searchParams.get("cursor") || "";
    const qs = new URLSearchParams({
      agent_id: AGENT_ID,
      page_size: String(pageSize),
    });
    if (cursor) qs.set("cursor", cursor);

    const res = await xiFetch(`/conversations?${qs.toString()}`);
    if (!res.ok) {
      return adminJson(
        { error: `ElevenLabs error ${res.status}`, detail: await res.text() },
        502
      );
    }
    const data = await res.json();
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const conversations = (data.conversations || []).map((c: any) => ({
      conversation_id: c.conversation_id,
      status: c.status,
      message_count: c.message_count,
      call_duration_secs: c.call_duration_secs,
      start_time_unix_secs: c.start_time_unix_secs,
      call_successful: c.call_successful,
      transcript_summary: c.transcript_summary || null,
    }));
    return adminJson({
      conversations,
      has_more: !!data.has_more,
      next_cursor: data.next_cursor || null,
    });
  } catch (e) {
    console.error("Admin conversations list error:", e);
    return adminJson({ error: "Failed to list conversations" }, 500);
  }
}
