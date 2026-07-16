import { NextRequest, NextResponse } from "next/server";
import { pollAgentInbox } from "@/lib/mail-agent";

/**
 * Cron-triggered poll of the agent mailbox (sales@laseryard.com).
 * Ping every ~2 minutes with the secret, e.g. from cron-job.org:
 *   GET https://laseryard.com/api/cron/poll-inbox
 *   header: x-cron-secret: $CRON_SECRET
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rewindBy = parseInt(
      request.nextUrl.searchParams.get("rewind") || "0",
      10
    );
    const result = await pollAgentInbox({ rewindBy });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("Inbox poll failed:", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "poll failed" },
      { status: 500 }
    );
  }
}
