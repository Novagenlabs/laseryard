import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/gmbc/shared";

export const metadata: Metadata = {
  title: "Privacy",
  robots: { index: false, follow: true },
};

const SECTIONS: [string, string][] = [
  [
    "What we collect",
    "When you message us on WhatsApp or Instagram we receive your name, number or handle, and whatever you send: your artwork, your delivery address and your email for the order confirmation. The website itself sets no tracking cookies.",
  ],
  [
    "What we use it for",
    "To quote, proof and produce your cards, to ship them and to answer your questions. We keep order details for as long as warranty and tax rules require.",
  ],
  [
    "Who sees it",
    "Our production and shipping partners receive only what they need to make and deliver your order. We never sell or rent your details.",
  ],
  [
    "Your choices",
    "Ask us on WhatsApp at any time to see, correct or delete what we hold about you, and we will do it within 30 days.",
  ],
];

export default function GmbcPrivacy() {
  return (
    <main className="mx-auto flex max-w-[760px] flex-col gap-12 px-5 pb-24 pt-10 sm:px-8 lg:pt-16">
      <Link href="/gmbc" aria-label="Back to the home page">
        <Wordmark />
      </Link>
      <div className="flex flex-col gap-4">
        <span className="g-label" style={{ color: "var(--g-accent)", letterSpacing: "0.14em" }}>
          Privacy
        </span>
        <h1 className="text-[40px] font-medium leading-[1.05] tracking-[-0.04em] sm:text-[56px]">How we handle your details.</h1>
        <p className="text-[15px]" style={{ color: "var(--g-muted)" }}>
          Last updated {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </p>
      </div>
      <div className="flex flex-col gap-10">
        {SECTIONS.map(([h, p]) => (
          <section key={h} className="flex flex-col gap-3">
            <h2 className="text-[22px] font-medium tracking-[-0.02em]">{h}</h2>
            <p className="text-[17px] leading-[1.6]" style={{ color: "var(--g-muted)" }}>
              {p}
            </p>
          </section>
        ))}
      </div>
      <Link href="/gmbc" className="g-label">
        ← Back
      </Link>
    </main>
  );
}
