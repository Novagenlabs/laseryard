"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TESTIMONIALS } from "@/lib/constants";

export function UnforgettableLanding() {
  return (
    <>
      {/* ──── Hero ──── */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Copy */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <ScrollReveal>
                <p className="text-muted-foreground text-[11px] tracking-[0.35em] uppercase font-medium mb-6">
                  Metal Business Cards
                </p>
                <h1 className="font-[family-name:var(--font-montserrat)] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                  BE{" "}
                  <span className="text-gradient-gold">UNFORGETTABLE</span>
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed mb-10">
                  Hand someone a metal card and watch their face change.
                  Heavy, cold to the touch, laser-engraved with your brand.
                  The kind of card people keep.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                  <Link
                    href="/products/metal-business-cards"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background font-medium text-base hover:opacity-90 transition-opacity"
                  >
                    Order Your Cards
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <p className="text-[11px] text-muted-foreground/50 mt-4 text-center lg:text-left tracking-wide">
                  Free design consultation · 10-14 day production · Min. 30 cards
                </p>
              </ScrollReveal>
            </div>

            {/* Product photo */}
            <div className="order-1 lg:order-2">
              <ScrollReveal direction="none">
                <Image
                  src="/images/products/front_and back_blac_card_product_photo_whitebackground.png"
                  alt="Front and back of matte black laser-engraved metal business card"
                  width={2720}
                  height={1388}
                  className="w-full rounded-2xl"
                  priority
                />
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Numbers ──── */}
      <section className="py-5 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {[
              { value: "500+", label: "clients" },
              { value: "4.9", label: "rating" },
              { value: "10-14 days", label: "production" },
              { value: "25", label: "card min." },
            ].map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-montserrat)] font-bold text-base text-foreground tabular-nums">
                  {s.value}
                </span>
                <span className="text-muted-foreground/40 text-[10px] tracking-[0.15em] uppercase">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Product Detail ──── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <ScrollReveal direction="left">
              <Image
                src="/images/products/blac_card_product_photo_whitebackground.png"
                alt="Angled view of matte black laser-engraved metal business card"
                width={1024}
                height={683}
                className="w-full rounded-2xl"
              />
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div>
                <h2 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-6">
                  Every detail, laser sharp
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">
                  Your logo, name, QR code, contact info. All engraved into
                  brushed matte-black aluminum at micron-level accuracy. The
                  result is a card that looks and feels nothing like paper.
                </p>
                <div className="space-y-3.5 text-sm">
                  {[
                    "Laser-cut engraving, micron-level precision",
                    "Matte black, glossy, or brushed stainless steel",
                    "Credit-card sized, fits any wallet",
                    "Won't fade, bend, or tear",
                    "Custom QR codes that link anywhere",
                    "Full design flexibility, front and back",
                    "Two thickness options: 0.4mm or 0.8mm",
                  ].map((point) => (
                    <div key={point} className="flex items-center gap-3">
                      <span className="size-1 rounded-full bg-foreground/30 flex-shrink-0" />
                      <span className="text-foreground/80">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ──── Process ──── */}
      <section className="py-20 sm:py-28 border-y border-border/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl font-bold tracking-tight mb-16 text-center">
              How it works
            </h2>
          </ScrollReveal>

          {[
            {
              num: "01",
              title: "Share your design",
              desc: "Send us your logo and details, or let our design team create something for you. We accept AI, EPS, PDF, and high-res PNG.",
            },
            {
              num: "02",
              title: "We engrave",
              desc: "Your design is laser-cut into matte-black aluminum with industrial-grade equipment. Every line, every curve, exactly as designed.",
            },
            {
              num: "03",
              title: "Receive and impress",
              desc: "Cards delivered to your door within 10-14 business days after approval, though they can be ready in as little as 5-7 days.",
            },
          ].map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 0.08}>
              <div className="flex gap-6 sm:gap-10 py-8 border-t border-border/40">
                <span className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold text-foreground/10 tabular-nums flex-shrink-0 leading-none pt-0.5">
                  {step.num}
                </span>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                    {step.desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ──── Testimonials ──── */}
      <section className="py-20 sm:py-28 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl font-bold tracking-tight mb-12">
              What clients say
            </h2>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Featured testimonial */}
            <ScrollReveal>
              <div className="p-8 sm:p-10 rounded-2xl bg-card border border-border h-full flex flex-col justify-between">
                <div>
                  <div className="flex gap-0.5 mb-6">
                    {Array.from({ length: TESTIMONIALS[0].rating }).map((_, j) => (
                      <Star key={j} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-lg sm:text-xl text-foreground leading-relaxed mb-8">
                    &ldquo;{TESTIMONIALS[0].quote}&rdquo;
                  </blockquote>
                </div>
                <div>
                  <p className="font-semibold">{TESTIMONIALS[0].author}</p>
                  <p className="text-sm text-muted-foreground">
                    {TESTIMONIALS[0].title} · {TESTIMONIALS[0].location}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Stacked testimonials */}
            <div className="space-y-6">
              {TESTIMONIALS.slice(1, 4).map((t, i) => (
                <ScrollReveal key={i} delay={i * 0.08}>
                  <div className="p-6 rounded-xl bg-card border border-border">
                    <blockquote className="text-sm text-foreground/90 leading-relaxed mb-4">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{t.author}</p>
                        <p className="text-xs text-muted-foreground">{t.location}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} className="size-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──── Final CTA ──── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-4">
              Your next meeting starts differently
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
              Get in touch and we&apos;ll send a free design mockup and a
              quote within the hour.
            </p>
            <Link
              href="/products/metal-business-cards"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background font-medium text-base hover:opacity-90 transition-opacity"
            >
              Start Your Order
              <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
