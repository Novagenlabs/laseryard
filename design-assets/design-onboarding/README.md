# Concept mockup pipeline (Canva autofill)

How a submitted design brief becomes a set of card concepts the customer picks from.

## The shape of it

The brief and the concept picker are **two separate touchpoints**, not one form. The concepts cannot exist until the brief is submitted, so the flow is:

1. Customer fills `design-onboarding/form.html` and submits.
2. Backend stores the brief, uploads the logo, kicks off autofill.
3. Canva returns 3 or 4 filled designs, exported as images.
4. Customer gets an email with the concepts and picks one.
5. Their choice comes back, and that concept goes to production artwork.

Steps 3 to 5 are a second page and a second email. Both still need building.

## Blockers to confirm before this can run

**1. Canva plan.** The Autofill API only operates on **Brand Templates**, and brand templates are a Canva Enterprise feature. On Free, Pro or Teams the autofill endpoint returns a permission error. Confirm the plan before any of this is built. If the plan does not support it, the fallback is: design the concepts by hand in Canva, and automate only the picker (which is the cheaper half anyway, and the half customers actually see).

**2. Templates do not exist yet.** "Pull in some designs from Canva" is not something the API does against Canva's public template library. Autofill only fills templates **you** have built and saved as brand templates in your own Canva account. So the one-time setup is: build 3 or 4 card layouts in Canva, one per style direction, each with named data fields. Nothing automated happens until those exist.

**3. A Canva export is a mockup, not production art.** Engraving needs clean single-colour vector paths. Canva PNG or PDF exports carry anti-aliasing, effects and raster edges. Treat the concepts as *"which of these do you like"* only, then rebuild the chosen one properly for the laser. Do not send a Canva export to the machine.

## One-time setup in Canva

Build one brand template per style direction, matching the options in the form:

| Template | Style direction | Notes |
|---|---|---|
| `card-minimal` | Minimal | Lots of space, small type, no ornament |
| `card-bold` | Bold | Large type, strong blocks |
| `card-classic` | Classic | Centred, framed |
| `card-technical` | Technical | Grid based, precise |

In each, name the data fields **identically across all four** so one autofill payload drives any of them:

| Field name | Type | Source in the brief |
|---|---|---|
| `full_name` | text | `name` |
| `job_title` | text | `jobTitle` |
| `company_name` | text | `company` |
| `line_1` … `line_4` | text | `engrave[].value`, in order |
| `back_text` | text | `back.text` |
| `logo` | image | uploaded asset id |

Fields left empty must collapse gracefully. A customer who picks only an email address will leave `line_2` to `line_4` blank, so the layout has to not fall apart. Test each template with a one-line and a four-line fill before going live.

Build each at the real card size with bleed, not at Canva's default business card preset, or the proportions will not match a metal card.

## The automated run

Per submission, against the Canva Connect API:

1. **Upload the logo.** Asset upload endpoint. Returns an asset id. Skip when `logo.choice` is `none` or `later`, and use a text-only variant of each template instead.
2. **Create an autofill job** per template, passing the field map above. Autofill is asynchronous: it returns a job id.
3. **Poll the job** until it reports success, then read the resulting design id.
4. **Create an export job** for each design, PNG at 2x for the email.
5. **Re-host the exports.** Canva export URLs are short lived and expire. Copy each file to your own storage and serve it from `laseryard.com`, otherwise the concept email breaks for anyone who opens it a day later. This is the single most common way this kind of pipeline fails in production.

Metal colour and infill do **not** come from Canva. Composite the exported artwork over the finish the customer chose, or note the finish alongside the concepts as text. Trying to make Canva render brushed steel is a waste of effort.

## The picker

A page at `laseryard.com/concepts?order=<code>` showing each concept large, on the chosen finish, with one selection control and a free-text box for tweaks. Selection posts back the concept id.

The concept email reuses `order-emails/received.html` as its base: same dark mode handling, same tracker, with step 2 (Design) as the current step and the concepts in place of the order summary block.

## Field mapping from the submitted brief

The form posts `multipart/form-data` with a `brief` JSON part and an optional `logo` file part. Brief shape:

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

`direction` picks which template leads. Send that one first and two others as alternates, rather than all four, so the customer has a clear front runner instead of a flat menu.

## Suggested build order

1. Backend endpoint to receive the brief and the logo, and store both. Nothing else works without it.
2. Concept picker page and email, fed manually at first.
3. Canva automation last, once the plan question is settled and the templates exist.

Steps 1 and 2 deliver most of the customer-facing value and do not depend on the Canva plan.
