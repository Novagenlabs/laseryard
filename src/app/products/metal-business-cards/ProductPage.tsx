"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Check,
  Ruler,
  Layers,
  Crosshair,
  Shield,
  ArrowRight,
} from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { cn } from "@/lib/utils";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTABanner } from "@/components/sections/CTABanner";
import { ShippingEstimator } from "@/components/shipping/ShippingEstimator";
import { WhopCheckout } from "@/components/payments/WhopCheckout";

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
  { label: "Material", value: "Aluminum & Stainless Steel" },
  { label: "Standard Size", value: "85mm × 55mm" },
  { label: "Finishes", value: "Matte black, glossy, brushed steel" },
  { label: "Customization", value: "Full custom design" },
  { label: "Minimum Order", value: "30 cards" },
  { label: "Production Time", value: "10-14 business days after approval" },
];

const features = [
  {
    icon: Layers,
    title: "Aluminum & Stainless Steel",
    description: "Two material options for the look you want",
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

const galleryImages = [
  {
    src: "/images/products/blac_card_product_photo_whitebackground.png",
    alt: "Matte black laser-engraved metal business card, angled view",
  },
  {
    src: "/images/products/card_whitebackground_product_photo_1.png",
    alt: "Brushed stainless steel metal business card",
  },
  {
    src: "/images/products/card_whitebackground_product_photo_2.png",
    alt: "Back of metal business card with contact details",
  },
  {
    src: "/images/products/front_and back_blac_card_product_photo_whitebackground.png",
    alt: "Front and back of matte black metal business card",
  },
];

export function ProductPage() {
  const [selectedThickness, setSelectedThickness] =
    useState<Thickness>("0.4mm");
  const [activeImage, setActiveImage] = useState(0);

  const option = thicknessOptions[selectedThickness];

  return (
    <>
      <section className="pt-40 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
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
                <div className="relative rounded-2xl bg-card border border-border overflow-hidden safari-fix-overflow">
                  <img
                    src={galleryImages[activeImage].src}
                    alt={galleryImages[activeImage].alt}
                    className="w-full"
                  />

                  {/* Design Studio hint */}
                  <Link
                    href="/unforgettable/design-studio"
                    className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-foreground/90 text-xs text-background font-medium hover:bg-foreground transition-colors flex items-center gap-1.5 group"
                  >
                    Preview your design in 3D
                    <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-4 gap-3">
                  {galleryImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={cn(
                        "aspect-square rounded-lg border-2 transition-all bg-card overflow-hidden",
                        activeImage === index
                          ? "border-foreground"
                          : "border-border hover:border-foreground/30"
                      )}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
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
                    Laser-engraved aluminum and stainless steel cards. Heavy,
                    cold to the touch, and impossible to throw away.
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
                            ? "border-foreground bg-foreground/5"
                            : "border-border hover:border-foreground/30"
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
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                            <Check className="w-3 h-3 text-background" />
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
                    <span className="font-semibold">30 cards</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Production Time</span>
                    <span className="font-semibold">10-14 business days</span>
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
                <div className="space-y-3">
                  <WhopCheckout
                    amount={200}
                    currency="usd"
                    metadata={{ thickness: selectedThickness, quantity: "30" }}
                    buttonText={`Order Now - $200`}
                  />
                  <a
                    href={`https://wa.me/22893184418?text=${encodeURIComponent(`Hi! I'm interested in ordering metal business cards (${selectedThickness} thickness). Can you help me with pricing and the design process?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all group"
                  >
                    Need a custom quote? Chat on WhatsApp
                    <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                  <Link
                    href="/unforgettable/design-studio"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all group"
                  >
                    Try the Design Studio
                    <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Shipping Estimate */}
                <ShippingEstimator />
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
                  <div className="w-14 h-14 mx-auto rounded-xl bg-foreground/5 dark:bg-background/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-foreground/70" />
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

      {/* Design Studio CTA */}
      <section className="py-16 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-8 border-t border-border/50">
              <div>
                <h2 className="font-[family-name:var(--font-montserrat)] text-xl sm:text-2xl font-bold tracking-tight mb-2">
                  See your card before you order
                </h2>
                <p className="text-muted-foreground text-sm max-w-lg">
                  Upload your logo and preview it laser-engraved on metal in 3D.
                  No account needed.
                </p>
              </div>
              <Link
                href="/unforgettable/design-studio"
                className="inline-flex items-center gap-2.5 text-foreground hover:text-foreground/70 font-medium text-sm transition-colors group flex-shrink-0"
              >
                Open the Design Studio
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
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
