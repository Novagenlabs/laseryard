import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";
import MailComposer from "nodemailer/lib/mail-composer";
import { getDb } from "@/lib/db";
import { recordInboundEmail } from "@/lib/customer-emails";
import {
  renderBrandedEmail,
  resolveEmailRecipient,
  ccFor,
} from "@/lib/email-template";

/**
 * The agent's mail identity: sales@laseryard.com — an alias that delivers
 * into a real privateemail mailbox (MAIL_AGENT_USER, e.g. tracy@laseryard.com).
 *
 * The poller logs into the real mailbox but only processes messages
 * addressed to the alias, and it never changes read/unread flags — progress
 * is tracked by IMAP UID in Neon, so the human owner's inbox looks
 * completely untouched. Acks go out over SMTP as the alias, with a copy in
 * the Sent folder.
 *
 * Env: MAIL_AGENT_USER (real mailbox login), MAIL_AGENT_PASSWORD,
 *      MAIL_AGENT_ALIAS (default sales@laseryard.com),
 *      EMAIL_AUTO_ACK ("false" = off), MAIL_AGENT_HOST (default privateemail).
 */

const MAIL_HOST = process.env.MAIL_AGENT_HOST || "mail.privateemail.com";
// 993 = implicit TLS (default). Set MAIL_AGENT_IMAP_PORT=143 for STARTTLS —
// useful when a network filter interferes with one port but not the other.
const IMAP_PORT = parseInt(process.env.MAIL_AGENT_IMAP_PORT || "993", 10);
const MAIL_USER = process.env.MAIL_AGENT_USER;
const MAIL_PASSWORD = process.env.MAIL_AGENT_PASSWORD;
const MAIL_ALIAS = (
  process.env.MAIL_AGENT_ALIAS || "sales@laseryard.com"
).toLowerCase();
const AUTO_ACK = process.env.EMAIL_AUTO_ACK !== "false";
const MAX_PER_RUN = 10;

export type PollResult = {
  scanned: number;
  processed: number;
  matched: number;
  acked: number;
};

