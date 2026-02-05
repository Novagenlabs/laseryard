"use client";

import { motion } from "motion/react";
import { ArrowRight, Zap, Award, Clock } from "lucide-react";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useIsMobile";
import Link from "next/link";

const trustPoints = [
  { icon: Zap, text: "Precision Equipment" },
  { icon: Award, text: "Premium Quality" },
  { icon: Clock, text: "Fast Turnaround" },
];

export function HeroSection() {
  const isMobile = useIsMobile();

  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/3" />
        {/* Grid Pattern - desktop only */}
        {!isMobile && (
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        )}
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
              <span className={`w-2 h-2 rounded-full bg-gold ${!isMobile ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium text-gold uppercase tracking-wider">
                Precision Laser Engraving
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: isMobile ? 20 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: isMobile ? 0.4 : 0.6, delay: 0.1 }}
              className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] text-balance"
            >
              Where Ideas Get{" "}
              <span className="text-gradient-gold">Etched in Metal</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: isMobile ? 20 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: isMobile ? 0.4 : 0.6, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed"
            >
              West Africa's premier laser engraving studio. From business cards
              to custom signage, we bring your vision to life with micron-level
              precision.
            </motion.p>

            {/* Trust Points */}
            <motion.div
              initial={{ opacity: 0, y: isMobile ? 20 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: isMobile ? 0.4 : 0.6, delay: 0.3 }}
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
              initial={{ opacity: 0, y: isMobile ? 20 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: isMobile ? 0.4 : 0.6, delay: 0.4 }}
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

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: isMobile ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: isMobile ? 0.4 : 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative w-full max-w-sm sm:max-w-md mx-auto">
              {/* Glow Effect - desktop only */}
              {!isMobile && (
                <div className="absolute inset-0 bg-gold/10 rounded-3xl blur-[80px]" />
              )}

              {/* Laser Machine */}
              <div className="relative w-full aspect-square">
                {/* Machine Frame */}
                <div className="absolute inset-4 sm:inset-8 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 shadow-xl overflow-hidden">
                  {/* Machine Interior */}
                  <div className="absolute inset-3 sm:inset-4 rounded-lg bg-slate-800">
                    {/* Grid Lines */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                        backgroundSize: "20px 20px",
                      }}
                    />

                    {/* Work Piece - Metal Card */}
                    {isMobile ? (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 sm:w-32 h-14 sm:h-20 rounded-lg bg-gradient-to-br from-slate-300 to-slate-400 shadow-lg">
                        <div className="absolute inset-2 flex flex-col justify-between">
                          <div className="w-10 sm:w-12 h-1 sm:h-1.5 bg-slate-500/50 rounded" />
                          <div className="w-6 sm:w-8 h-0.5 sm:h-1 bg-slate-500/30 rounded" />
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-20 rounded-lg bg-gradient-to-br from-slate-300 to-slate-400 shadow-lg"
                        style={{
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)",
                        }}
                      >
                        <div className="absolute inset-2 flex flex-col justify-between">
                          <div className="w-12 h-1.5 bg-slate-500/50 rounded" />
                          <div className="w-8 h-1 bg-slate-500/30 rounded" />
                        </div>
                      </motion.div>
                    )}

                    {/* Laser Beam */}
                    {isMobile ? (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                          <div className="w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-full opacity-80" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0.5 h-12 sm:h-16 bg-gradient-to-t from-red-500 to-transparent" />
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        animate={{
                          x: [-30, 30, -30],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      >
                        <div className="relative">
                          <div className="w-3 h-3 bg-red-500 rounded-full blur-sm" />
                          <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0.5 h-16 bg-gradient-to-t from-red-500 to-transparent" />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Machine Header */}
                  <div className="absolute top-0 left-0 right-0 h-6 sm:h-8 bg-slate-300 border-b border-slate-400 flex items-center px-2 sm:px-3 gap-1.5 sm:gap-2">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-green-500" />
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-yellow-500" />
                    <div className="text-[6px] sm:text-[8px] font-mono text-slate-600 ml-1 sm:ml-2">
                      LASER YARD PRO
                    </div>
                  </div>
                </div>

                {/* Sparks - desktop only */}
                {!isMobile && (
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          x: [0, (i % 2 === 0 ? 1 : -1) * 20],
                          y: [0, (i % 3 === 0 ? 1 : -1) * 20],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                        className="absolute w-1 h-1 bg-gold rounded-full"
                      />
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Floating Labels - desktop only */}
              {!isMobile && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="absolute -left-4 top-1/4 bg-white rounded-lg shadow-lg px-4 py-2 border border-slate-200"
                  >
                    <p className="text-xs font-semibold text-slate-800">
                      0.01mm Precision
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute -right-4 bottom-1/3 bg-white rounded-lg shadow-lg px-4 py-2 border border-slate-200"
                  >
                    <p className="text-xs font-semibold text-slate-800">
                      Industrial Grade
                    </p>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator - desktop only */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 rounded-full bg-gold" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
