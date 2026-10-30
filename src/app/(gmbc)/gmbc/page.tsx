import Image from "next/image";
import Link from "next/link";
import { FinishCycler } from "@/components/gmbc/FinishCycler";
import { Arrow, INSTAGRAM_URL, WA_QUOTE_URL, Wordmark } from "@/components/gmbc/shared";

// Get Metal Business Cards — single landing page, quote-first, no prices.
// Layout and copy follow the approved Paper design.

const FAQ = [
  {
    q: "Will I see a proof before production?",
    a: "Yes. You approve a digital proof first, then a photo of one engraved sample card. Nothing else is engraved until you say so.",
  },
  {
    q: "Can you design the card for me?",
    a: "Yes. Send your logo and details on WhatsApp and we lay the card out for you. Bring your own print-ready file if you prefer.",
  },
  {
    q: "How is the price worked out?",
    a: "By pack size, from 15 cards up to 200, with worldwide shipping included. Tell us the finish, quantity and country on WhatsApp and you get the exact figure within minutes.",
  },
  {
    q: "When will my cards arrive?",
    a: "Production takes 10 to 14 business days after you approve the sample, with rush available. Tracked delivery follows, usually 7 to 14 business days depending on the country.",
  },
  {
    q: "Can I order more than 200 cards?",
    a: "Yes. Larger runs are quoted individually. Message us with the quantity and we will come back with a price and timeline.",
  },
];

const STEPS = [
  {
    n: "01",
    t: "Tell us what you need",
    d: "Message us on WhatsApp with the finish, quantity and country you need. You'll have a quote back within minutes.",
  },
  {
    n: "02",
    t: "Approve your proof",
    d: "Send your artwork or let us lay it out. You approve a digital proof, then a photo of one engraved card, before the batch runs.",
  },
  {
    n: "03",
    t: "We engrave and ship",
    d: "Production takes 10 to 14 business days after approval, rush available. Tracked worldwide delivery is included in every quote.",
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="g-label" style={{ color: "var(--g-accent)", letterSpacing: "0.14em" }}>
      {children}
    </span>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[40px] font-medium leading-[1.05] tracking-[-0.04em] sm:text-[48px] lg:text-[56px]">
      {children}
    </h2>
  );
}