let ensured: Promise<unknown> | null = null;
function ensureState() {
  if (!ensured) {
    const sql = getDb();
    ensured = sql`
      CREATE TABLE IF NOT EXISTS mail_agent_state (
        mailbox TEXT PRIMARY KEY,
        uid_validity BIGINT NOT NULL,
        last_uid BIGINT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
  }
  return ensured;
}

async function getState(
  mailbox: string
): Promise<{ uidValidity: bigint; lastUid: number } | null> {
  await ensureState();
  const sql = getDb();
  const rows = await sql`
    SELECT uid_validity, last_uid FROM mail_agent_state WHERE mailbox = ${mailbox}
  `;
  return rows.length
    ? { uidValidity: BigInt(rows[0].uid_validity), lastUid: Number(rows[0].last_uid) }
    : null;
}

async function setState(
  mailbox: string,
  uidValidity: bigint,
  lastUid: number
): Promise<void> {
  await ensureState();
  const sql = getDb();
  await sql`
    INSERT INTO mail_agent_state (mailbox, uid_validity, last_uid)
    VALUES (${mailbox}, ${uidValidity.toString()}, ${lastUid})
    ON CONFLICT (mailbox) DO UPDATE SET
      uid_validity = EXCLUDED.uid_validity,
      last_uid = EXCLUDED.last_uid,
      updated_at = now()
  `;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function envelopeAddresses(envelope: any): string[] {
  const all = [
    ...(envelope?.to || []),
    ...(envelope?.cc || []),
    ...(envelope?.bcc || []),
  ];
  return all
    .map((a: any) => String(a?.address || "").toLowerCase())
    .filter(Boolean);
}

export async function pollAgentInbox(options?: {
  /** Re-scan this many UIDs before the watermark (stranded-mail recovery). */
  rewindBy?: number;
}): Promise<PollResult> {
  if (!MAIL_USER || !MAIL_PASSWORD) {
    throw new Error("MAIL_AGENT_USER / MAIL_AGENT_PASSWORD not set");
  }

  const result: PollResult = { scanned: 0, processed: 0, matched: 0, acked: 0 };
  const client = new ImapFlow({
    host: MAIL_HOST,
    port: IMAP_PORT,
    secure: IMAP_PORT === 993,
    auth: { user: MAIL_USER, pass: MAIL_PASSWORD },
    logger: false,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
  });
  // imapflow emits late socket errors outside our try/catch; without a
  // handler they become uncaughtException and can take the process down.
  client.on("error", (e: Error) => {
    console.error("IMAP connection error:", e.message);
  });

  await client.connect();
  const lock = await client.getMailboxLock("INBOX");
  try {
    const mailbox = client.mailbox;
    if (!mailbox || typeof mailbox === "boolean") return result;
    const uidValidity = mailbox.uidValidity ?? BigInt(0);
    const maxUid = mailbox.uidNext ? Number(mailbox.uidNext) - 1 : 0;

    const state = await getState(MAIL_USER);
    let lastUid: number;
    if (!state || state.uidValidity !== uidValidity) {
      // First run (or mailbox UIDs were reset): start from now, don't
      // trawl history — old mail was handled by humans already.
      await setState(MAIL_USER, uidValidity, maxUid);
      return result;
    }
    lastUid = state.lastUid;
    if (options?.rewindBy && options.rewindBy > 0) {
      lastUid = Math.max(0, lastUid - Math.min(options.rewindBy, 100));
    }
    if (maxUid <= lastUid) return result;

    let processedUpTo = lastUid;
    for await (const msg of client.fetch(
      { uid: `${lastUid + 1}:*` },
      { envelope: true, uid: true },
      { uid: true }
    )) {
      if (msg.uid <= lastUid) continue; // "N:*" can echo the last message
      result.scanned++;
      if (result.processed >= MAX_PER_RUN) break;
      processedUpTo = Math.max(processedUpTo, msg.uid);

      // Only handle mail addressed to the alias — the rest of the inbox
      // belongs to its human owner and is left completely untouched.
      if (!envelopeAddresses(msg.envelope).includes(MAIL_ALIAS)) continue;

      const full = await client.fetchOne(
        String(msg.uid),
        { source: true },
        { uid: true }
      );
      if (!full || !full.source) continue;

      const parsed = await simpleParser(full.source);
      const fromAddress =
        parsed.from?.value?.[0]?.address?.toLowerCase() || "";
      if (!fromAddress.includes("@")) continue;
      if (fromAddress.endsWith("laseryard.com")) continue; // our own mail

      const hasAttachments = (parsed.attachments || []).length > 0;
      const { whatsappUserId } = await recordInboundEmail({
        fromAddress,
        subject: parsed.subject,
        snippet: parsed.text || "",
        hasAttachments,
        messageId: parsed.messageId || null,
      });

      result.processed++;
      if (whatsappUserId) result.matched++;

      if (AUTO_ACK && whatsappUserId && hasAttachments) {
        await sendAck(client, {
          to: fromAddress,
          subject: parsed.subject || "",
          inReplyTo: parsed.messageId || undefined,
        });
        result.acked++;
      }
    }

    await setState(MAIL_USER, uidValidity, processedUpTo);
  } finally {
    lock.release();
    await client.logout().catch(() => {});
  }

  return result;
}

async function sendAck(
  client: ImapFlow,
  opts: { to: string; subject: string; inReplyTo?: string }
): Promise<void> {
  if (!MAIL_USER || !MAIL_PASSWORD) return;

  const { html, text } = renderBrandedEmail({
    preheader: "Your design files arrived — the design team is on it.",
    heading: "Got your files 🙌",
    paragraphsHtml: [
      `Thanks — your design files came through and the design team is on it.`,
      `If you haven't placed your order yet, just reply here or message us on WhatsApp and we'll get you a checkout link.`,
    ],
    text: `Got your files — thanks! The design team is on it.

If you haven't placed your order yet, just reply here or message us on WhatsApp and we'll get you a checkout link.`,
  });

  const { to, subjectPrefix } = resolveEmailRecipient(opts.to);
  const cc = ccFor(to);
  const mail = {
    from: `Laseryard <${MAIL_ALIAS}>`,
    to,
    cc,
    subject: `${subjectPrefix}${opts.subject ? `Re: ${opts.subject}` : "Got your design files"}`,
    inReplyTo: opts.inReplyTo,
    references: opts.inReplyTo,
    html,
    text,
  };

  const raw = await new MailComposer(mail).compile().build();

  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: 465,
    secure: true,
    auth: { user: MAIL_USER, pass: MAIL_PASSWORD },
  });
  await transporter.sendMail({
    envelope: { from: MAIL_USER, to: [to, ...(cc || [])] },
    raw,
  });

  // Copy to Sent so the exchange is visible in the mailbox. Best-effort.
  try {
    await client.append("Sent", raw, ["\\Seen"]);
  } catch (e) {
    console.error("Could not append ack to Sent folder:", e);
  }
}
