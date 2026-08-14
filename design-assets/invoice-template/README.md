# Laser Yard invoice template

Reusable A4 invoice template: `invoice-template/template.html`. Order emails live in `order-emails/`.

## Typography rules (post design audit, owner-approved)
- NO serif in any TEXT, anywhere. Serif exists only inside the actual logo (SVG on invoice, hosted PNG in emails).
- Invoice: everything is Manrope. INVOICE title = Manrope 800 caps.
- Emails: system sans only (Helvetica/Arial stack), no webfonts, no Georgia wordmarks. Logo = hosted PNG with sans-styled alt fallback.
- Keep copy SHORT. Owner rejects wordy paragraphs; one short body paragraph max in emails, one-line item descriptions.
- No em/en dashes anywhere in customer-facing copy; use commas or periods.
- No contractions in customer-facing copy ("We will", not "We'll").
- No "Great news!" / exclamation-heavy copy; no italic-serif flourishes ("Thank you for your business." plain, bold).
- Tabular numerals on all amounts (font-feature-settings 'tnum').
- Restrained tracking: labels 0.14em, table headers 0.12em, PAID badge 0.08em.
- Off-palette colors banned (e.g. no bootstrap green): ink #1A1A24, yellow #FFD500, muted #6b6b76 only.

## Brand tokens
- Ink: #1A1A24 · Yellow: #FFD500 · Muted: #6b6b76
- Wordmark (logo only): Playfair Display, "Laser" weight 800 + italic "yard" weight 500, two yellow domes
- From section: email + website only, no tagline, no location, no phone; footer shows invoice number, no email
- Items table: Description | Qty | Amount (NO unit-price column)

### Logo assets (verified in-browser 2026-08-14)
Both live under https://laseryard.com/images/laseryard_logos/ . Naming is "for a light/dark BACKGROUND", not "the light/dark coloured logo":
- `logo_light.png` — black wordmark, use on white/light panels
- `logo_dark.png` — white wordmark, use on ink/dark panels

Both are 1000x500 fully transparent PNGs (alpha 0 at the corners, confirmed by canvas pixel sampling). Chrome's standalone image viewer paints transparent PNGs on a light grey backdrop, which reads as a baked-in grey box. It is not.

The artwork does NOT fill the canvas vertically. Opaque bounding box is roughly x 21-988, y 122-306, so ~968x185 of a 1000x500 frame: 24% empty above, 39% empty below, ~2% each side. Scaled to `width="132"` that is a 66px-tall box holding a 24px wordmark with ~16px dead space above and ~25px below, which reads as loose, bottom-heavy header padding.

Compensate with negative margins on the img rather than shrinking the logo: `margin:-16px 0 -25px 0` at width 132 (scale proportionally at other widths). Outlook ignores them and simply keeps the untrimmed spacing. If the assets are ever re-exported tightly cropped, drop the negative margins.

## How to fill
Replace tokens: {{INVOICE_NO}} (header meta AND footer), {{ISSUE_DATE}}, {{PAYMENT_DATE}}, {{CUSTOMER_NAME}}, {{CUSTOMER_LINES}}, {{ITEM_ROWS}}, {{EXTRA_ROWS}}, {{SUBTOTAL}}, {{TOTAL}}, {{AMOUNT_PAID}}, {{BALANCE}}, {{PAYMENT_NOTE}}.

Item row markup: `<tr><td><div class="item-name">…</div><div class="item-desc">…</div></td><td class="num">qty</td><td class="num"><strong>amount</strong></td></tr>`

Render: `chromium --headless --no-sandbox --print-to-pdf=out.pdf --no-pdf-header-footer invoice.html`

## Fonts
`template.html` carries a `__FACES__` placeholder where the `@font-face` block goes. The fonts are NOT bundled. `build-invoice.py` pulls them from npm and inlines them as base64 woff2:

```
python3 build-invoice.py
```

It runs `npm pack @fontsource/manrope @fontsource/playfair-display`, base64s the latin woff2 files, and writes a self-contained invoice:
- Manrope latin 400/500/600/700/800 normal → `font-family:'Manrope'`, one `@font-face` per weight, `format('woff2')`
- Playfair Display latin 800 normal + 500 italic → `font-family:'Playfair Display'` (logo SVG only)