export default function GmbcHome() {
  return (
    <>
      {/* Nav */}
      <header
        className="flex h-[72px] items-center justify-between px-5 sm:px-8 lg:h-[96px] lg:px-20"
        style={{ borderBottom: "1px solid var(--g-line)" }}
      >
        <a href="#top" aria-label="Get Metal Business Cards">
          <Wordmark />
        </a>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Sections">
          {[
            ["#finishes", "Finishes"],
            ["#how", "How to order"],
            ["#questions", "Questions"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="g-label font-normal transition-colors hover:text-[var(--g-text)]" style={{ color: "var(--g-muted)" }}>
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href={WA_QUOTE_URL} target="_blank" rel="noopener noreferrer" className="g-btn g-btn-outline g-label hidden !px-[18px] !py-[13px] sm:inline-flex">
            WhatsApp
          </a>
          <a href={WA_QUOTE_URL} target="_blank" rel="noopener noreferrer" className="g-btn g-btn-primary g-label !px-[18px] !py-[13px]">
            Get a quote <Arrow />
          </a>
        </div>
      </header>

      <main id="top">
        {/* Hero: full-bleed photograph, text on a gradient so it stays legible */}
        <section className="relative flex min-h-[640px] items-end overflow-hidden sm:min-h-[700px] lg:min-h-[780px] lg:items-center">
          <Image
            src="/images/gmbc/hero-handoff-black.png"
            alt="A hand passing a matte black laser-engraved metal business card to another person"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[70%_center]"
          />
          {/* Left-to-right wash for the copy, bottom wash so the strip below lands on black */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(10,10,10,0.96) 0%, rgba(10,10,10,0.88) 32%, rgba(10,10,10,0.45) 58%, rgba(10,10,10,0.08) 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-40"
            style={{ background: "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.9) 100%)" }}
          />
          <div className="relative flex max-w-[760px] flex-col items-start gap-6 px-5 pb-16 pt-14 sm:px-8 lg:gap-7 lg:px-20 lg:py-[104px]">
            <Eyebrow>Laser-engraved metal business cards</Eyebrow>
            <h1 className="text-[44px] font-medium leading-[1.02] tracking-[-0.045em] sm:text-[60px] lg:text-[76px]">
              The business card people keep.
            </h1>
            <p className="max-w-[520px] text-[17px] leading-[1.6] sm:text-[19px]" style={{ color: "var(--g-muted)" }}>
              Solid 0.8 mm anodized aluminum, laser engraved with your design. Eleven finishes. Packs from 15 cards,
              delivered worldwide.
            </p>
            <div className="flex flex-col items-start gap-5 pt-1">
              <div className="flex flex-wrap items-center gap-3.5">
                <a href={WA_QUOTE_URL} target="_blank" rel="noopener noreferrer" className="g-btn g-btn-primary g-label">
                  Get a quote on WhatsApp <Arrow />
                </a>
                <a href="#finishes" className="g-btn g-btn-outline g-label">
                  See the finishes
                </a>
              </div>
              <span className="text-[13px] leading-[18px]" style={{ color: "var(--g-muted)" }}>
                Quotes in minutes on WhatsApp · Nothing is engraved until you approve a sample card
              </span>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section
          className="grid grid-cols-1 gap-3 px-5 py-6 sm:grid-cols-2 sm:px-8 lg:flex lg:items-center lg:justify-between lg:px-20"
          style={{ borderTop: "1px solid var(--g-line)", borderBottom: "1px solid var(--g-line)" }}
        >
          {[
            "0.8 mm solid aluminum",
            "Your design, laser engraved",
            "Proof and sample card before the batch",
            "Worldwide shipping included",
          ].map((t) => (
            <div key={t} className="flex items-center gap-3 text-[14px] leading-[18px]">
              <span className="block h-1.5 w-1.5 shrink-0" style={{ background: "var(--g-accent)" }} aria-hidden />
              {t}
            </div>
          ))}
        </section>

        {/* Finishes */}
        <section id="finishes" className="flex scroll-mt-20 flex-col gap-10 px-5 pb-20 pt-20 sm:px-8 lg:gap-12 lg:px-20 lg:pb-28 lg:pt-[120px]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="flex flex-col gap-4">
              <Eyebrow>Finishes</Eyebrow>
              <H2>Eleven anodized finishes.</H2>
            </div>
            <p className="max-w-[470px] text-[17px] leading-[1.6]" style={{ color: "var(--g-muted)" }}>
              The laser removes the color layer, so your artwork shows as bright bare aluminum against the finish you
              pick.
            </p>
          </div>
          <FinishCycler />
        </section>

        {/* Material */}
        <section className="flex flex-col gap-10 px-5 pb-20 sm:px-8 lg:flex-row lg:items-center lg:gap-24 lg:px-20 lg:pb-32">
          <div className="relative aspect-[596/448] w-full overflow-hidden lg:w-[596px] lg:shrink-0" style={{ background: "var(--g-surface)" }}>
            <Image
              src="/images/products/colors/gold.webp"
              alt="Champagne gold metal business cards"
              fill
              sizes="(min-width: 1024px) 596px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex max-w-[520px] flex-col items-start gap-8">
            <H2>
              Solid aluminum.
              <br />
              Laser engraved.
            </H2>
            <p className="max-w-[440px] text-[17px] leading-[1.6]" style={{ color: "var(--g-muted)" }}>
              The laser cuts your logo and details into the anodized surface, so they can&apos;t rub off or fade. Each
              card is 86 × 54 mm, the size of a paper card, and weighs about as much as a house key.
            </p>
            <dl className="flex flex-wrap gap-x-14 gap-y-6">
              {[
                ["0.8", "mm solid aluminum"],
                ["11", "anodized finishes"],
                ["15+", "cards per pack"],
              ].map(([n, l]) => (
                <div key={l} className="flex flex-col gap-2">
                  <dt className="text-[44px] font-medium leading-none tracking-[-0.04em] lg:text-[48px]">{n}</dt>
                  <dd className="text-[14px] leading-[18px]" style={{ color: "var(--g-muted)" }}>
                    {l}
                  </dd>
                </div>
              ))}
            </dl>
            <a href="#finishes" className="g-btn g-btn-outline g-label">
              Find your finish <Arrow />
            </a>
          </div>
        </section>

        {/* How to order */}
        <section id="how" className="flex scroll-mt-20 flex-col gap-10 px-5 pb-20 sm:px-8 lg:gap-12 lg:px-20 lg:pb-32">
          <div className="flex flex-col gap-4">
            <Eyebrow>How to order</Eyebrow>
            <H2>Three messages, then it ships.</H2>
          </div>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="flex flex-col gap-10 p-7 lg:p-8" style={{ background: "var(--g-surface)" }}>
                <span className="g-label" style={{ color: "var(--g-accent)", letterSpacing: "0.14em" }}>
                  {s.n}
                </span>
                <div className="flex flex-col gap-3">
                  <h3 className="text-[22px] font-medium leading-7 tracking-[-0.02em]">{s.t}</h3>
                  <p className="text-[16px] leading-[26px]" style={{ color: "var(--g-muted)" }}>
                    {s.d}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Questions */}
        <section id="questions" className="flex scroll-mt-20 flex-col gap-10 px-5 pb-20 sm:px-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16 lg:px-20 lg:pb-32">
          <div className="flex flex-col gap-4 lg:w-[420px] lg:shrink-0">
            <Eyebrow>Questions</Eyebrow>
            <H2>Common questions</H2>
          </div>
          <div className="g-faq flex w-full flex-col lg:w-[720px]" style={{ borderTop: "1px solid var(--g-line)" }}>
            {FAQ.map((f) => (
              <details key={f.q} className="group" style={{ borderBottom: "1px solid var(--g-line)" }}>
                <summary className="flex items-center justify-between gap-6 py-6 text-[18px] font-medium leading-6">
                  {f.q}
                  <span className="g-plus text-[22px] font-light leading-none" style={{ color: "var(--g-muted)" }} aria-hidden>
                    +
                  </span>
                </summary>
                <p className="pb-6 text-[16px] leading-[26px]" style={{ color: "var(--g-muted)" }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Closing band */}
        <section
          className="flex flex-col gap-10 px-5 py-20 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-20 lg:py-[120px]"
          style={{ borderTop: "1px solid var(--g-line)" }}
        >
          <h2 className="text-[56px] font-medium leading-[0.95] tracking-[-0.05em] sm:text-[80px] lg:text-[112px]">
            Your name, in metal.
          </h2>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <a href={WA_QUOTE_URL} target="_blank" rel="noopener noreferrer" className="g-btn g-btn-primary g-label">
              Get a quote on WhatsApp <Arrow />
            </a>
            <span className="text-[13px] leading-[18px]" style={{ color: "var(--g-muted)" }}>
              Replies in minutes, 7 days a week
            </span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-12 px-5 pb-10 pt-16 sm:px-8 lg:gap-14 lg:px-20 lg:pt-[72px]" style={{ background: "var(--g-surface)" }}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="flex max-w-[420px] flex-col gap-5">
            <Wordmark />
            <p className="text-[15px] leading-6" style={{ color: "var(--g-muted)" }}>
              Laser-engraved metal business cards, made to order and shipped worldwide.
            </p>
          </div>
          <div className="flex gap-16 lg:gap-24">
            <div className="flex flex-col gap-4">
              <span className="g-label text-[11px]" style={{ color: "var(--g-muted)", letterSpacing: "0.14em" }}>
                Explore
              </span>
              <a href="#finishes" className="text-[15px] leading-5">Finishes</a>
              <a href="#how" className="text-[15px] leading-5">How to order</a>
              <a href="#questions" className="text-[15px] leading-5">Questions</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="g-label text-[11px]" style={{ color: "var(--g-muted)", letterSpacing: "0.14em" }}>
                Connect
              </span>
              <a href={WA_QUOTE_URL} target="_blank" rel="noopener noreferrer" className="text-[15px] leading-5">WhatsApp</a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-[15px] leading-5">@getmetalbusinesscards</a>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-6 text-[13px] leading-[18px] sm:flex-row sm:items-center sm:justify-between" style={{ borderTop: "1px solid var(--g-line)", color: "var(--g-muted)" }}>
          <span>© {new Date().getFullYear()} Get Metal Business Cards. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/gmbc/privacy">Privacy</Link>
            <Link href="/gmbc/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
