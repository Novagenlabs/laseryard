# Hero image prompts — the hand-off

One photograph carries the hero: a hand passing a metal business card to
another person. Self-contained prompts for GPT Image 2 or Nano Banana Pro.
Generate the base shot once, then recolor the card with edits so all eleven
finishes share the exact same composition (the site crossfades between them).

## Composition rules (apply to every prompt)

- Landscape 3:2 for desktop (about 2400×1600), plus a 4:5 crop for phones.
- The card is the only sharp subject; hands in focus, background softly out
  of focus. Card centered slightly right of frame so headline text sits left.
- The card is a plain anodized aluminum business card, 86 × 54 mm, credit-card
  thickness (0.8 mm, so a thin bright edge, never a thick slab), matte finish,
  with a simple laser-engraved layout in bright bare aluminum: a small
  monogram circle "AC", the name ALEX CARTER, the line FOUNDER & CEO, a thin
  rule, and one line of contact text. No logos, no QR code.
- Dark, warm, low-key lighting. Near-black background (#0a0a0a) with a soft
  amber window light from the right. No text or watermarks anywhere else.

## 01 — Base shot, matte black card

> Close-up photograph of a business card hand-off: a man's hand in a dark
> suit sleeve with a white shirt cuff passes a matte black anodized aluminum
> business card to a woman's hand entering from the right, fingertips just
> taking the card. The card is 86 × 54 mm and credit-card thin, with a bright
> engraved layout: a small circle monogram "AC", the name "ALEX CARTER", the
> line "FOUNDER & CEO", a thin rule and one line of contact text. Shallow
> depth of field, both hands and the card sharp, a dim wood-paneled executive
> office with venetian-blind light falling far out of focus behind. Warm amber
> key light from the right, deep black shadows, no other text, no logos.
> Photoreal, 85mm lens, editorial product photography.

## 02 — Recolor edits (one per finish, same shot)

Run on the base image, changing only the card:

> Change the card to anodized {FINISH} aluminum. Keep the engraving bright
> bare aluminum, keep the hands, cuffs, lighting, background and framing
> exactly the same. Matte finish, no reflections added.

Finishes, with the swatch the website uses: Silver #d2d1d5, Champagne Gold
#dbc6a0, Blue #025fc6, Red #a02230, Green #8eb779, Sage Green #a1ab9e, Purple
#a0448f, Blush Pink #e9cfcd, Cosmic Orange #f7a84c, Brown #7d593f.

## 03 — Alternate framing, over the shoulder

> Over-the-shoulder photograph: from behind a seated woman's shoulder, a
> man's hand reaches across a walnut desk to hand her a matte black anodized
> aluminum business card, credit-card thin, engraved in bright aluminum with
> a circle monogram "AC", "ALEX CARTER", "FOUNDER & CEO". Dim paneled office,
> warm window light from the right, shallow depth of field on the card.
> Photoreal, 50mm, no other text.

## 04 — Phone crop

> Vertical 4:5 crop of the same hand-off: two hands and the matte black
> engraved aluminum card fill the lower two thirds, dark soft background
> above for headline text. Same lighting, same card, no other text.

## Export

Deliver as WebP, 2400 px wide for desktop, 1200 px for phones, quality 82.
File names: `hero-handoff-<finish>.webp` and `hero-handoff-<finish>-mobile.webp`.
