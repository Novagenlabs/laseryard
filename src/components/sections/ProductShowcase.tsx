"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Ruler, Layers, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { cn } from "@/lib/utils";

const specs = [
  {
    icon: Layers,
    label: "Material",
    value: "Premium Aluminum",
  },
  {
    icon: Ruler,
    label: "Thickness",
    value: "0.2mm / 0.4mm",
  },
  {
    icon: Sparkles,
    label: "Finish",
    value: "Laser Engraved",
  },
];

const finishes = [
  { id: "brushed", label: "Brushed Metal", color: "#2a2a2a" },
  { id: "matte-black", label: "Matte Black", color: "#0a0a0a" },
  { id: "gold-accent", label: "Gold Accent", color: "#1a1a1a" },
];

export function ProductShowcase() {
  const [activeFinish, setActiveFinish] = useState(finishes[0]);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Product Visual */}
          <ScrollReveal direction="left" className="relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Ambient Glow */}
              <div className="absolute inset-0 bg-gold/10 rounded-full blur-[100px]" />

              {/* Product Card */}
              <div className="relative h-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFinish.id}
                    initial={{ opacity: 0, rotateY: -10 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: 10 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[400px] aspect-[1.6/1] relative"
                  >
                    <div
                      className="absolute inset-0 rounded-2xl metal-texture overflow-hidden"
                      style={{
                        background: `linear-gradient(145deg, ${activeFinish.color} 0%, #0a0a0a 100%)`,
                        boxShadow: `
                          0 50px 100px -20px rgba(0, 0, 0, 0.6),
                          0 0 0 1px rgba(255, 255, 255, 0.08),
                          inset 0 1px 0 rgba(255, 255, 255, 0.1)
                        `,
                      }}
                    >
                      {/* Shine sweep */}
                      <motion.div
                        animate={{ x: [-200, 500] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                        className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                      />

                      {/* Content mockup */}
                      <div className="absolute inset-0 p-8 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="w-24 h-2 bg-gold/60 rounded mb-2" />
                            <div className="w-16 h-1.5 bg-white/20 rounded" />
                          </div>
                          <div className="w-12 h-12 rounded-lg border border-gold/30" />
                        </div>
                        <div>
                          <div className="w-32 h-1.5 bg-white/15 rounded mb-2" />
                          <div className="w-20 h-1 bg-white/10 rounded" />
                        </div>
                      </div>

                      {/* Gold accent line for gold-accent finish */}
                      {activeFinish.id === "gold-accent" && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/50 via-gold to-gold/50" />
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Finish Selector */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 rounded-full bg-card border border-border">
                {finishes.map((finish) => (
                  <button
                    key={finish.id}
                    onClick={() => setActiveFinish(finish)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all duration-300",
                      activeFinish.id === finish.id
                        ? "border-gold scale-110"
                        : "border-transparent hover:border-slate-400"
                    )}
                    style={{ backgroundColor: finish.color }}
                    title={finish.label}
                  />
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal direction="right">
            <div className="space-y-8">
              <div>
                <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
                  Featured Product
                </p>
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                  Metal Business <br />
                  <span className="text-gradient-gold">Cards</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Our most popular service. Laser-engraved aluminum cards that
                  make unforgettable first impressions. The tactile experience
                  paper simply cannot match.
                </p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-4">
                {specs.map((spec, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-card border border-border text-center"
                  >
                    <spec.icon className="w-6 h-6 text-gold mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">
                      {spec.label}
                    </p>
                    <p className="text-sm font-semibold">{spec.value}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <WhatsAppCTA
                  buttonText="Get Custom Quote"
                  size="lg"
                  message="Hi! I'm interested in premium metal business cards. Can you help me with customization options?"
                  trackingLabel="product-showcase"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
