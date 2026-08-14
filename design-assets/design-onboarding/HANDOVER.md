# Handover: Laser Yard design onboarding

For a Claude Code session with access to the Laser Yard backend and Canva account. This is the whole picture: what exists, what to build, and the traps already found.

---

## 1. Context

Laser Yard sells laser engraved metal business cards, sold through Whop. Orders currently flow: Whop payment → invoice PDF → "order received" email with a tracking code. There is no design intake, so after payment the customer waits and nothing tells them what to do next. This project closes that gap.

Target flow:

```
payment → order received email → design brief form → concepts generated → customer picks one → production
                                  ^^^^^^^^^^^^^^^^   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                  built, needs a     not built
                                  backend
```

### Assets that already exist

| File | State |
|---|---|
| `design-onboarding/form.html` | Built and tested. Self-contained, no build step, no dependencies beyond a Google Fonts link. |
| `design-onboarding/README.md` | The Canva pipeline spec. Read it before touching Canva. |
| `order-emails/received.html` | Order received email. Dark-mode aware. Use as the base for the concept email. |
| `order-emails/processing.html` | STALE, predates the design audit. Rebuild from `received.html` if needed. |
| `invoice-template/template.html` + `README.md` | Invoice, and the brand rules that govern everything. Read the README's typography rules before writing any customer-facing copy. |

---

## 2. Build in this order

Tasks 1 and 2 deliver nearly all the customer value and do not depend on the Canva plan question. Do not start task 3 until task 1 is done, since there is nothing to feed Canva without it.

### Task 1 — Brief submission endpoint

The form currently posts nowhere. `CONFIG.endpoint` at the top of `form.html` is an empty string, and submission falls back to downloading a JSON file locally so the form stays testable. Set that to the real URL.

**Request.** `POST`, `multipart/form-data`, two parts:

- `brief` — a JSON string, shape below
- `logo` — an optional file. `.svg .ai .eps .pdf .png .jpg`, client-capped at 20 MB.

```json
{
  "order": "LY-Z54M-PSWZ",
  "submittedAt": "2026-08-14T07:28:57.441Z",
  "name": "Leonardo Camilleri",
  "jobTitle": "Founder",
  "company": "Camilleri Studio",
  "logo": { "choice": "none", "filename": null },
  "engrave": [
    { "field": "phone",   "value": "+34 600 123 456" },
    { "field": "email",   "value": "camilleri.leonardo23@gmail.com" },
    { "field": "website", "value": "camileristudio.com" }
  ],
  "back": { "choice": "message", "text": "Built to last" },
  "finish": "black-matte",
  "infill": { "choice": "custom", "custom": "Pantone 2728 C" },
  "direction": "technical",
  "references": "Amex Centurion, Apple Card",
  "avoid": "",
  "deadline": "2026-09-15",
  "notes": ""
}
```

Enumerations: `logo.choice` is `upload | later | none`. `back.choice` is `logo | name | message | blank`. `direction` is `minimal | bold | classic | technical`. `finish` and `infill.choice` are ids from the `CONFIG` block in `form.html`.

**Response.** `2xx` for success, anything else shows the customer a retry message pointing at hello@laseryard.com. Body is not read.

**Must do server side:**

- Re-validate. Everything above is client-supplied. In particular re-check `finish` and `infill.choice` against live stock, because a customer can sit on the form for an hour while an item sells out.
- Re-check file type and size. The 20 MB cap is client-side only and trivially bypassed.
- Match `order` to a real order. It comes from the URL query string and is not authenticated. Treat an unknown or missing code as a lead rather than an order, and do not let it address anything by id.
- Store the logo somewhere durable and virus-scan it. `.ai`, `.eps` and `.pdf` are not inert formats.
- Notify the studio. A brief that lands silently in a database is the same as no brief.

**Acceptance:** submit the form end to end with and without a logo, and with the same order code twice. Confirm both land, the file is retrievable, and a duplicate does not overwrite the first.

### Task 2 — Stock availability endpoint

Right now Laser Yard stocks exactly one finish: matte black. `form.html` already handles this. When only one finish is available the step renders as a statement ("Your cards will be matte black") rather than a one-option question, and auto-selects it. Add more finishes later and it turns back into a real choice automatically.

Availability has two drivers, and the second is the one to wire up:

1. **Hardcoded.** The `available` boolean on each entry in `CONFIG.finishes` and `CONFIG.infill.colours`. This is the fallback and must stay accurate.
2. **Live.** Set `CONFIG.availability.endpoint` to a URL returning an id → boolean map. Fetched on page load and merged over the hardcoded flags.

```json
{
  "finishes": { "black-matte": true, "gold": false, "silver-brushed": false },
  "infill":   { "black": true, "red": true, "green": false }
}
```

Unknown ids are ignored. Ids absent from the response keep their hardcoded value. If the fetch fails the form logs a warning and carries on with the hardcoded flags, which is why keeping them current matters.

