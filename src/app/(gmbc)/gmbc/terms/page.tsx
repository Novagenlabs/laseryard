import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/gmbc/shared";

export const metadata: Metadata = {
  title: "Terms",
  robots: { index: false, follow: true },
};

const SECTIONS: [string, string][] = [
  [
    "Quotes and orders",
    "A quote on WhatsApp is valid for 14 days. Your order is confirmed when you approve the digital proof and the payment link is settled. Pack prices include worldwide tracked shipping.",
  ],
  [
    "Proof and sample",
    "Nothing is engraved until you approve the digital proof, and the batch does not run until you approve a photo of the first engraved card. Check names, numbers and spelling carefully at that stage: once approved, the engraving is permanent.",
  ],
  [
    "Timing",
    "Production takes 10 to 14 business days after sample approval, rush production is available on request. Delivery times depend on the destination and are estimates, not guarantees.",
  ],
  [
    "Faults and returns",
    "Engraved cards are made to order and cannot be returned for a change of mind. If a card arrives damaged or does not match the approved proof, tell us within 14 days with photos and we remake it.",
  ],
  [
    "Your artwork",
    "You confirm you have the right to use any logo, name or artwork you send us. We keep a copy only to produce reorders, and remove it on request.",
  ],
];

export default function GmbcTerms() {
  return (
    <main className="mx-auto flex max-w-[760px] flex-col gap-12 px-5 pb-24 pt-10 sm:px-8 lg:pt-16">
      <Link href="/gmbc" aria-label="Back to the home page">
        <Wordmark />
      </Link>
      <div className="flex flex-col gap-4">
        <span className="g-label" style={{ color: "var(--g-accent)", letterSpacing: "0.14em" }}>
          Terms
        </span>
        <h1 className="text-[40px] font-medium leading-[1.05] tracking-[-0.04em] sm:text-[56px]">The short version of our terms.</h1>
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
