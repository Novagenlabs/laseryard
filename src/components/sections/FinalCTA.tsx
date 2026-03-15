"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export function FinalCTA() {
  return (
    <section className="py-16 sm:py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="scale">
          <div className="rounded-2xl sm:rounded-3xl bg-secondary dark:bg-card overflow-hidden safari-fix-overflow">
            <div className="grid lg:grid-cols-2 gap-0 items-center">
              {/* Left - Text */}
              <div className="p-8 sm:p-12 lg:p-16">
                <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                  Ready to{" "}
                  <span className="font-extrabold">Stand Out?</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Real metal business cards, made fast and without the hassle.
                  Upload your design or let us create one for you.
                </p>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link
                    href="/products/metal-business-cards"
                    className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background font-medium text-base hover:opacity-90 transition-opacity"
                  >
                    Design Your Card
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <p className="text-sm text-muted-foreground self-center">
                    Takes less than a minute.
                  </p>
                </div>
              </div>

              {/* Right - Card Image */}
              <div className="relative p-8 sm:p-12 lg:p-16 flex items-center justify-center">
                <img
                  src="/images/products/card_front_transparent_background.png"
                  alt="Matte black laser-engraved metal business card"
                  className="w-full max-w-md"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
