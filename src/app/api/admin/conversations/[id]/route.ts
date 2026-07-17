import { NextRequest } from "next/server";
import { adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";
import { xiFetch, elevenLabsConfigured } from "@/lib/elevenlabs";

export function OPTIONS() {
  return adminPreflight();
}

type RouteContext = { params: Promise<{ id: string }> };

// Heuristic: did the customer ask to speak to a human?
const HUMAN_RE =
  /\b(human|real person|speak to (someone|a person|an agent|somebody)|talk to (someone|a person|somebody)|customer (service|care|support)|representative|live agent|call me)\b/i;

/* eslint-disable @typescript-eslint/no-explicit-any */
function collected(results: any, key: string): unknown {
  const entry = results?.[key];
  return entry && typeof entry === "object" ? entry.value : undefined;
}

// Admin: full conversation detail for the console — transcript, summary,
// collected fields, the customer's WhatsApp id (needed to re-engage), and a
// flag for whether they asked for a human.
export async function GET(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) return adminJson({ error: "Unauthorized" }, 401);
  if (!elevenLabsConfigured())
    return adminJson({ error: "ELEVENLABS_API_KEY not set on server" }, 503);

  try {
    const { id } = await context.params;
    const res = await xiFetch(`/conversations/${encodeURIComponent(id)}`);
    if (!res.ok) {
      return adminJson(
        { error: `ElevenLabs error ${res.status}`, detail: await res.text() },
        502
      );
    }
    const d = await res.json();

    const transcript = (d.transcript || [])
      .filter((t: any) => t.message)
      .map((t: any) => ({ role: t.role, message: t.message }));

    const analysis = d.analysis || {};
    const dc = analysis.data_collection_results || {};
    const dvars =
      d.conversation_initiation_client_data?.dynamic_variables || {};
    const whatsappUserId =
      d.metadata?.whatsapp?.whatsapp_user_id ||
      dvars["system__caller_id"] ||
      null;

    const wantsHuman = transcript.some(
      (t: any) => t.role === "user" && HUMAN_RE.test(t.message)
    );

    return adminJson({
      conversation_id: d.conversation_id,
      status: d.status,
      channel: d.metadata?.whatsapp ? "whatsapp" : d.metadata?.phone_call ? "phone" : "unknown",
      whatsapp_user_id: whatsappUserId,
      summary: analysis.transcript_summary || null,
      customer_name: collected(dc, "customer_name") || null,
      customer_email: collected(dc, "customer_email") || null,
      purchased: collected(dc, "purchased") ?? null,
      wants_human: wantsHuman,
      message_count: transcript.length,
      transcript,
    });
  } catch (e) {
    console.error("Admin conversation detail error:", e);
    return adminJson({ error: "Failed to load conversation" }, 500);
  }
}
