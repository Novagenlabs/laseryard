import { getDb } from "@/lib/db";

/**
 * Inbound customer emails (forwarded from hello@laseryard.com via Resend
 * Inbound), matched to WhatsApp customers through customer_memory so the
 * agent can see email activity mid-conversation.
 */

export type CustomerEmail = {
  id: string;
  fromAddress: string;
  subject: string | null;
  snippet: string | null;
  hasAttachments: boolean;
  whatsappUserId: string | null;
  receivedAt: string;
};

let ensured: Promise<unknown> | null = null;
function ensureTable() {
  if (!ensured) {
    const sql = getDb();
    ensured = sql`
      CREATE TABLE IF NOT EXISTS customer_emails (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        from_address TEXT NOT NULL,
        subject TEXT,
        snippet TEXT,
        has_attachments BOOLEAN NOT NULL DEFAULT false,
        whatsapp_user_id TEXT,
        message_id TEXT,
        received_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
  }
  return ensured;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToEmail(row: any): CustomerEmail {
  return {
    id: row.id,
    fromAddress: row.from_address,
    subject: row.subject,
    snippet: row.snippet,
    hasAttachments: row.has_attachments,
    whatsappUserId: row.whatsapp_user_id,
    receivedAt: row.received_at,
  };
}

export async function recordInboundEmail(input: {
  fromAddress: string;
  subject?: string | null;
  snippet?: string | null;
  hasAttachments: boolean;
  messageId?: string | null;
}): Promise<{ whatsappUserId: string | null }> {
  await ensureTable();
  const sql = getDb();
  const from = input.fromAddress.trim().toLowerCase();

  // Match the sender to a known WhatsApp customer via memory.
  const match = await sql`
    SELECT whatsapp_user_id FROM customer_memory
    WHERE lower(email) = ${from} LIMIT 1
  `;
  const whatsappUserId = match.length ? match[0].whatsapp_user_id : null;

  await sql`
    INSERT INTO customer_emails (from_address, subject, snippet, has_attachments, whatsapp_user_id, message_id)
    VALUES (${from}, ${input.subject ?? null}, ${(input.snippet ?? "").slice(0, 500) || null},
            ${input.hasAttachments}, ${whatsappUserId}, ${input.messageId ?? null})
  `;

  return { whatsappUserId };
}

export async function getRecentEmailsForCustomer(
  whatsappUserId: string,
  limit = 5,
  knownEmail?: string | null,
  claimedEmail?: string | null
): Promise<CustomerEmail[]> {
  await ensureTable();
  const sql = getDb();
  const email = knownEmail?.trim().toLowerCase() || null;
  const claimed = claimedEmail?.trim().toLowerCase() || null;
  // Match by WhatsApp identity, by the address memory knows them by, or by
  // an address they just claimed in conversation — customers routinely send
  // from a different address than the one they first mentioned.
  const rows = await sql`
    SELECT * FROM customer_emails
    WHERE whatsapp_user_id = ${whatsappUserId}
       OR (${email}::text IS NOT NULL AND lower(from_address) = ${email})
       OR (${claimed}::text IS NOT NULL AND lower(from_address) = ${claimed})
    ORDER BY received_at DESC LIMIT ${limit}
  `;

  // Claimed address matched an unlinked email: link it to this customer
  // permanently so future lookups don't depend on them repeating it.
  if (claimed && rows.some((r: any) => r.from_address === claimed && !r.whatsapp_user_id)) {
    await sql`
      UPDATE customer_emails SET whatsapp_user_id = ${whatsappUserId}
      WHERE lower(from_address) = ${claimed} AND whatsapp_user_id IS NULL
    `;
  }

  return rows.map(rowToEmail);
}

export function formatEmailsContext(emails: CustomerEmail[]): string {
  if (!emails.length) return "";
  const lines = emails.map((e) => {
    const when = new Date(e.receivedAt).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `- [${when}] "${e.subject || "(no subject)"}"${e.hasAttachments ? " (with attachments)" : ""}`;
  });
  return `Emails this client sent us (newest first):\n${lines.join("\n")}`;
}
