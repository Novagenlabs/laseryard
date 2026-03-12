"use client";

import { Star } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TESTIMONIALS, TESTIMONIAL_STATS } from "@/lib/constants";

export function TestimonialsSlider() {
  return (
    <section className="py-16 sm:py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Trusted by <span className="font-extrabold">Thousands</span>
              </h2>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm">
                  {TESTIMONIAL_STATS.averageRating}/5 from {TESTIMONIAL_STATS.totalClients}+ clients
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Testimonial Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Featured testimonial - spans 2 cols */}
          <ScrollReveal variant="scale" className="md:col-span-2 lg:col-span-2">
            <div className="h-full p-8 sm:p-10 rounded-2xl bg-zinc-950 text-white">
              <div className="flex gap-0.5 mb-6">
                {Array.from({ length: TESTIMONIALS[0].rating }).map((_, j) => (
                  <Star key={j} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed mb-8">
                &ldquo;{TESTIMONIALS[0].quote}&rdquo;
              </blockquote>
              <div>
                <p className="font-semibold">{TESTIMONIALS[0].author}</p>
                <p className="text-sm text-white/60">
                  {TESTIMONIALS[0].title}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {TESTIMONIALS[0].location}
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Third testimonial - single col, matches height */}
          <ScrollReveal variant="scale">
            <div className="h-full p-6 sm:p-8 rounded-2xl bg-card border border-border flex flex-col justify-between">
              <div>
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: TESTIMONIALS[2].rating }).map((_, j) => (
                    <Star key={j} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-base leading-relaxed mb-6">
                  &ldquo;{TESTIMONIALS[2].quote}&rdquo;
                </blockquote>
              </div>
              <div>
                <p className="font-semibold text-sm">{TESTIMONIALS[2].author}</p>
                <p className="text-xs text-muted-foreground">
                  {TESTIMONIALS[2].title}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {TESTIMONIALS[2].location}
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Remaining testimonials */}
          {TESTIMONIALS.slice(1).filter((_, i) => i !== 1).map((t, i) => (
            <ScrollReveal key={i} variant="scale">
              <div className="h-full p-6 sm:p-8 rounded-2xl bg-card border border-border flex flex-col justify-between">
                <div>
                  <div className="flex gap-0.5 mb-5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-base leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.title}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {t.location}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
