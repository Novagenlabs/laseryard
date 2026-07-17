import { NextRequest } from "next/server";
import { adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";
import { xiFetch, AGENT_ID, elevenLabsConfigured } from "@/lib/elevenlabs";

export function OPTIONS() {
  return adminPreflight();
}

const HUMAN_RE =
  /\b(human|real person|speak to (someone|a person|an agent|somebody)|talk to (someone|a person|somebody)|customer (service|care|support)|representative|live agent|call me)\b/i;

/* eslint-disable @typescript-eslint/no-explicit-any */
function collected(results: any, key: string): unknown {
  const entry = results?.[key];
  return entry && typeof entry === "object" ? entry.value : undefined;
}

// Run an async mapper over items with bounded concurrency.
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

// Fetch a conversation's detail to enrich the list row with the customer's
// phone (WhatsApp id) and collected data. Fails soft: on error the base row
// (from the list) is kept, so the list still renders.
async function enrich(base: any) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await xiFetch(`/conversations/${base.conversation_id}`, {
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return base;
    const d = await res.json();
    const md = d.metadata || {};
    const dc = d.analysis?.data_collection_results || {};
    const dvars = d.conversation_initiation_client_data?.dynamic_variables || {};
    const wa =
      md.whatsapp?.whatsapp_user_id || dvars["system__caller_id"] || null;
    const transcript = d.transcript || [];
    const wantsHuman = transcript.some(
      (x: any) => x.role === "user" && x.message && HUMAN_RE.test(x.message)
    );
    return {
      ...base,
      whatsapp_user_id: wa,
      customer_name: collected(dc, "customer_name") || null,
      customer_email: collected(dc, "customer_email") || null,
      purchased: collected(dc, "purchased") ?? null,
      wants_human: wantsHuman,
    };
  } catch {
    return base;
  }
}

// Admin: list recent agent conversations (newest first), enriched with the
// customer's phone, collected name/email/purchase, a human-request flag, and
// the summary/sentiment the list already carries.
// GET /api/admin/conversations?page_size=30&cursor=...&enrich=1
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return adminJson({ error: "Unauthorized" }, 401);
  if (!elevenLabsConfigured())
    return adminJson({ error: "ELEVENLABS_API_KEY not set on server" }, 503);

  try {
    const params = request.nextUrl.searchParams;
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(params.get("page_size") || "30", 10))
    );
    const doEnrich = params.get("enrich") !== "0";
    const cursor = params.get("cursor") || "";
    const qs = new URLSearchParams({ agent_id: AGENT_ID, page_size: String(pageSize) });
    if (cursor) qs.set("cursor", cursor);

    const res = await xiFetch(`/conversations?${qs.toString()}`);
    if (!res.ok) {
      return adminJson(
        { error: `ElevenLabs error ${res.status}`, detail: await res.text() },
        502
      );
    }
    const data = await res.json();
    const base = (data.conversations || []).map((c: any) => ({
      conversation_id: c.conversation_id,
      status: c.status,
      message_count: c.message_count,
      call_duration_secs: c.call_duration_secs,
      start_time_unix_secs: c.start_time_unix_secs,
      direction: c.direction || null,
      call_successful: c.call_successful || null,
      title: c.call_summary_title || null,
      transcript_summary: c.transcript_summary || null,
      sentiment: c.sentiment_analysis?.overall_sentiment || null,
      whatsapp_user_id: null,
      customer_name: null,
      customer_email: null,
      purchased: null,
      wants_human: false,
    }));

    const conversations = doEnrich ? await mapLimit(base, 6, enrich) : base;

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