Static weights are required. Fontsource ships no variable build, so `font-weight: 200 800` range declarations must be split per weight.

`example-LY-2026-11042.html` is a finished invoice with the fonts already inlined, for reference.

## Whop orders
Whop's payment breakdown shows "Original price" (the item price), "Customer paid" (item + tax and processing passed to the customer), and a merchant "Fees" block. The fee block is Laser Yard's cost and never appears on a customer invoice. Bill the original price as Subtotal, put the customer-paid difference in {{EXTRA_ROWS}} as a "Tax and processing" row, and set Total = Amount Paid = customer paid.

## Order emails (`order-emails/`)
Four-step tracker across the lifecycle: Order received, Design (or Processing when the customer supplied artwork), Production, Shipped. One file per stage; current step is the yellow dot, completed steps carry a check, later steps stay grey #e6e6ea on #6b6b76.

- `received.html` — current reference build. Follows the typography rules above and is dark-mode-aware. Use this as the base for new stage emails.
- `processing.html` — STALE, predates the design audit: it still `@import`s Google Fonts, renders the wordmark as Playfair/Georgia text instead of the hosted PNG, and has no dark mode handling. Rebuild it from `received.html` before sending.

Hero eyebrow, CTA link and tracking line all carry the same tracking code (`laseryard.com/track?order=<code>`). The invoice number goes in the order summary descriptor line, not the eyebrow.

### Dark mode (required on every email)
Without this, Apple Mail inverts the whole email: the ink hero goes pale, white panels go dark, and the dark wordmark disappears against a dark header. Owner caught this in the wild on 2026-08-14.

- `<meta name="color-scheme" content="light dark">` + `<meta name="supported-color-schemes" content="light dark">` in head, and `:root { color-scheme: light dark; supported-color-schemes: light dark; }` in the style block. This alone stops the blanket inversion.
- Every color override lives in `@media (prefers-color-scheme: dark)` and MUST carry `!important` — inline styles outrank plain rules.
- Class hooks in use: `.ly-outer .ly-bar-ink .ly-head .ly-hero .ly-surface .ly-card .ly-footer .ly-t-ink .ly-t-muted .ly-t-onhero .ly-step-off .ly-step-lbl .ly-btn .ly-yellow .ly-logo-light .ly-logo-dark`
- Dark palette: page #0a0a0e · hero/footer #12121a · panels #1A1A24 · card #24242f · text #e8e8ee · muted #a0a0ac · idle step chips #33333f. Yellow #FFD500 is unchanged in both modes.
- Force `.ly-btn a { color:#1A1A24 !important; }` or clients recolor the CTA label to their own link color and it turns near-white on yellow.
- Logo swaps via two `<img>` tags: `.ly-logo-light` hidden in dark, `.ly-logo-dark` revealed (`display:block`, restore width, `max-height:none`, `overflow:visible`, and re-apply the negative margins with `!important`).
- Outlook desktop ignores media queries and stays in the light design, which is fine.
- Verify locally by copying the file and replacing `@media (prefers-color-scheme: dark)` with `@media all`, then screenshotting both. The hosted logos will not load in a sandbox; to check header spacing, swap in a 1000x500 transparent PNG with a filled rect at x 21-988, y 122-306 to mimic the real geometry.

## Invoice log
| No. | Issued | Customer | Items | Total | Status |
|---|---|---|---|---|---|
| LY-2026-11041 | 2026-07-10 | Vincent Sax, Valencia, Spain | 30x Silver Metal Business Cards 0.8mm (AmEx style), shipping included | $450.00 | PAID 2026-07-11 |
| LY-2026-11042 | 2026-07-31 | Leonardo Camilleri, Madrid, Spain | 30x Premium Metal Business Cards 0.4mm, shipping included | $272.19 ($250.00 + $22.19 tax and processing) | PAID 2026-08-14, card via Whop |

Tracking codes: LY-2026-11041 → LY-PDWR-V95X · LY-2026-11042 → LY-Z54M-PSWZ (laseryard.com/track?order=<code>).
Numbering follows owner's scheme (last: LY-2026-11042). Ask owner for the number on each new invoice.
