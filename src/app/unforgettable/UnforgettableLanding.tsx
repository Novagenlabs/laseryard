"use client";

import { motion } from "motion/react";
import { Check, Star } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TESTIMONIALS } from "@/lib/constants";

const sellingPoints = [
  "Laser-cut engraving — micron-level precision",
  "Premium matte-black metal finish",
  "Credit-card sized — fits any wallet",
  "Won't fade, bend, or tear",
  "Minimum order: just 25 cards",
];

const WHATSAPP_MESSAGE =
  "Hi! I saw your metal business card ad and I'm interested in ordering. Can you help me get started?";

function MetalCardVisual({ isMobile }: { isMobile: boolean }) {
  const card = (
    <div
      className="absolute inset-0 rounded-xl metal-texture safari-fix-overflow"
      style={{
        background:
          "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)",
        boxShadow: `
          0 30px 60px -15px rgba(0, 0, 0, 0.5),
          0 0 0 1px rgba(255, 255, 255, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
      }}
    >
      <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-gold/80 text-sm sm:text-base font-semibold tracking-wide">
              YOUR NAME
            </div>
            <div className="text-white/50 text-xs sm:text-sm mt-1 tracking-wider">
              YOUR TITLE
            </div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-gold/20 flex items-center justify-center">
            <span className="text-gold font-bold text-xs">LOGO</span>
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div className="text-white/40 text-xs sm:text-sm tracking-wider">
            YOUR COMPANY
          </div>
          <div className="text-white/30 text-[10px] tracking-wider">
            laseryard.com
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </div>
  );

  if (isMobile) {
    return (
      <div className="w-full max-w-[340px] mx-auto aspect-[1.6/1] relative">
        {card}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      className="w-full max-w-[480px] mx-auto aspect-[1.6/1] relative"
    >
      {card}
      <motion.div
        animate={{ x: [-200, 500] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
        className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
      />
    </motion.div>
  );
}

export function UnforgettableLanding() {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Copy */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <ScrollReveal>
                <p className="text-gold font-semibold text-sm tracking-widest uppercase mb-4">
                  Metal Business Cards
                </p>
                <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                  BE{" "}
                  <span className="text-gradient-gold">UNFORGETTABLE</span>
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 mb-8">
                  Hand someone a metal card and watch their face change.
                  Heavy, cold to the touch, laser-engraved with your brand —
                  the kind of card people never throw away.
                </p>
              </ScrollReveal>

              {/* Selling Points */}
              <ScrollReveal delay={0.15}>
                <ul className="space-y-3 mb-10 max-w-md mx-auto lg:mx-0">
                  {sellingPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center">
                        <Check className="w-3 h-3 text-gold" />
                      </span>
                      <span className="text-foreground/90 text-sm sm:text-base">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>

              {/* CTA */}
              <ScrollReveal delay={0.25}>
                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                  <WhatsAppCTA
                    buttonText="Order Your Cards"
                    variant="gold"
                    size="lg"
                    message={WHATSAPP_MESSAGE}
                    trackingLabel="unforgettable-hero"
                  />
                  <p className="text-xs text-muted-foreground">
                    Free design consultation &middot; 5-7 day delivery
                  </p>
                </div>
              </ScrollReveal>
            </div>

            {/* Card Visual */}
            <div className="order-1 lg:order-2">
              <ScrollReveal direction="none">
                <div className="relative">
                  <MetalCardVisual isMobile={isMobile} />
                  {/* Glow behind card */}
                  <div className="absolute inset-0 -z-10 scale-110 blur-3xl bg-gold/8 rounded-full" />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="py-8 border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-center">
            <div>
              <span className="text-2xl font-bold text-gold">500+</span>
              <p className="text-xs text-muted-foreground mt-0.5">Clients Served</p>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gold">4.9</span>
              <p className="text-xs text-muted-foreground mt-0.5">Average Rating</p>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gold">5-7</span>
              <p className="text-xs text-muted-foreground mt-0.5">Day Delivery</p>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gold">25</span>
              <p className="text-xs text-muted-foreground mt-0.5">Card Minimum</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-center mb-12">
              Three Steps to{" "}
              <span className="text-gradient-gold">Your Cards</span>
            </h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Share Your Design",
                desc: "Send us your logo and details — or let our design team create something for you.",
              },
              {
                step: "02",
                title: "We Engrave",
                desc: "Your design is laser-cut into premium matte-black aluminum with micron-level precision.",
              },
              {
                step: "03",
                title: "Receive & Impress",
                desc: "Cards delivered to your door. Start handing them out and watch people react.",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gold/10 flex items-center justify-center mb-4">
                    <span className="text-gold font-bold text-sm">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-center mb-12">
              What Our Clients Say
            </h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="p-6 rounded-2xl bg-background border border-border h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star
                        key={j}
                        className="w-4 h-4 fill-gold text-gold"
                      />
                    ))}
                  </div>
                  <blockquote className="text-sm text-foreground/90 leading-relaxed flex-1 mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div>
                    <p className="font-semibold text-sm">{t.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.title}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden safari-fix-overflow">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-gold/10 to-transparent" />
              <div className="absolute inset-0 bg-card" />

              <div className="relative px-6 py-12 sm:px-16 sm:py-20 text-center">
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-4">
                  Ready to{" "}
                  <span className="text-gradient-gold">Stand Out?</span>
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8">
                  Message us on WhatsApp. Get a free design mockup and a
                  quote within the hour.
                </p>
                <WhatsAppCTA
                  buttonText="Order Your Cards Now"
                  variant="gold"
                  size="lg"
                  message={WHATSAPP_MESSAGE}
                  trackingLabel="unforgettable-bottom-cta"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border lg:hidden z-40">
        <WhatsAppCTA
          buttonText="Order Your Cards"
          variant="gold"
          size="lg"
          className="w-full"
          message={WHATSAPP_MESSAGE}
          trackingLabel="unforgettable-sticky"
        />
      </div>
    </>
  );
}
