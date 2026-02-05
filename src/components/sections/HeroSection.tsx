"use client";

import { motion } from "motion/react";
import { ArrowRight, Zap, Award, Clock } from "lucide-react";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const trustPoints = [
  { icon: Zap, text: "Precision Equipment" },
  { icon: Award, text: "Premium Quality" },
  { icon: Clock, text: "Fast Turnaround" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex items-center overflow-hidden">
      {/* Background Elements - simplified */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/3" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            {/* Pre-headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-gold" />
              <span className="text-sm font-medium text-gold uppercase tracking-wider">
                Precision Laser Engraving
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] text-balance"
            >
              Where Ideas Get{" "}
              <span className="text-gradient-gold">Etched in Metal</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed"
            >
              West Africa's premier laser engraving studio. From business cards
              to custom signage, we bring your vision to life with micron-level
              precision.
            </motion.p>

            {/* Trust Points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 sm:mt-8 flex flex-wrap gap-4 sm:gap-6"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4"
            >
              <WhatsAppCTA
                buttonText="Start Your Project"
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
                <Link href="/products/metal-business-cards">
                  View Our Work
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Hero Visual - Simplified laser machine */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative w-full max-w-sm sm:max-w-md mx-auto">
              {/* Simplified Laser Machine */}
              <div className="relative w-full aspect-square">
                {/* Machine Frame */}
                <div className="absolute inset-4 sm:inset-8 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 shadow-xl overflow-hidden">
                  {/* Machine Interior - Work Surface */}
                  <div className="absolute inset-3 sm:inset-4 rounded-lg bg-slate-800">
                    {/* Grid Lines on Work Surface */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                        backgroundSize: "20px 20px",
                      }}
                    />

                    {/* Work Piece - Metal Card */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 sm:w-32 h-14 sm:h-20 rounded-lg bg-gradient-to-br from-slate-300 to-slate-400 shadow-lg"
                    >
                      <div className="absolute inset-2 flex flex-col justify-between">
                        <div className="w-10 sm:w-12 h-1 sm:h-1.5 bg-slate-500/50 rounded" />
                        <div className="w-6 sm:w-8 h-0.5 sm:h-1 bg-slate-500/30 rounded" />
                      </div>
                    </div>

                    {/* Static Laser Point */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <div className="w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-full opacity-80" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0.5 h-12 sm:h-16 bg-gradient-to-t from-red-500 to-transparent" />
                      </div>
                    </div>
                  </div>

                  {/* Machine Header/Controls */}
                  <div className="absolute top-0 left-0 right-0 h-6 sm:h-8 bg-slate-300 border-b border-slate-400 flex items-center px-2 sm:px-3 gap-1.5 sm:gap-2">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-green-500" />
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-yellow-500" />
                    <div className="text-[6px] sm:text-[8px] font-mono text-slate-600 ml-1 sm:ml-2">
                      LASER YARD PRO
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Labels - visible on larger screens */}
              <div className="hidden sm:block absolute -left-2 top-1/4 bg-white rounded-lg shadow-lg px-3 py-1.5 border border-slate-200">
                <p className="text-xs font-semibold text-slate-800">
                  0.01mm Precision
                </p>
              </div>

              <div className="hidden sm:block absolute -right-2 bottom-1/3 bg-white rounded-lg shadow-lg px-3 py-1.5 border border-slate-200">
                <p className="text-xs font-semibold text-slate-800">
                  Industrial Grade
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
