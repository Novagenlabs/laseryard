/**
 * Branded email rendering + the customer-send safety flag.
 *
 * Every customer-facing email goes through renderBrandedEmail (HTML + plain
 * text) and resolveEmailRecipient. Until AGENT_EMAIL_MODE=live is set in the
 * environment, customer emails are redirected to the team inbox with the
 * intended recipient marked in the subject — so the whole pipeline can be
 * tested end-to-end on a live system without ever emailing a real customer.
 */

const SITE = "https://laseryard.com";
const GOLD = "#F7C600";
const INK = "#15161d";
const BODY_TEXT = "#3a3d46";
const MUTED = "#9a9da8";
const BG = "#f5f4f0";

export const EMAIL_LIVE = process.env.AGENT_EMAIL_MODE === "live";
const TEST_INBOX = "hello@laseryard.com";

export function resolveEmailRecipient(intended: string): {
  to: string;
  subjectPrefix: string;
  testMode: boolean;
} {
  if (EMAIL_LIVE) return { to: intended, subjectPrefix: "", testMode: false };
  return {
    to: TEST_INBOX,
    subjectPrefix: `[TEST → ${intended}] `,
    testMode: true,
  };
}

export type BrandedEmail = {
  /** Hidden inbox-preview line */
  preheader: string;
  heading: string;
  /** Paragraphs as HTML strings (already escaped where needed) */
  paragraphsHtml: string[];
  /** Plain-text version, full body */
  text: string;
  cta?: { label: string; url: string };
};

export function renderBrandedEmail(input: BrandedEmail): {
  html: string;
  text: string;
} {
  const paragraphs = input.paragraphsHtml
    .map(
      (p) =>
        `<p style="margin:0 0 16px 0;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:${BODY_TEXT};">${p}</p>`
    )
    .join("\n");

  const cta = input.cta
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px 0;">
        <tr>
          <td align="center" bgcolor="${GOLD}" style="border-radius:10px;">
            <a href="${input.cta.url}"
               style="display:inline-block;padding:14px 32px;font-family:Montserrat,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:${INK};text-decoration:none;border-radius:10px;">
              ${input.cta.label}
            </a>
          </td>
        </tr>
      </table>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${input.heading}</title>
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Poppins:wght@400;600&display=swap" rel="stylesheet" />
  <!--<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BG};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${input.preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px 16px 0 0;padding:26px 36px 22px 36px;border-bottom:3px solid ${GOLD};">
              <a href="${SITE}" style="text-decoration:none;">
                <img src="${SITE}/images/laseryard_logos/logo_light.png" alt="Laseryard" height="34"
                     style="display:block;height:34px;width:auto;border:0;" />
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:36px;">
              <h1 style="margin:0 0 18px 0;font-family:Montserrat,Helvetica,Arial,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.3px;color:${INK};">
                ${input.heading}
              </h1>
              ${paragraphs}
              ${cta}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${INK};border-radius:0 0 16px 16px;padding:26px 36px;">
              <img src="${SITE}/images/laseryard_logos/logo_dark.png" alt="Laseryard" height="24"
                   style="display:block;height:24px;width:auto;border:0;margin-bottom:14px;" />
              <p style="margin:0 0 6px 0;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};">
                Custom metal business cards, engraved to last.
              </p>
              <p style="margin:0;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.8;">
                <a href="${SITE}" style="color:${GOLD};text-decoration:none;">laseryard.com</a>
                &nbsp;·&nbsp;
                <a href="${SITE}/track" style="color:${GOLD};text-decoration:none;">Track your order</a>
                &nbsp;·&nbsp;
                <a href="${SITE}/unforgettable" style="color:${GOLD};text-decoration:none;">Design Studio</a>
              </p>
            </td>
          </tr>

        </table>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding:18px 8px;">
              <p style="margin:0;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:11px;color:${MUTED};">
                You're receiving this because you contacted Laseryard.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${input.heading}

${input.text}

—
Laseryard — custom metal business cards
laseryard.com · Track your order: ${SITE}/track`;

  return { html, text };
}
