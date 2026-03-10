"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { useIsMobile } from "@/hooks/useIsMobile";

// Placeholder logos - in production, these would be actual client logos
const logos = [
  { name: "First Bank", initials: "FB" },
  { name: "MTN", initials: "MTN" },
  { name: "Dangote Group", initials: "DG" },
  { name: "Zenith Bank", initials: "ZB" },
  { name: "Access Bank", initials: "AB" },
  { name: "GTBank", initials: "GT" },
];

export function TrustSignals() {
  const isMobile = useIsMobile();

  return (
    <section className="py-16 border-y border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-wider">
            Trusted by leading companies worldwide
          </p>
        </ScrollReveal>

        {isMobile ? (
          // Mobile: Static grid of logos (no animation to avoid blocking)
          <div className="grid grid-cols-3 gap-4">
            {logos.map((logo, index) => (
              <div
                key={index}
                className="h-12 rounded-lg bg-card/50 border border-border/50 flex items-center justify-center"
              >
                <span className="text-sm font-semibold text-muted-foreground/50">
                  {logo.initials}
                </span>
              </div>
            ))}
          </div>
        ) : (
          // Desktop: CSS-animated marquee (runs on compositor thread, doesn't block main thread)
          <div className="relative overflow-hidden">
            {/* Gradient Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

            {/* CSS-animated Scrolling Logos */}
            <div className="flex animate-marquee">
              {[...logos, ...logos, ...logos].map((logo, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-32 h-12 mx-6 rounded-lg bg-card/50 border border-border/50 flex items-center justify-center transition-all duration-300 hover:border-gold/30 hover:bg-card group"
                >
                  <span className="text-lg font-semibold text-muted-foreground/50 group-hover:text-gold/50 transition-colors">
                    {logo.initials}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
