import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_TO = "hello@laseryard.com";
const FROM_ADDRESS = "Laser Yard Design Team <design-team@updates.laseryard.com>";

export async function POST(req: NextRequest) {
  const { name, email, phone, hasLogo } = await req.json();

  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: "Name, email, and phone are required" },
      { status: 400 }
    );
  }

  if (!RESEND_API_KEY) {
    console.error("Resend API key not configured");
    return NextResponse.json(
      { error: "Notification service not configured" },
      { status: 500 }
    );
  }

  try {
    // Send notification to business
    const notifyRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: NOTIFICATION_TO,
        subject: `New Design Request from ${name}`,
        html: `
          <h2>New Design Request</h2>
          <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
            <tr><td style="padding:8px 16px 8px 0;color:#666;">Name</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:8px 16px 8px 0;color:#666;">Email</td><td style="padding:8px 0;font-weight:600;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
            <tr><td style="padding:8px 16px 8px 0;color:#666;">Phone</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(phone)}</td></tr>
            <tr><td style="padding:8px 16px 8px 0;color:#666;">Logo</td><td style="padding:8px 0;font-weight:600;">${hasLogo ? "Yes (uploaded)" : "No"}</td></tr>
          </table>
          <p style="margin-top:24px;font-size:12px;color:#999;">From a design request on laseryard.com</p>
        `,
      }),
    });

    if (!notifyRes.ok) {
      const err = await notifyRes.text();
      console.error("Resend notify error:", err);
      return NextResponse.json(
        { error: "Failed to send notification" },
        { status: 500 }
      );
    }

    // Send confirmation to customer
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: email,
        subject: "We received your design request - Laser Yard",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 0;">
            <h2 style="font-size:20px;margin-bottom:8px;">Hey ${escapeHtml(name)},</h2>
            <p style="color:#444;line-height:1.6;">
              We've received your design request and our team will be in touch within 24 hours to discuss your metal business card.
            </p>
            <p style="color:#444;line-height:1.6;">
              If you'd like a faster response, message us directly on WhatsApp:
            </p>
            <a href="https://wa.me/22893184418" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:500;margin:8px 0 24px;">
              Chat on WhatsApp
            </a>
            <p style="font-size:12px;color:#999;border-top:1px solid #eee;padding-top:16px;margin-top:24px;">
              Laser Yard - Premium Metal Business Cards
            </p>
          </div>
        `,
      }),
    }).catch((err) => {
      // Don't fail the request if confirmation email fails
      console.error("Resend confirmation error:", err);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Design request error:", err);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
