"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Ruler, Layers, Zap } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

const specs = [
  { icon: Layers, label: "Material", value: "Premium Aluminum" },
  { icon: Ruler, label: "Thickness", value: "0.2mm / 0.4mm" },
  { icon: Zap, label: "Finish", value: "Laser Engraved" },
];

const finishes = [
  { id: "brushed", label: "Brushed Silver", color: "#C0C0C0", colorEnd: "#6B7280" },
  { id: "matte-black", label: "Matte Black", color: "#1a1a1a", colorEnd: "#0a0a0a" },
  { id: "gold", label: "Gold", color: "#D4AF37", colorEnd: "#8B7355" },
  { id: "red", label: "Red", color: "#DC2626", colorEnd: "#7F1D1D" },
  { id: "green", label: "Green", color: "#16A34A", colorEnd: "#14532D" },
  { id: "blue", label: "Blue", color: "#2563EB", colorEnd: "#1E3A8A" },
];

export function ProductShowcase() {
  const [activeFinish, setActiveFinish] = useState(finishes[0]);
  const isMobile = useIsMobile();

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Product Visual */}
          <ScrollReveal className="relative">
            <div className="relative w-full max-w-md mx-auto">
              {/* Ambient Glow - desktop only */}
              {!isMobile && (
                <div className="absolute inset-0 bg-gold/10 rounded-full blur-[100px]" />
              )}

              {/* Product Card */}
              <div className="relative flex items-center justify-center min-h-[250px] sm:min-h-[300px]">
                {isMobile ? (
                  // Mobile: Completely static - no motion at all
                  <div
                    className="w-full aspect-[1.6/1] relative rounded-2xl overflow-hidden"
                    style={{
                      background: `linear-gradient(145deg, ${activeFinish.color} 0%, ${activeFinish.colorEnd} 100%)`,
                      boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.4)`,
                    }}
                  >
                    <CardContent />
                  </div>
                ) : (
                  // Desktop: Full 3D animation with shine
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
                          background: `linear-gradient(145deg, ${activeFinish.color} 0%, ${activeFinish.colorEnd} 100%)`,
                          boxShadow: `
                            0 50px 100px -20px rgba(0, 0, 0, 0.6),
                            0 0 0 1px rgba(255, 255, 255, 0.15),
                            inset 0 1px 0 rgba(255, 255, 255, 0.2)
                          `,
                        }}
                      >
                        {/* Shine sweep - desktop only */}
                        <motion.div
                          animate={{ x: [-200, 500] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                          className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                        />
                        <CardContent />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {/* Finish Selector */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-6 p-2 rounded-full bg-card border border-border w-fit mx-auto">
                {finishes.map((finish) => (
                  <button
                    key={finish.id}
                    onClick={() => setActiveFinish(finish)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-transform duration-200",
                      activeFinish.id === finish.id
                        ? "border-gold scale-110"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: finish.color }}
                    aria-label={`Select ${finish.label} finish`}
                    aria-pressed={activeFinish.id === finish.id}
                  />
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal>
            <div className="space-y-6 sm:space-y-8">
              <div>
                <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
                  Featured Product
                </p>
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                  Metal Business{" "}
                  <span className="text-gradient-gold">Cards</span>
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                  Our most popular service. Laser-engraved aluminum cards that
                  make unforgettable first impressions. The tactile experience
                  paper simply cannot match.
                </p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {specs.map((spec, index) => (
                  <div
                    key={index}
                    className="p-3 sm:p-4 rounded-xl bg-card border border-border text-center"
                  >
                    <spec.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold mx-auto mb-2" aria-hidden="true" />
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                      {spec.label}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold">{spec.value}</p>
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

// Shared card content mockup
function CardContent() {
  return (
    <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <div className="w-20 sm:w-24 h-2 rounded mb-2 bg-white/80" />
          <div className="w-14 sm:w-16 h-1.5 bg-white/40 rounded" />
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-white/30" />
      </div>
      <div>
        <div className="w-28 sm:w-32 h-1.5 bg-white/30 rounded mb-2" />
        <div className="w-16 sm:w-20 h-1 bg-white/20 rounded" />
      </div>
    </div>
  );
}
