"use client";

import Image from "next/image";
import { Check, Star } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { TESTIMONIALS } from "@/lib/constants";

const sellingPoints = [
  "Laser-cut engraving, micron-level precision",
  "Matte-black metal, heavy in the hand",
  "Credit-card sized, fits any wallet",
  "Won't fade, bend, or tear",
  "Minimum order: just 25 cards",
];

const WHATSAPP_MESSAGE =
  "Hi! I saw your metal business card ad and I'm interested in ordering. Can you help me get started?";

export function UnforgettableLanding() {

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/5 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Copy */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <ScrollReveal>
                <p className="text-gold font-semibold text-sm tracking-widest uppercase mb-4">
                  Metal Business Cards
                </p>
                <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] text-balance mb-6">
                  BE{" "}
                  <span className="text-gradient-gold">UNFORGETTABLE</span>
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 text-pretty mb-8">
                  Hand someone a metal card and watch their face change.
                  Heavy, cold to the touch, laser-engraved with your brand.
                  The kind of card people keep.
                </p>
              </ScrollReveal>

              {/* Selling Points */}
              <ScrollReveal delay={0.15}>
                <ul className="space-y-3 mb-10 max-w-md mx-auto lg:mx-0">
                  {sellingPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 size-5 rounded-full bg-gold/15 flex items-center justify-center">
                        <Check className="size-3 text-gold" />
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
                  <Image
                    src="/images/products/metal_card_2.png"
                    alt="Two Laser Yard metal business cards on a dark surface, showing front and back"
                    width={960}
                    height={640}
                    className="w-full rounded-2xl"
                    priority
                  />
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
              <span className="text-2xl font-bold text-gold tabular-nums">500+</span>
              <p className="text-xs text-muted-foreground mt-0.5">Clients served</p>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gold tabular-nums">4.9</span>
              <p className="text-xs text-muted-foreground mt-0.5">Average rating</p>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gold tabular-nums">5-7</span>
              <p className="text-xs text-muted-foreground mt-0.5">Day delivery</p>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gold tabular-nums">25</span>
              <p className="text-xs text-muted-foreground mt-0.5">Card minimum</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Close-up */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <ScrollReveal direction="left">
              <Image
                src="/images/products/johndoe-card.jpg"
                alt="Close-up of a Laser Yard matte-black metal business card with laser-engraved details"
                width={1024}
                height={683}
                className="w-full rounded-2xl"
              />
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div>
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance mb-6">
                  Every detail,{" "}
                  <span className="text-gradient-gold">laser sharp</span>
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg text-pretty mb-6">
                  Your logo, name, QR code, contact info. All engraved into
                  brushed matte-black aluminum with a laser that operates at
                  micron-level accuracy. The result is a card that looks and
                  feels nothing like paper.
                </p>
                <ul className="space-y-3">
                  {[
                    "Custom QR codes that link anywhere",
                    "Full design flexibility, front and back",
                    "Two thickness options: 0.2mm or 0.4mm",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 size-5 rounded-full bg-gold/15 flex items-center justify-center">
                        <Check className="size-3 text-gold" />
                      </span>
                      <span className="text-foreground/90 text-sm sm:text-base">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-center text-balance mb-12">
              Three steps to{" "}
              <span className="text-gradient-gold">your cards</span>
            </h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Share Your Design",
                desc: "Send us your logo and details, or let our design team create something for you.",
              },
              {
                step: "02",
                title: "We Engrave",
                desc: "Your design is laser-cut into matte-black aluminum. Every line, every detail, exactly as you designed it.",
              },
              {
                step: "03",
                title: "Receive & Impress",
                desc: "Cards delivered to your door. Start handing them out and watch people react.",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 0.1}>
                <div className="text-center">
                  <div className="size-12 mx-auto rounded-full bg-gold/10 flex items-center justify-center mb-4">
                    <span className="text-gold font-bold text-sm">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
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
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-center text-balance mb-12">
              What our clients say
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
                        className="size-4 fill-gold text-gold"
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
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-balance mb-4">
                  Your next meeting starts{" "}
                  <span className="text-gradient-gold">differently</span>
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto text-pretty mb-8">
                  Message us on WhatsApp. We&apos;ll send you a free design
                  mockup and a quote within the hour.
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
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-lg border-t border-border lg:hidden z-40">
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
