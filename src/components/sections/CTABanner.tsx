"use client";

import { Phone } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";

export function CTABanner() {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden safari-fix-overflow">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-gold/10 to-transparent" />
            <div className="absolute inset-0 bg-card" />

            {/* Content */}
            <div className="relative px-6 py-12 sm:px-16 sm:py-20 text-center">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-4">
                Ready to Elevate Your{" "}
                <span className="text-gradient-gold">Networking?</span>
              </h2>

              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10">
                From metal business cards to custom signage, we bring your vision
                to life with precision laser engraving. Get your quote in minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <WhatsAppCTA
                  buttonText="Start Your Order"
                  size="lg"
                  variant="gold"
                  message="Hi! I'm ready to order premium metal business cards. Can we get started?"
                  trackingLabel="cta-banner"
                />

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>+234 801 234 5678</span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  <span className="text-gold font-semibold">500+</span>{" "}
                  executives trust Laser Yard for premium business cards
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
