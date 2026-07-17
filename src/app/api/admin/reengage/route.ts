import { NextRequest } from "next/server";
import { adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";
import {
  xiFetch,
  AGENT_ID,
  WA_PHONE_NUMBER_ID,
  REENGAGE_TEMPLATES,
  elevenLabsConfigured,
} from "@/lib/elevenlabs";

export function OPTIONS() {
  return adminPreflight();
}

/**
 * Admin: re-engage a customer by sending an approved WhatsApp template
 * through their assigned agent. When they reply, Yara takes over with memory.
 *
 * POST { whatsapp_user_id, template_name, body_params: string[], button_param? }
 */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return adminJson({ error: "Unauthorized" }, 401);
  if (!elevenLabsConfigured())
    return adminJson({ error: "ELEVENLABS_API_KEY not set on server" }, 503);

  try {
    const body = await request.json();
    const { whatsapp_user_id, template_name, body_params, button_param } = body ?? {};

    if (!whatsapp_user_id || typeof whatsapp_user_id !== "string") {
      return adminJson({ error: "whatsapp_user_id is required" }, 400);
    }
    const tpl = REENGAGE_TEMPLATES[template_name];
    if (!tpl) {
      return adminJson(
        { error: `template_name must be one of: ${Object.keys(REENGAGE_TEMPLATES).join(", ")}` },
        400
      );
    }
    if (!Array.isArray(body_params) || body_params.length !== tpl.bodyParams) {
      return adminJson(
        { error: `${template_name} needs exactly ${tpl.bodyParams} body params` },
        400
      );
    }
    if (tpl.hasButton && (!button_param || typeof button_param !== "string")) {
      return adminJson(
        { error: `${template_name} needs a button_param (the checkout URL suffix)` },
        400
      );
    }

    const template_params: unknown[] = [
      {
        type: "body",
        parameters: body_params.map((t: string) => ({ type: "text", text: String(t) })),
      },
    ];
    if (tpl.hasButton) {
      template_params.push({
        type: "button",
        sub_type: "url",
        index: 0,
        parameters: [{ type: "text", text: String(button_param) }],
      });
    }

    const res = await xiFetch("/whatsapp/outbound-message", {
      method: "POST",
      body: JSON.stringify({
        whatsapp_phone_number_id: WA_PHONE_NUMBER_ID,
        whatsapp_user_id,
        template_name,
        template_language_code: "en",
        template_params,
        agent_id: AGENT_ID,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return adminJson(
        { error: "Send failed", detail: (data as any)?.detail || data },
        502
      );
    }
    return adminJson({ sent: true, conversation_id: (data as any)?.conversation_id || null });
  } catch (e) {
    console.error("Admin reengage error:", e);
    return adminJson({ error: "Failed to send re-engagement" }, 500);
  }
}
