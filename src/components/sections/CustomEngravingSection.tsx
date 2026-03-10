"use client";

import {
  Layers,
  TreePine,
  Square,
  Briefcase,
  GlassWater,
  Shirt,
} from "lucide-react";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import {
  CUSTOM_ENGRAVING_MATERIALS,
  CUSTOM_ENGRAVING_STEPS,
} from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  TreePine,
  Square,
  Briefcase,
  GlassWater,
  Shirt,
};

export function CustomEngravingSection() {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
            Custom Engraving
          </p>
          <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Bring Your Own{" "}
            <span className="text-gradient-gold">Items</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Got something you want engraved? We work with a wide range of
            materials. Bring us your item and we&apos;ll make it uniquely yours.
          </p>
        </ScrollReveal>

        {/* Materials Grid */}
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {CUSTOM_ENGRAVING_MATERIALS.map((material) => {
            const Icon = iconMap[material.icon];
            return (
              <StaggerItem key={material.name}>
                <div className="p-4 sm:p-6 rounded-xl bg-card border border-border hover:border-gold/30 hover:-translate-y-1 text-center transition-[border-color,transform] duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-gold" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{material.name}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {material.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* How It Works Mini Steps */}
        <ScrollReveal className="mb-12">
          <h3 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl font-bold tracking-tight text-center mb-10">
            How Custom Engraving Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CUSTOM_ENGRAVING_STEPS.map((step) => (
              <div
                key={step.step}
                className="relative p-6 rounded-xl bg-card border border-border"
              >
                <span className="text-3xl font-bold text-gold/20 mb-2 block">
                  0{step.step}
                </span>
                <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal className="text-center">
          <p className="text-muted-foreground mb-6">
            Have an item you&apos;d like engraved? Let&apos;s talk about it.
          </p>
          <WhatsAppCTA
            buttonText="Discuss Custom Engraving"
            size="lg"
            variant="gold"
            message="Hi! I'd like to get custom laser engraving on my own item. Can we discuss the details?"
            trackingLabel="custom-engraving-section"
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
