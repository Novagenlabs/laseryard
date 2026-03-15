"use client";

import { Timer, Fingerprint, BadgeCheck } from "lucide-react";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/ScrollReveal";

const values = [
  {
    icon: Timer,
    title: "Speed with Purpose",
    description:
      "You move fast. Your cards should too. We keep design, proofing, and production moving so you're never stuck waiting.",
  },
  {
    icon: Fingerprint,
    title: "Crafted to Stand Out",
    description:
      "You're not here to blend in. Our metal cards are made to get noticed and remembered, no big budget required.",
  },
  {
    icon: BadgeCheck,
    title: "Quality You Can Count On",
    description:
      "Done right from start to finish. Precision laser-engraved. Carefully crafted. Treated like it's our own, because your name is on it.",
  },
];

export function ValueProps() {
  return (
    <section className="py-16 sm:py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-12 sm:mb-16">
          <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Our <span className="font-extrabold">Values</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Standing out should be simple. Everything we make is built to help
            you look confident and professional without slowing you down.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {values.map((value) => (
            <StaggerItem key={value.title}>
              <div className="group">
                <div className="w-12 h-12 rounded-xl bg-foreground/5 dark:bg-background/10 flex items-center justify-center mb-5">
                  <value.icon className="w-6 h-6 text-foreground/70" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <div className="w-12 h-px bg-border mb-4" />
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
