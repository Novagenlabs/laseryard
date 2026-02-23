"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Zap, Award, Clock } from "lucide-react";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useIsMobile";
import Link from "next/link";

const trustPoints = [
  { icon: Zap, text: "Industrial-Grade Lasers" },
  { icon: Award, text: "500+ Clients" },
  { icon: Clock, text: "5-7 Day Turnaround" },
];

/** Noise texture SVG for cinematic film grain effect */
const noiseOverlay = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export function HeroSection() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <HeroMobile />;
  }

  return <HeroDesktop />;
}

/**
 * Mobile Hero - Centered layout with background image.
 * Lightweight entrance animations only. No infinite animations.
 */
function HeroMobile() {
  const [ready, setReady] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setReady(true)); }, []);

  const fadeSlide = (delay: number) => ({
    animate: ready ? { opacity: 1, y: 0 } as const : { opacity: 0, y: 15 } as const,
    transition: { duration: 0.4, delay, ease: "easeOut" as const },
  });

  return (
    <section className="relative min-h-[90dvh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
        {/* Gold radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, oklch(from var(--gold) l c h / 8%) 0%, transparent 70%)",
          }}
        />
        {/* Film grain */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: noiseOverlay }}
        />
      </div>

      {/* Gradient fallback */}
      <div
        className="absolute inset-0 -z-10 bg-background"
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 pt-28 pb-16 text-center">
        {/* Pre-headline badge */}
        <motion.div
          {...fadeSlide(0)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-gold" />
          <span className="text-sm font-medium text-gold uppercase tracking-wider">
            Laser Engraving Studio
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeSlide(0.1)}
          className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-balance"
        >
          Your Vision,{" "}
          <span className="text-gradient-gold">Laser Engraved</span>
        </motion.h1>

        {/* Decorative gold line */}
        <motion.div
          {...fadeSlide(0.12)}
          className="mx-auto mt-5 mb-5 h-px w-16"
          style={{
            background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
          }}
        />

        {/* Subtitle */}
        <motion.p
          {...fadeSlide(0.15)}
          className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Based in Lagos. Serving all of West Africa. We sell ready-made
          engraved products and custom-engrave items you bring us.
        </motion.p>

        {/* Trust Points */}
        <motion.div
          {...fadeSlide(0.2)}
          className="mt-6 flex flex-wrap justify-center gap-4"
        >
          {trustPoints.map((point, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <point.icon className="w-4 h-4 text-gold" aria-hidden="true" />
              <span>{point.text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          {...fadeSlide(0.25)}
          className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
        >
          <WhatsAppCTA
            buttonText="Get a Quote"
            size="lg"
            message="Hi! I'm interested in laser engraving services. Can we discuss my project?"
            trackingLabel="hero"
          />
          <Button
            asChild
            variant="outline"
            size="lg"
            className="group border-border hover:border-gold hover:bg-gold/5 px-8"
          >
            <Link href="/shop">
              Browse Products
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Desktop Hero - Full-bleed background image with centered text overlay.
 * Cinematic slow zoom on background, film grain texture.
 */
function HeroDesktop() {
  const [ready, setReady] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setReady(true)); }, []);

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      {/* Background Image with slow zoom */}
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0"
      >
        <img
          src="/images/hero-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </motion.div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />

      {/* Gold radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, oklch(from var(--gold) l c h / 10%) 0%, transparent 60%)",
        }}
      />

      {/* Film grain texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: noiseOverlay }}
      />

      {/* Gradient fallback */}
      <div
        className="absolute inset-0 -z-10 bg-background"
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-40 pb-20 text-center">
        {/* Pre-headline badge */}
        <motion.div
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 backdrop-blur-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-sm font-medium text-gold uppercase tracking-wider">
            Laser Engraving Studio
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-[family-name:var(--font-playfair)] text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.08] text-balance"
        >
          Your Vision,{" "}
          <span className="text-gradient-gold">Laser Engraved</span>
        </motion.h1>

        {/* Decorative gold line */}
        <motion.div
          animate={ready ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mx-auto mt-6 mb-6 h-px w-24"
          style={{
            background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
          }}
        />

        {/* Subtitle */}
        <motion.p
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Based in Lagos. Serving all of West Africa. We sell ready-made
          engraved products and custom-engrave items you bring us.
        </motion.p>

        {/* Trust Points */}
        <motion.div
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-6"
        >
          {trustPoints.map((point, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <point.icon className="w-4 h-4 text-gold" aria-hidden="true" />
              <span>{point.text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <WhatsAppCTA
            buttonText="Get a Quote"
            size="lg"
            message="Hi! I'm interested in laser engraving services. Can we discuss my project?"
            trackingLabel="hero"
          />
          <Button
            asChild
            variant="outline"
            size="lg"
            className="group border-border hover:border-gold hover:bg-gold/5 px-8"
          >
            <Link href="/shop">
              Browse Products
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={ready ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 rounded-full border border-muted-foreground/20 flex items-start justify-center pt-1.5"
        >
          <div className="w-0.5 h-1.5 rounded-full bg-gold" />
        </motion.div>
      </motion.div>
    </section>
  );
}
