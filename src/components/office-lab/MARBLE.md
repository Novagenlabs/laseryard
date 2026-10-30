# Marble worlds for the hero

The office backgrounds come from World Labs Marble as Gaussian splats and are
rendered in the lab with Spark (`@sparkjsdev/spark`). Our box and cards are
normal lit meshes placed in front of the splat.

## Generate (in the Marble app)

Plan: **Standard** exports splats and panoramas; **Pro** adds commercial rights,
which the live site needs. Generate from text, or from a reference image for
tighter control (an image made with your usual image model works well).

Prompts. Keep the desk in the foreground, the camera is behind it.

**Executive office, 1962**

> Interior of a 1962 Madison Avenue executive corner office, late afternoon.
> A wide walnut desk fills the foreground, empty except for a brass banker's
> lamp with a green glass shade. Behind it a tufted leather chair, walnut wall
> paneling, a credenza with a crystal decanter and two glasses, a framed
> abstract painting. Venetian blinds on the right cast warm striped sunlight
> across the desk. Parquet floor, faint haze in the light. Photoreal, 35mm
> film, warm amber tones.

**Jet broker, glass office**

> Interior of a modern private-jet brokerage office at an executive airport.
> A dark walnut desk fills the foreground, empty. Behind it a floor-to-ceiling
> glass wall with black steel mullions overlooking a sunlit apron where three
> white business jets are parked, one being towed. Polished concrete floor,
> bright soft daylight, photoreal architectural photography.

## Export

For each world export:

- `Splats (low-res SPZ)` about 500k splats, for the live hero and phones
- `Splats (SPZ)` about 2M splats, for desktop if the budget allows
- `Panorama (PNG)` 2560×1280, used to light the box

Drop them in `public/worlds/<name>/` as `world-lowres.spz`, `world.spz`,
`pano.png`.

## Place in the lab

1. Open `/office-motion-lab?look=marble`.
2. In **World**, set `url` to `/worlds/<name>/world.spz` and `pano` to
   `/worlds/<name>/pano.png`.
3. Marble exports come out upside down for Three.js (OpenCV axes). Keep
   `flip` on, then use `yaw`, `x`, `y`, `z`, `scale` until the splat desk's
   surface meets the bottom of the box.
4. Match the light: `envIntensity` for overall level, `sun` and `sunColor`
   for the key light direction the room suggests, `exposure` last.
5. **Save version**, then **Copy parameters** and paste them to me to lock.

## API option

World Labs' platform API generates a world for about 1,500 credits ($1 buys
1,250), so roughly $1.20 each. With a platform key I can generate several
variations of each office and export them without touching the app.

## Budget notes

A 2M-splat SPZ is roughly 40 to 50 MB; the 500k export is roughly a quarter of
that. Spark can also stream a level-of-detail build (`.rad`) for big worlds.
Splats are baked lighting: they cannot be relit, so the lamp, blinds and time
of day must be in the prompt.
