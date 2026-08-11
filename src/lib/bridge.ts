import { getDb } from "@/lib/db";
import { xiFetch } from "@/lib/elevenlabs";

/**
 * Human bridge: Yara escalates a customer question to the team over WhatsApp,
 * the team member replies in their own WhatsApp thread (which reaches the
 * agent in staff mode), and the answer is relayed back to the customer.
 *
 * All outbound sends go through the ElevenLabs outbound-message API, which is
 * template-only — so both directions ride on approved templates, with a
 * pull-mode fallback: if a send fails, the question/answer is still stored and
 * Yara delivers it in-conversation the next time that person messages.
 */

export type BridgeQuestion = {
  id: number;
  customerNumber: string;
  question: string;
  context: string | null;
  status: "open" | "answered" | "closed";
  answer: string | null;
  customerMessage: string | null;
  answeredBy: string | null;
  pingSent: boolean;
  delivered: boolean;
  senderPhoneNumberId: string | null;
  agentId: string | null;
  createdAt: string;
  answeredAt: string | null;
};

// Team WhatsApp numbers allowed to answer bridge questions. Comparison is on
// digits only so "+234...", "234..." and "whatsapp:+234..." all match.
export function teamNumbers(): string[] {
  return (process.env.BRIDGE_TEAM_NUMBERS ?? "+2349073431657")
    .split(",")
    .map((n) => n.replace(/\D/g, ""))
    .filter(Boolean);
}

export function isTeamNumber(normalized: string): boolean {
  return teamNumbers().includes(normalized.replace(/\D/g, ""));
}

// Same normalization as send-card-photo: system__caller_id arrives in several
// shapes; WhatsApp sends require exactly +<digits>.
export function normalizeWhatsappNumber(raw: unknown): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
}

