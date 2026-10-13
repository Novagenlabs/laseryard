import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAgentRequest } from "@/lib/agent-auth";
import { WA_PHONE_NUMBER_ID, xiFetch } from "@/lib/elevenlabs";
import { normalizeWhatsappNumber } from "@/lib/bridge";

/**
 * Yara agent tool: reply to a hesitant customer with a WhatsApp VOICE NOTE
 * instead of text. The agent passes the exact words; we synthesize them in
 * Yara's voice (ElevenLabs TTS, Ogg/Opus) and send them through Meta's
 * Cloud API as a voice message (`voice: true`), which WhatsApp renders as the
 * microphone bubble. Allowed only inside the customer's open 24-hour
 * service window — i.e. in reply to a message they just sent.
 *
 * Why not ElevenLabs' own channel: its WhatsApp integration only answers
 * voice notes with voice notes and its outbound API is template-only, so an
 * agent-chosen audio reply has to go straight to Meta with our own token.
 *
 * Env: WHATSAPP_ACCESS_TOKEN (Meta system-user token), ELEVENLABS_API_KEY,
 * optional VOICE_NOTE_VOICE_ID (defaults to the agent's voice) and
 * VOICE_NOTE_MODEL_ID.
 */

const GRAPH = "https://graph.facebook.com/v22.0";
const DEFAULT_VOICE_ID = "oT5lntmfa8t37GiBBd3k"; // Stephanie — the live agent's voice
// Delivery: lower stability = more emotive, less "read aloud" (0.3 ≈ ElevenLabs'
// "creative" preset, 0.5 "natural"). VOICE_NOTE_STABILITY overrides per deploy.
const DEFAULT_STABILITY = 0.5;
const DEFAULT_SIMILARITY = 0.75;
const MAX_CHARS = 600; // ~45 seconds spoken
const MAX_NOTES_PER_CONVERSATION = 2;
const NOTE_WINDOW_MS = 24 * 60 * 60 * 1000;

// Voice notes already sent per conversation/customer (single-instance app).
const sentLog = new Map<string, number[]>();

function notesSent(key: string): number {
  const now = Date.now();
  const recent = (sentLog.get(key) || []).filter((t) => now - t < NOTE_WINDOW_MS);
  sentLog.set(key, recent);
  return recent.length;
}

function recordNote(key: string) {
  sentLog.set(key, [...(sentLog.get(key) || []), Date.now()]);
}

const TEXT_FALLBACK =
  "Reply to the customer in TEXT instead, as you normally would.";

function envNumber(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : fallback;
}

// Audio tags such as [exhales] or [curious] are performed by the v3/v4 models
// but READ ALOUD by Flash, so strip them before falling back that far.
function textForModel(text: string, model: string): string {
  if (/^eleven_v[34]/.test(model)) return text;
  return text.replace(/\[[^\]\n]{1,30}\]/g, "").replace(/\s{2,}/g, " ").trim();
}

async function synthesize(text: string): Promise<Buffer> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY not set");
  const voiceId = process.env.VOICE_NOTE_VOICE_ID || DEFAULT_VOICE_ID;
  // Notes aren't real-time, so take the highest-quality model (Eleven v4, the
  // same generation the agent speaks with on calls via v4 Turbo); fall back
  // down the ladder if a model is unavailable.
  const models = [process.env.VOICE_NOTE_MODEL_ID || "eleven_v4", "eleven_v4_turbo", "eleven_flash_v2_5"];
  const voiceSettings = {
    stability: envNumber("VOICE_NOTE_STABILITY", DEFAULT_STABILITY),
    similarity_boost: envNumber("VOICE_NOTE_SIMILARITY", DEFAULT_SIMILARITY),
  };
  let lastError = "";
  for (const model of models) {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=opus_48000_32`,
      {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({ text: textForModel(text, model), model_id: model, voice_settings: voiceSettings }),
      }
    );
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      // WhatsApp voice notes must be Ogg/Opus; ElevenLabs' opus output is Ogg-wrapped.
      if (buf.subarray(0, 4).toString("latin1") === "OggS") return buf;
      lastError = "unexpected audio container";
    } else {
      lastError = `${model}: ${res.status} ${(await res.text()).slice(0, 200)}`;
    }
  }
  throw new Error(`TTS failed: ${lastError}`);
}

// Which business number this conversation is on (live vs staging) — read from
// the conversation itself so staging tests send from the staging number.
// NOTE: the conversation's metadata.text_only reads false while a session is
// still open (it only settles once the session closes), so it must NOT be
// used to detect voice calls here — the tool passes system__is_text_only.
async function resolveSender(
  conversationId: string | undefined,
  explicit: string | undefined
): Promise<{ senderId: string; customer?: string }> {
  if (explicit && /^\d{6,}$/.test(explicit)) return { senderId: explicit };
  if (conversationId && /^conv_[A-Za-z0-9]+$/.test(conversationId)) {
    try {
      const res = await xiFetch(`/conversations/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        const wa = data?.metadata?.whatsapp || {};
        return {
          senderId: wa.whatsapp_phone_number_id || WA_PHONE_NUMBER_ID,
          customer: wa.whatsapp_user_id,
        };
      }
    } catch (e) {
      console.error("send-voice-note: conversation lookup failed:", e);
    }
  }
  return { senderId: WA_PHONE_NUMBER_ID };
}

