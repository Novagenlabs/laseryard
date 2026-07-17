/**
 * Server-side ElevenLabs Agents API helpers, used by the admin agent console
 * (list conversations, read a transcript, re-engage a customer by template).
 */

export const XI_BASE = "https://api.elevenlabs.io/v1/convai";
export const AGENT_ID =
  process.env.ELEVENLABS_AGENT_ID || "agent_4601kkf597f6ecaby27xxedbkk6r";
export const WA_PHONE_NUMBER_ID =
  process.env.WHATSAPP_PHONE_NUMBER_ID || "1024784710715053";

export function elevenLabsConfigured(): boolean {
  return !!process.env.ELEVENLABS_API_KEY;
}

export async function xiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY not set");
  return fetch(`${XI_BASE}${path}`, {
    ...init,
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
}

// Re-engagement templates the console is allowed to send, with their
// expected parameter shape. Anything else is rejected server-side.
export const REENGAGE_TEMPLATES: Record<
  string,
  { bodyParams: number; hasButton: boolean; label: string }
> = {
  laseryard_followup: { bodyParams: 2, hasButton: false, label: "Follow-up" },
  checkout_reminder: { bodyParams: 2, hasButton: true, label: "Checkout reminder" },
  checkout_link: { bodyParams: 3, hasButton: false, label: "Checkout link" },
};
