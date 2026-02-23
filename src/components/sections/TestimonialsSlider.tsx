"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TESTIMONIALS, TESTIMONIAL_STATS } from "@/lib/constants";
import { useIsMobile } from "@/hooks/useIsMobile";
import { StarRating } from "@/components/ui/StarRating";

export function TestimonialsSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const isMobile = useIsMobile();

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent(
      (prev) =>
        (prev + newDirection + TESTIMONIALS.length) % TESTIMONIALS.length
    );
  };

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background - no blur on mobile */}
      {!isMobile && (
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" />
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="text-center mb-12 sm:mb-16">
          <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
            Client Stories
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            What Our <span className="text-gradient-gold">Clients</span> Say
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <StarRating rating={TESTIMONIAL_STATS.averageRating} size="md" />
            <span className="text-muted-foreground text-sm">
              {TESTIMONIAL_STATS.averageRating}/5 from {TESTIMONIAL_STATS.totalClients}+ clients
            </span>
          </div>
        </ScrollReveal>

        {/* Slider */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={() => paginate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 lg:-translate-x-16 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border border-border flex items-center justify-center hover:border-gold transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => paginate(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 lg:translate-x-16 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border border-border flex items-center justify-center hover:border-gold transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Testimonial Card */}
          {isMobile ? (
            // Mobile: No motion components - simple CSS transition
            <div className="relative min-h-[350px] flex items-center justify-center px-8 sm:px-12">
              <div className="w-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border border-border text-center safari-fix-overflow">
                {/* Quote Icon */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gold/10 flex items-center justify-center">
                  <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-gold" aria-hidden="true" />
                </div>

                <div className="mb-4 sm:mb-6 flex justify-center">
                  <StarRating rating={TESTIMONIALS[current].rating} size="sm" />
                </div>

                {/* Quote */}
                <blockquote className="text-lg sm:text-xl font-medium leading-relaxed mb-6 sm:mb-8 text-balance">
                  &ldquo;{TESTIMONIALS[current].quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div>
                  <p className="text-base sm:text-lg font-semibold text-foreground">
                    {TESTIMONIALS[current].author}
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {TESTIMONIALS[current].title}
                  </p>
                  <p className="text-xs sm:text-sm text-gold mt-1">
                    {TESTIMONIALS[current].location}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Desktop: Full animations with AnimatePresence
            <div className="relative h-[400px] flex items-center justify-center overflow-hidden safari-fix-overflow">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={current}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="absolute w-full"
                >
                  <div className="p-8 lg:p-12 rounded-3xl bg-card border border-border text-center">
                    {/* Quote Icon */}
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gold/10 flex items-center justify-center">
                      <Quote className="w-8 h-8 text-gold" aria-hidden="true" />
                    </div>

                    <div className="mb-6 flex justify-center">
                      <StarRating rating={TESTIMONIALS[current].rating} size="md" />
                    </div>

                    {/* Quote */}
                    <blockquote className="text-xl lg:text-2xl font-medium leading-relaxed mb-8 text-balance">
                      &ldquo;{TESTIMONIALS[current].quote}&rdquo;
                    </blockquote>

                    {/* Author */}
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {TESTIMONIALS[current].author}
                      </p>
                      <p className="text-muted-foreground">
                        {TESTIMONIALS[current].title}
                      </p>
                      <p className="text-sm text-gold mt-1">
                        {TESTIMONIALS[current].location}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6 sm:mt-8">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > current ? 1 : -1);
                  setCurrent(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === current
                    ? "w-6 sm:w-8 bg-gold"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={index === current ? "true" : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
