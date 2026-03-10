"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  ChevronRight,
  Check,
  Ruler,
  Layers,
  Crosshair,
  Shield,
} from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { cn } from "@/lib/utils";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTABanner } from "@/components/sections/CTABanner";
import { useIsMobile } from "@/hooks/useIsMobile";

type Thickness = "0.4mm" | "0.8mm";

const thicknessOptions = {
  "0.4mm": {
    label: "Standard",
    description: "Solid & durable, similar to a premium credit card",
  },
  "0.8mm": {
    label: "Premium",
    description: "Heavy & rigid with a substantial executive feel",
  },
};

const specs = [
  { label: "Material", value: "Premium Aluminum" },
  { label: "Standard Size", value: "85mm × 55mm" },
  { label: "Finish", value: "Brushed metal with laser engraving" },
  { label: "Customization", value: "Full custom design" },
  { label: "Minimum Order", value: "25 cards" },
  { label: "Production Time", value: "5-7 business days" },
];

const features = [
  {
    icon: Layers,
    title: "Premium Aluminum",
    description: "Aircraft-grade aluminum for lasting durability",
  },
  {
    icon: Crosshair,
    title: "Laser Precision",
    description: "Micron-level engraving accuracy",
  },
  {
    icon: Shield,
    title: "Weather Resistant",
    description: "Won't fade, rust, or deteriorate",
  },
  {
    icon: Ruler,
    title: "Standard Size",
    description: "Fits any wallet or card holder",
  },
];

export function ProductPage() {
  const [selectedThickness, setSelectedThickness] =
    useState<Thickness>("0.4mm");
  const [activeImage, setActiveImage] = useState(0);
  const isMobile = useIsMobile();

  const option = thicknessOptions[selectedThickness];

  return (
    <>
      <section className="pt-40 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-gold transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Metal Business Cards</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Gallery */}
            <ScrollReveal direction="left">
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square rounded-2xl bg-card border border-border safari-fix-overflow">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Product Visual - static on mobile, animated on desktop */}
                    {isMobile ? (
                      <div className="w-[80%] aspect-[1.6/1] relative">
                        <div
                          className="absolute inset-0 rounded-xl metal-texture safari-fix-overflow"
                          style={{
                            background:
                              "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)",
                            boxShadow: `
                              0 30px 60px -15px rgba(0, 0, 0, 0.5),
                              0 0 0 1px rgba(255, 255, 255, 0.08),
                              inset 0 1px 0 rgba(255, 255, 255, 0.1)
                            `,
                          }}
                        >
                          {/* Card Content - Mobile */}
                          <div className="absolute inset-0 p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-gold/80 text-sm font-semibold tracking-wide">
                                  YOUR NAME
                                </div>
                                <div className="text-white/50 text-xs mt-1 tracking-wider">
                                  YOUR TITLE
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded bg-gold/20 flex items-center justify-center">
                                <span className="text-gold font-bold text-xs">
                                  LOGO
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="text-white/40 text-xs tracking-wider">
                                YOUR COMPANY
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        key={activeImage}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="w-[80%] aspect-[1.6/1] relative"
                      >
                        <div
                          className="absolute inset-0 rounded-xl metal-texture safari-fix-overflow"
                          style={{
                            background:
                              "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)",
                            boxShadow: `
                              0 30px 60px -15px rgba(0, 0, 0, 0.5),
                              0 0 0 1px rgba(255, 255, 255, 0.08),
                              inset 0 1px 0 rgba(255, 255, 255, 0.1)
                            `,
                          }}
                        >
                          {/* Shine Effect - Desktop only */}
                          <motion.div
                            animate={{ x: [-200, 400] }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                            className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                          />

                          {/* Card Content - Desktop */}
                          <div className="absolute inset-0 p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-gold/80 text-sm font-semibold tracking-wide">
                                  YOUR NAME
                                </div>
                                <div className="text-white/50 text-xs mt-1 tracking-wider">
                                  YOUR TITLE
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded bg-gold/20 flex items-center justify-center">
                                <span className="text-gold font-bold text-xs">
                                  LOGO
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="text-white/40 text-xs tracking-wider">
                                YOUR COMPANY
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Zoom hint */}
                  <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/50 text-xs text-white/70">
                    360° view coming soon
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={cn(
                        "aspect-square rounded-lg border-2 transition-all bg-card flex items-center justify-center",
                        activeImage === index
                          ? "border-gold"
                          : "border-border hover:border-gold/50"
                      )}
                    >
                      <div className="w-[60%] aspect-[1.6/1] rounded bg-muted" />
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Product Info */}
            <ScrollReveal direction="right">
              <div className="lg:sticky lg:top-32 space-y-8">
                <div>
                  <h1 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                    Premium Metal Business Cards
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Laser-engraved aluminum cards. Heavy, cold to the touch,
                    and impossible to throw away.
                  </p>
                </div>

                {/* Thickness Selector */}
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Choose Your Thickness
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      Object.entries(thicknessOptions) as [
                        Thickness,
                        (typeof thicknessOptions)["0.4mm"]
                      ][]
                    ).map(([key, opt]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedThickness(key)}
                        className={cn(
                          "relative p-4 rounded-xl border-2 text-left transition-all",
                          selectedThickness === key
                            ? "border-gold bg-gold/5"
                            : "border-border hover:border-gold/30"
                        )}
                      >
                        <div>
                          <p className="font-semibold">{opt.label}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {key}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {opt.description}
                        </p>

                        {selectedThickness === key && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key Info */}
                <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Minimum Order</span>
                    <span className="font-semibold">25 cards</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Production Time</span>
                    <span className="font-semibold">5-7 business days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Selected Thickness</span>
                    <span className="font-semibold">{selectedThickness} ({option.label})</span>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Pricing depends on design complexity, quantity, and finish. Message us for a quote.
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <WhatsAppCTA
                  buttonText="Get a Quote"
                  size="lg"
                  className="w-full"
                  message={`Hi! I'm interested in ordering metal business cards (${selectedThickness} thickness). Can you help me with pricing and the design process?`}
                  trackingLabel="product-page"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl font-bold tracking-tight mb-8">
              Specifications
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {specs.map((spec, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <p className="text-sm text-muted-foreground mb-1">
                    {spec.label}
                  </p>
                  <p className="font-semibold">{spec.value}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <FAQAccordion />
      <CTABanner />
    </>
  );
}