let ensured: Promise<unknown> | null = null;
function ensureTable() {
  if (!ensured) {
    const sql = getDb();
    ensured = sql`
      CREATE TABLE IF NOT EXISTS bridge_questions (
        id SERIAL PRIMARY KEY,
        customer_number TEXT NOT NULL,
        question TEXT NOT NULL,
        context TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        answer TEXT,
        customer_message TEXT,
        answered_by TEXT,
        ping_sent BOOLEAN NOT NULL DEFAULT false,
        delivered BOOLEAN NOT NULL DEFAULT false,
        sender_phone_number_id TEXT,
        agent_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        answered_at TIMESTAMPTZ
      )
    `;
  }
  return ensured;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToQuestion(row: any): BridgeQuestion {
  return {
    id: row.id,
    customerNumber: row.customer_number,
    question: row.question,
    context: row.context,
    status: row.status,
    answer: row.answer,
    customerMessage: row.customer_message,
    answeredBy: row.answered_by,
    pingSent: row.ping_sent,
    delivered: row.delivered,
    senderPhoneNumberId: row.sender_phone_number_id,
    agentId: row.agent_id,
    createdAt: row.created_at,
    answeredAt: row.answered_at,
  };
}

export async function findOpenQuestionForCustomer(
  customerNumber: string
): Promise<BridgeQuestion | null> {
  await ensureTable();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM bridge_questions
    WHERE customer_number = ${customerNumber} AND status = 'open'
    ORDER BY created_at DESC LIMIT 1
  `;
  return rows.length ? rowToQuestion(rows[0]) : null;
}

export async function createQuestion(input: {
  customerNumber: string;
  question: string;
  context?: string | null;
  senderPhoneNumberId?: string | null;
  agentId?: string | null;
}): Promise<BridgeQuestion> {
  await ensureTable();
  const sql = getDb();
  const rows = await sql`
    INSERT INTO bridge_questions
      (customer_number, question, context, sender_phone_number_id, agent_id)
    VALUES
      (${input.customerNumber}, ${input.question}, ${input.context ?? null},
       ${input.senderPhoneNumberId ?? null}, ${input.agentId ?? null})
    RETURNING *
  `;
  return rowToQuestion(rows[0]);
}

export async function markPingSent(id: number): Promise<void> {
  const sql = getDb();
  await sql`UPDATE bridge_questions SET ping_sent = true WHERE id = ${id}`;
}

export async function openQuestions(): Promise<BridgeQuestion[]> {
  await ensureTable();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM bridge_questions WHERE status = 'open'
    ORDER BY created_at ASC LIMIT 20
  `;
  return rows.map(rowToQuestion);
}

export async function recentQuestions(limit = 20): Promise<BridgeQuestion[]> {
  await ensureTable();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM bridge_questions WHERE status != 'open'
    ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows.map(rowToQuestion);
}

export async function questionsForCustomer(
  customerNumber: string,
  limit = 3
): Promise<BridgeQuestion[]> {
  await ensureTable();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM bridge_questions
    WHERE customer_number = ${customerNumber}
    ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows.map(rowToQuestion);
}

export async function getQuestion(id: number): Promise<BridgeQuestion | null> {
  await ensureTable();
  const sql = getDb();
  const rows = await sql`SELECT * FROM bridge_questions WHERE id = ${id} LIMIT 1`;
  return rows.length ? rowToQuestion(rows[0]) : null;
}

export async function markAnswered(input: {
  id: number;
  answer: string;
  customerMessage: string;
  answeredBy: string;
  delivered: boolean;
}): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE bridge_questions SET
      status = 'answered',
      answer = ${input.answer},
      customer_message = ${input.customerMessage},
      answered_by = ${input.answeredBy},
      delivered = ${input.delivered},
      answered_at = now()
    WHERE id = ${input.id}
  `;
}

export async function markDelivered(ids: number[]): Promise<void> {
  if (!ids.length) return;
  const sql = getDb();
  await sql`
    UPDATE bridge_questions SET delivered = true
    WHERE id = ANY(${ids})
  `;
}

export async function closeQuestion(id: number): Promise<void> {
  await ensureTable();
  const sql = getDb();
  await sql`
    UPDATE bridge_questions SET status = 'closed' WHERE id = ${id}
  `;
}

// ---------------------------------------------------------------------------
// Sends (ElevenLabs outbound-message API — template-only)

// Primary templates are utility-category (create once in WhatsApp Manager);
// until they're approved, the approved marketing template laseryard_followup
// ("Hi {{1}}, ... {{2}}") is tried as a fallback so the loop stays testable.
const PING_TEMPLATE = () => process.env.BRIDGE_PING_TEMPLATE || "team_question";
const ANSWER_TEMPLATE = () =>
  process.env.BRIDGE_ANSWER_TEMPLATE || "team_answer";
const FALLBACK_TEMPLATE = "laseryard_followup";

function isUsNumber(normalized: string): boolean {
  return normalized.length === 12 && normalized.startsWith("+1");
}

async function sendTemplate(opts: {
  senderId: string;
  agentId: string;
  to: string;
  template: string;
  bodyParams: string[];
}): Promise<{ ok: boolean; status: number; detail: string }> {
  const res = await xiFetch("/whatsapp/outbound-message", {
    method: "POST",
    body: JSON.stringify({
      whatsapp_phone_number_id: opts.senderId,
      whatsapp_user_id: opts.to,
      agent_id: opts.agentId,
      template_name: opts.template,
      template_language_code: "en",
      template_params: [
        {
          type: "body",
          parameters: opts.bodyParams.map((t) => ({ type: "text", text: t })),
        },
      ],
    }),
  });
  const detail = res.ok ? "" : await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, detail };
}

// WhatsApp template body params reject newlines/tabs and 4+ consecutive
// spaces (error 132000); collapse whitespace and keep params short.
function asParam(text: string, max = 900): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

/** Ping every team number about a new question. True if at least one send landed. */
export async function sendTeamPing(opts: {
  senderId: string;
  agentId: string;
  question: BridgeQuestion;
}): Promise<boolean> {
  const q = opts.question;
  const summary = asParam(
    `${q.question}${q.context ? ` (Context: ${q.context})` : ""}`
  );
  let sent = false;
  for (const digits of teamNumbers()) {
    const to = `+${digits}`;
    const primary = await sendTemplate({
      senderId: opts.senderId,
      agentId: opts.agentId,
      to,
      template: PING_TEMPLATE(),
      bodyParams: [asParam(`Q#${q.id} from ${q.customerNumber}`), summary],
    });
    if (primary.ok) {
      sent = true;
      continue;
    }
    console.error("bridge ping primary template failed:", primary.status, primary.detail);
    const fallback = await sendTemplate({
      senderId: opts.senderId,
      agentId: opts.agentId,
      to,
      template: FALLBACK_TEMPLATE,
      bodyParams: [
        "Team",
        asParam(`Q#${q.id} from ${q.customerNumber}: ${summary} — reply here with the answer and Yara passes it on`),
      ],
    });
    if (fallback.ok) sent = true;
    else console.error("bridge ping fallback template failed:", fallback.status, fallback.detail);
  }
  return sent;
}

/** Push the team's answer to the customer. True if the send landed. */
export async function sendAnswerToCustomer(opts: {
  senderId: string;
  agentId: string;
  customerNumber: string;
  customerMessage: string;
}): Promise<boolean> {
  const primary = await sendTemplate({
    senderId: opts.senderId,
    agentId: opts.agentId,
    to: opts.customerNumber,
    template: ANSWER_TEMPLATE(),
    bodyParams: [asParam(opts.customerMessage)],
  });
  if (primary.ok) return true;
  console.error("bridge answer primary template failed:", primary.status, primary.detail);

  // laseryard_followup is marketing-category: skip the fallback for US
  // numbers (Meta's marketing-template pause, error 131049).
  if (isUsNumber(opts.customerNumber)) return false;
  const fallback = await sendTemplate({
    senderId: opts.senderId,
    agentId: opts.agentId,
    to: opts.customerNumber,
    template: FALLBACK_TEMPLATE,
    bodyParams: ["there", asParam(opts.customerMessage)],
  });
  if (!fallback.ok) {
    console.error("bridge answer fallback template failed:", fallback.status, fallback.detail);
  }
  return fallback.ok;
}