// The agent's own channel flag (system__is_text_only), bound on the tool.
function isVoiceCall(flag: unknown): boolean {
  if (typeof flag === "boolean") return flag === false;
  if (typeof flag === "string") return /^(false|no|0)$/i.test(flag.trim());
  return false;
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedAgentRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { sent: false, note: `Voice notes are not configured on the server. ${TEXT_FALLBACK}` },
      { status: 200 }
    );
  }

  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const conversationId =
      typeof body?.conversation_id === "string" ? body.conversation_id.trim() : undefined;

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }
    if (message.length > MAX_CHARS) {
      return NextResponse.json(
        { sent: false, note: `That message is too long for a voice note (max ${MAX_CHARS} characters). Shorten it to one or two warm sentences and call again, or ${TEXT_FALLBACK.toLowerCase()}` },
        { status: 200 }
      );
    }
    if (/https?:\/\/|www\.|@|\bLY-[A-Z0-9]{4}-[A-Z0-9]{4}\b/i.test(message)) {
      return NextResponse.json(
        { sent: false, note: `Voice notes must not carry links, email addresses or order numbers — those have to be typed. Say the reassurance in the voice note and put any precise details in a separate text message. Rephrase and call again, or ${TEXT_FALLBACK.toLowerCase()}` },
        { status: 200 }
      );
    }

    if (isVoiceCall(body?.text_only)) {
      // On a call the words the agent composed are still the right words —
      // hand them straight back so it simply says them (the agent's own TTS
      // performs the audio tags).
      return NextResponse.json(
        {
          sent: false,
          say_this_now: message,
          note: "VOICE CALL: voice notes do not exist on calls and nothing was sent. Do NOT mention a voice note. Say the words in say_this_now out loud right now, warmly, then wait for the caller.",
        },
        { status: 200 }
      );
    }
    const resolved = await resolveSender(
      conversationId,
      typeof body?.whatsapp_phone_number_id === "string" ? body.whatsapp_phone_number_id : undefined
    );
    const customer =
      normalizeWhatsappNumber(body?.whatsapp_user_id) ||
      normalizeWhatsappNumber(resolved.customer || "");
    if (!customer) {
      return NextResponse.json(
        { sent: false, note: `Could not identify this customer's WhatsApp number. ${TEXT_FALLBACK}` },
        { status: 200 }
      );
    }

    const key = `${resolved.senderId}:${customer}`;
    if (notesSent(key) >= MAX_NOTES_PER_CONVERSATION) {
      return NextResponse.json(
        { sent: false, note: `You've already sent ${MAX_NOTES_PER_CONVERSATION} voice notes to this customer today — that's the limit. ${TEXT_FALLBACK}` },
        { status: 200 }
      );
    }

    // 1) Synthesize in Yara's voice (Ogg/Opus, mono).
    const audio = await synthesize(message);

    // 2) Upload the media to Meta.
    const form = new FormData();
    form.append("messaging_product", "whatsapp");
    form.append("type", "audio/ogg");
    form.append("file", new Blob([new Uint8Array(audio)], { type: "audio/ogg" }), "voice-note.ogg");
    const upload = await fetch(`${GRAPH}/${resolved.senderId}/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const uploadJson = await upload.json().catch(() => ({}));
    if (!upload.ok || !uploadJson?.id) {
      console.error("send-voice-note: media upload failed:", upload.status, JSON.stringify(uploadJson).slice(0, 300));
      return NextResponse.json(
        { sent: false, note: `The voice note could not be prepared right now. ${TEXT_FALLBACK}` },
        { status: 200 }
      );
    }

    // 3) Send it as a voice message.
    const send = await fetch(`${GRAPH}/${resolved.senderId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: customer,
        type: "audio",
        audio: { id: uploadJson.id, voice: true },
      }),
    });
    const sendJson = await send.json().catch(() => ({}));
    if (!send.ok || !sendJson?.messages?.[0]?.id) {
      const code = sendJson?.error?.code;
      console.error("send-voice-note: send failed:", send.status, JSON.stringify(sendJson).slice(0, 300));
      const why =
        code === 131047 || code === 131026
          ? "WhatsApp won't deliver a voice note to this customer right now (their message window has closed or the number can't receive it)."
          : "WhatsApp did not accept the voice note.";
      return NextResponse.json({ sent: false, note: `${why} ${TEXT_FALLBACK}` }, { status: 200 });
    }

    recordNote(key);
    const seconds = Math.max(3, Math.round(message.split(/\s+/).length / 2.6));
    return NextResponse.json({
      sent: true,
      approx_seconds: seconds,
      note: "Voice note delivered to the customer. Do NOT repeat what it says in text. If you must reply in text at all, keep it to one short line (e.g. '🎙️ Sent you a quick voice note') — or send nothing and wait for them.",
    });
  } catch (e) {
    console.error("send-voice-note error:", e);
    return NextResponse.json(
      { sent: false, note: `The voice note could not be sent. ${TEXT_FALLBACK}` },
      { status: 200 }
    );
  }
}
