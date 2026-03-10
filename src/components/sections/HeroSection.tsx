"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useIsMobile";
import Link from "next/link";

export function HeroSection() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <HeroMobile />;
  }

  return <HeroDesktop />;
}

function HeroMobile() {
  const [ready, setReady] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setReady(true)); }, []);

  const fadeSlide = (delay: number) => ({
    animate: ready ? { opacity: 1, y: 0 } as const : { opacity: 0, y: 15 } as const,
    transition: { duration: 0.4, delay, ease: "easeOut" as const },
  });

  return (
    <section className="relative min-h-[90dvh] flex items-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <img
          src="/hero_bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Fallback */}
      <div className="absolute inset-0 -z-10 bg-background" />

      <div className="relative w-full px-4 sm:px-6 pb-12 pt-28 text-center">
        <motion.h1
          {...fadeSlide(0.1)}
          className="font-[family-name:var(--font-montserrat)] text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-balance text-white"
        >
          We Engrave{" "}
          <span className="text-gradient-gold">What Matters</span>
        </motion.h1>

        <motion.p
          {...fadeSlide(0.15)}
          className="mt-4 text-base sm:text-lg text-white/70 max-w-lg mx-auto leading-relaxed"
        >
          Metal business cards, crystal awards, wooden boards, or bring
          us something of yours. We laser-engrave it all and ship worldwide.
        </motion.p>

        <motion.div
          {...fadeSlide(0.2)}
          className="mt-8 flex flex-col sm:flex-row justify-center gap-3"
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
            className="group border-white/30 text-white hover:border-gold hover:bg-gold/10 !rounded-full !py-4 !px-8 !text-base !h-auto backdrop-blur-md bg-white/10"
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

function HeroDesktop() {
  const [ready, setReady] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setReady(true)); }, []);

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <img
          src="/hero_bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Fallback */}
      <div className="absolute inset-0 -z-10 bg-background" />

      <div className="relative w-full mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20 pt-40 text-center">
        <motion.h1
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-[family-name:var(--font-montserrat)] text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.08] text-balance text-white"
        >
          We Engrave{" "}
          <span className="text-gradient-gold">What Matters</span>
        </motion.h1>

        <motion.p
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg lg:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
        >
          Metal business cards, crystal awards, wooden boards, or bring
          us something of yours. We laser-engrave it all and ship worldwide.
        </motion.p>

        <motion.div
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.35 }}
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
            className="group border-white/30 text-white hover:border-gold hover:bg-gold/10 !rounded-full !py-4 !px-8 !text-base !h-auto backdrop-blur-md bg-white/10"
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
