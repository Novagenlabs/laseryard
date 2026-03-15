"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const steps = [
  {
    number: "01",
    title: "Customize Your Card",
    description:
      "Choose your base card and upload your artwork, or let our design team handle it. Share any notes and we'll take care of the rest.",
  },
  {
    number: "02",
    title: "Approve Your Proof",
    description:
      "We'll send you a digital proof within 1-3 business days. Request changes until it's exactly right. Nothing engraves until you love it.",
  },
  {
    number: "03",
    title: "Produced Fast. Delivered Ready.",
    description:
      "Your cards are precision laser-engraved, inspected, and shipped. Production takes 10-14 days after design is approved, though cards can be ready in as little as 5-7 days.",
  },
];

export function OrderProcess() {
  return (
    <section className="py-16 sm:py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="scale">
          <div className="rounded-2xl sm:rounded-3xl bg-zinc-950 text-white p-8 sm:p-12 lg:p-16 overflow-hidden safari-fix-overflow">
            <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16">
              {/* Left - Header */}
              <div>
                <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  Order <span className="font-extrabold">Process</span>
                </h2>
                <p className="text-white/60 text-lg leading-relaxed mb-8">
                  Getting your custom metal cards has never been easier.
                  Here&apos;s how it works:
                </p>
                <Link
                  href="/products/metal-business-cards"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-zinc-950 font-medium text-base hover:opacity-90 transition-opacity"
                >
                  Design Your Card
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Right - Steps */}
              <div className="space-y-0">
                {steps.map((step, i) => (
                  <div
                    key={step.number}
                    className={`py-6 ${i !== steps.length - 1 ? "border-b border-white/10" : ""}`}
                  >
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">
                      <span className="text-gold mr-3">{step.number}</span>
                      {step.title}
                    </h3>
                    <p className="text-white/60 leading-relaxed pl-10">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