This is the CRM/inventory hook. Whatever the source of truth is, project it into that flat shape rather than exposing raw inventory. Cache it, keep it fast, and make it CORS-readable from the form's origin. It is public data on a public page, so it must not leak stock counts, cost, or supplier detail. Booleans only.

`CONFIG.availability.showUnavailable` toggles whether out-of-stock options render greyed with a "Coming soon" badge or are hidden entirely. Currently `false`. Setting it `true` is a decent way to gauge demand for finishes not yet carried.

**Acceptance:** flip `gold` to `true` in the API response and confirm the form turns from a statement into a choice without a redeploy. Kill the endpoint and confirm the form still works.

### Task 3 — Concepts

Read `design-onboarding/README.md` first. Two blockers are unresolved and both are worth settling before writing code:

1. **Canva Autofill only works on Brand Templates, which are a Canva Enterprise feature.** Check the actual plan first. On Free, Pro or Teams the endpoint returns a permission error and this whole task changes shape.
2. **The templates do not exist.** Autofill fills templates in your own account, not Canva's public library. Somebody has to build four card layouts with named data fields before anything automates.

If either blocks, build the picker anyway and feed it hand-made concepts. The picker is what the customer sees and it is the cheaper half.

Canva Connect API sequence, roughly: upload asset → create autofill job → poll → create export job → poll → download. **Verify every endpoint, scope and payload shape against the current Canva Connect docs rather than trusting this document.** Scopes needed are around `asset:write`, `design:content:write`, `design:meta:read` and the brand template read scopes.

**The trap that will bite:** Canva export URLs expire. Copy every export to Laser Yard storage and serve it from `laseryard.com` before putting it in an email. Otherwise the concept email renders fine on send and is broken images by the next morning.

**Also:** a Canva export is a mockup, not production art. Engraving needs clean single-colour vector paths. Never send a Canva PNG to the laser. Rebuild the chosen concept properly.

---

## 3. Rules that are not negotiable

From `invoice-template/README.md`, all owner-approved after a design audit. Customer-facing copy:

- No em dashes or en dashes. Commas or periods.
- No contractions. "We will", not "we'll".
- Short. One body paragraph maximum in an email. One-line item descriptions.
- No "Great news!" or exclamation-heavy copy.
- Palette is ink `#1A1A24`, yellow `#FFD500`, muted `#6b6b76`. Nothing off-palette.
- No serif in any text. Serif exists only inside the logo artwork itself.

Emails specifically:

- System sans stack only. No webfonts.
- **Dark mode handling is mandatory.** Without it Apple Mail inverts the entire email: the ink hero goes pale, white panels go dark, and the wordmark disappears. This shipped to a real customer before it was caught. The full recipe, class hooks and dark palette are in `invoice-template/README.md` under "Dark mode". Copy the pattern from `received.html`, do not reinvent it.
- Logo assets are `logo_light.png` (black wordmark, for light backgrounds) and `logo_dark.png` (white wordmark, for dark backgrounds), under `https://laseryard.com/images/laseryard_logos/`. Both are 1000x500 transparent PNGs whose artwork fills only ~37% of the canvas height, sitting high with a large gap below. Compensate with `margin:-16px 0 -25px 0` at `width="132"`. Details in the README.

The form itself uses Manrope as a webfont, which is fine on the web and only banned in email.

---

## 4. Open decisions

- **QR codes and NFC are deliberately absent from the form.** The owner did not list them as offered. If that was an oversight it is a small addition to `CONFIG.details`, but confirm before adding, because the form should not offer what the shop cannot make.
- **The infill colour list is unverified.** All seven entries are currently marked available. The owner confirmed colour infill is offered but not which colours. Trim `CONFIG.infill.colours` to the real range. If only one option ends up live the step auto-skips and records that option.
- **`received.html` promises a design process starts on its own.** Once this form is live that copy should point the customer at it instead. Current line: "We will start your design process shortly, and you can follow every stage at the link below."
- **`processing.html` is stale** and violates the current typography and dark mode rules. Rebuild from `received.html` before it is ever sent.

---

## 5. Quick verification recipes

**Form, headless:** it is a plain file, so `file:///path/form.html?order=LY-TEST-0000` works with no server. Drive it with Playwright, `show(screens.findIndex(s=>s.id==='finish'),1)` jumps straight to any step by id, and `data` holds live answers.

**Email dark mode:** copy the file, replace `@media (prefers-color-scheme: dark)` with `@media all`, screenshot both. Hosted logos will not load off-network, so to check header spacing substitute a 1000x500 transparent PNG with a filled rect at x 21-988, y 122-306 to mimic the real geometry.

**Invoice:** `chromium --headless --no-sandbox --print-to-pdf=out.pdf --no-pdf-header-footer invoice.html`.
