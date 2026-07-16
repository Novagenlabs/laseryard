import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";
import MailComposer from "nodemailer/lib/mail-composer";
import { recordInboundEmail } from "@/lib/customer-emails";

/**
 * The agent's mailbox (sales@laseryard.com on privateemail.com).
 *
 * Polled via IMAP by /api/cron/poll-inbox. New customer emails are recorded
 * and matched to WhatsApp customers; design files from known customers get
 * a one-shot in-thread acknowledgment sent over privateemail SMTP as the
 * real address, with a copy appended to the Sent folder so the team sees
 * the whole exchange in a normal mail client.
 *
 * Env: MAIL_AGENT_USER, MAIL_AGENT_PASSWORD, EMAIL_AUTO_ACK ("false" = off).
 */

const MAIL_HOST = process.env.MAIL_AGENT_HOST || "mail.privateemail.com";
const MAIL_USER = process.env.MAIL_AGENT_USER; // sales@laseryard.com
const MAIL_PASSWORD = process.env.MAIL_AGENT_PASSWORD;
const AUTO_ACK = process.env.EMAIL_AUTO_ACK !== "false";
const MAX_PER_RUN = 10;

export type PollResult = {
  processed: number;
  matched: number;
  acked: number;
};

export async function pollAgentInbox(): Promise<PollResult> {
  if (!MAIL_USER || !MAIL_PASSWORD) {
    throw new Error("MAIL_AGENT_USER / MAIL_AGENT_PASSWORD not set");
  }

  const result: PollResult = { processed: 0, matched: 0, acked: 0 };
  const client = new ImapFlow({
    host: MAIL_HOST,
    port: 993,
    secure: true,
    auth: { user: MAIL_USER, pass: MAIL_PASSWORD },
    logger: false,
  });

  await client.connect();
  const lock = await client.getMailboxLock("INBOX");
  try {
    const unseen = await client.search({ seen: false }, { uid: true });
    const uids = (unseen || []).slice(0, MAX_PER_RUN);

    for (const uid of uids) {
      const msg = await client.fetchOne(String(uid), { source: true }, { uid: true });
      if (!msg || !msg.source) continue;

      // Mark seen first so a crash mid-processing can't cause an ack loop.
      await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true });

      const parsed = await simpleParser(msg.source);
      const fromAddress = parsed.from?.value?.[0]?.address?.toLowerCase() || "";
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
  const mail = {
    from: `Laseryard <${MAIL_USER}>`,
    to: opts.to,
    subject: opts.subject ? `Re: ${opts.subject}` : "Got your design files",
    inReplyTo: opts.inReplyTo,
    references: opts.inReplyTo,
    html: `
      <div style="font-family:sans-serif;font-size:15px;color:#222;max-width:520px;">
        <p>Got your files — thanks! The design team is on it.</p>
        <p>If you haven't placed your order yet, just reply here or message us on WhatsApp and we'll get you a checkout link.</p>
        <p style="margin-top:24px;font-size:12px;color:#999;">Laseryard — laseryard.com</p>
      </div>
    `,
  };

  const raw = await new MailComposer(mail).compile().build();

  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: 465,
    secure: true,
    auth: { user: MAIL_USER, pass: MAIL_PASSWORD },
  });
  await transporter.sendMail({
    envelope: { from: MAIL_USER, to: [opts.to] },
    raw,
  });

  // Copy to Sent so the exchange is visible in the mailbox. Best-effort.
  try {
    await client.append("Sent", raw, ["\\Seen"]);
  } catch (e) {
    console.error("Could not append ack to Sent folder:", e);
  }
}
