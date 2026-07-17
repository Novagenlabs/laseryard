"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import Link from "next/link";
import Avatar from "boring-avatars";

const AVATAR_NAMES = ["Adaeze O.", "Marcus T.", "Chioma N.", "Jamal B.", "Sophia K."];

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
    <section className="relative min-h-[90dvh] flex items-center bg-background overflow-hidden">
      <div className="w-full px-4 sm:px-6 pb-12 pt-28">
        {/* Card Image - show first on mobile */}
        <motion.div {...fadeSlide(0.05)} className="mb-8">
          <img
            src="/images/products/front_and back_blac_card_product_photo_whitebackground.png"
            alt="Front and back of matte black metal business card"
            className="w-full max-w-sm mx-auto dark:rounded-2xl"
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeSlide(0.1)}
          className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight leading-[1.1] text-foreground text-center"
        >
          Metal Business Cards.{" "}
          <span className="block">Designed Custom.</span>
          <span className="block font-extrabold text-gold">Delivered Fast.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          {...fadeSlide(0.15)}
          className="mt-4 text-base text-muted-foreground leading-relaxed text-center"
        >
          Order in minutes. Laser-engraved with precision. Shipped worldwide.
        </motion.p>

        {/* CTA */}
        <motion.div {...fadeSlide(0.2)} className="mt-6 flex flex-col items-center gap-3">
          <a
            href={`https://wa.me/22893184418?text=${encodeURIComponent("Hi! I'm interested in ordering metal business cards. Can you help me with pricing?")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background font-medium text-base hover:opacity-90 transition-opacity"
          >
            Get a Quote
            <ArrowRight className="w-4 h-4" />
          </a>
          <Link
            href="/products/metal-business-cards"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            or design your card first
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* Social Proof - compact */}
        <motion.div {...fadeSlide(0.25)} className="mt-6 flex items-center justify-center gap-2">
          <div className="flex -space-x-1.5">
            {AVATAR_NAMES.slice(0, 3).map((name) => (
              <div key={name} className="border-2 border-background rounded-full">
                <Avatar size={24} name={name} variant="beam" colors={["#1a1a2e", "#d4a853", "#e8e0d0", "#333", "#8b7355"]} />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">500+ clients</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HeroDesktop() {
  const [ready, setReady] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setReady(true)); }, []);

  return (
    <section className="relative min-h-[100dvh] flex items-center bg-background overflow-hidden">
      <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left - Text Content */}
          <div className="max-w-xl">
            {/* Social Proof */}
            <motion.div
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="flex -space-x-2">
                {AVATAR_NAMES.map((name) => (
                  <div key={name} className="border-2 border-background rounded-full">
                    <Avatar size={36} name={name} variant="beam" colors={["#1a1a2e", "#d4a853", "#e8e0d0", "#333", "#8b7355"]} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground">500+ Happy Clients</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-[family-name:var(--font-montserrat)] text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.06] text-foreground"
            >
              Metal Business Cards.{" "}
              <span className="block">Designed Custom.</span>
              <span className="block font-extrabold text-gold">Delivered Fast.</span>
            </motion.h1>

            {/* Divider + Subtext */}
            <motion.div
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8"
            >
              <div className="w-20 h-px bg-border mb-6" />
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                Order in minutes. Laser-engraved with precision. Shipped worldwide.
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-10 flex items-center gap-6"
            >
              <a
                href={`https://wa.me/22893184418?text=${encodeURIComponent("Hi! I'm interested in ordering metal business cards. Can you help me with pricing?")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 w-[277px] px-8 py-4 rounded-full bg-foreground text-background font-medium text-base hover:opacity-90 transition-opacity"
              >
                Get a Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                href="/products/metal-business-cards"
                className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Design your card
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Right - Card Images */}
          <motion.div
            animate={ready ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative lg:pl-8"
          >
            <div className="relative">
              <img
                src="/images/products/front_and back_blac_card_product_photo_whitebackground.png"
                alt="Front and back of matte black laser-engraved metal business card"
                className="w-full dark:rounded-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
