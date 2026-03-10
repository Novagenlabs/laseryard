import { Metadata } from "next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { DesktopBlur } from "@/components/ui/DesktopBlur";
import {
  Upload,
  FileCheck,
  Zap,
  Package,
  FileImage,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "How Laser Yard works - from design submission to delivery. Four steps for all laser engraving projects.",
};

const steps = [
  {
    icon: Upload,
    title: "Submit Your Design",
    description:
      "Send us your design via WhatsApp or email. We accept AI, EPS, PDF (vector), and high-resolution PNG files. Don't have a design? Our team can help create one based on your requirements.",
    details: [
      "Vector files preferred (AI, EPS, PDF)",
      "PNG at minimum 300 DPI",
      "We can help with design if needed",
    ],
  },
  {
    icon: FileCheck,
    title: "Review & Approve",
    description:
      "We'll send you a digital proof showing exactly how your project will look when engraved. Request any adjustments until you're 100% satisfied.",
    details: [
      "Digital mockup within 24 hours",
      "Unlimited revisions",
      "Final approval via WhatsApp",
    ],
  },
  {
    icon: Zap,
    title: "Precision Engraving",
    description:
      "Your project is laser-engraved using industrial-grade equipment. Every piece is individually inspected to ensure perfect quality.",
    details: [
      "5-7 business days standard",
      "Rush options available",
      "Quality inspection on every piece",
    ],
  },
  {
    icon: Package,
    title: "Delivery",
    description:
      "Your finished products are carefully packaged and shipped to your location. Track your order and receive updates via WhatsApp.",
    details: [
      "Lagos: 24-48 hours",
      "Rest of Nigeria: 3-5 days",
      "International: 7-14 days",
    ],
  },
];

const fileFormats = [
  { format: "AI (Adobe Illustrator)", recommended: true },
  { format: "EPS", recommended: true },
  { format: "PDF (Vector)", recommended: true },
  { format: "PNG (300+ DPI)", recommended: false },
  { format: "SVG", recommended: true },
];

const designTips = [
  "Keep text at least 1mm from edges",
  "Use simple, clean fonts for best results",
  "High contrast designs engrave better",
  "Fine details may lose clarity below 0.5mm",
  "QR codes work great on metal surfaces",
];

export default function ProcessPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <DesktopBlur className="absolute top-1/3 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
              How It Works
            </p>
            <h1 className="font-[family-name:var(--font-montserrat)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              From Design to{" "}
              <span className="text-gradient-gold">Delivery</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From metal business cards to custom signage, our streamlined process
              ensures you receive exactly what you envision.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Process Steps */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {steps.map((step, index) => (
              <ScrollReveal key={step.title} delay={index * 0.1}>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div
                    className={`${index % 2 === 1 ? "lg:order-2" : ""}`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center">
                        <step.icon className="w-7 h-7 text-gold" />
                      </div>
                      <div>
                        <p className="text-sm text-gold font-medium">
                          Step {index + 1}
                        </p>
                        <h2 className="text-2xl font-bold">{step.title}</h2>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                          <span className="text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div
                    className={`${
                      index % 2 === 1 ? "lg:order-1" : ""
                    } hidden lg:block`}
                  >
                    <div className="aspect-video rounded-2xl bg-card border border-border flex items-center justify-center">
                      <step.icon className="w-24 h-24 text-gold/20" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* File Formats */}
      <section className="py-16 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <ScrollReveal>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <FileImage className="w-6 h-6 text-gold" />
                </div>
                <h2 className="text-2xl font-bold">Accepted File Formats</h2>
              </div>
              <div className="space-y-3">
                {fileFormats.map((item) => (
                  <div
                    key={item.format}
                    className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
                  >
                    <span>{item.format}</span>
                    {item.recommended && (
                      <span className="px-2 py-1 text-xs font-medium bg-gold/10 text-gold rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-gold" />
                </div>
                <h2 className="text-2xl font-bold">Design Tips</h2>
              </div>
              <div className="space-y-3">
                {designTips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border"
                  >
                    <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{tip}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Expected Timeline
            </h2>
            <p className="text-muted-foreground">
              Standard orders typically complete within 7-10 business days
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { phase: "Design Review", time: "1-2 days" },
              { phase: "Production", time: "5-7 days" },
              { phase: "Quality Check", time: "1 day" },
              { phase: "Shipping", time: "1-5 days" },
            ].map((item, index) => (
              <ScrollReveal key={item.phase} delay={index * 0.1}>
                <div className="text-center p-6 rounded-xl bg-card border border-border">
                  <p className="text-2xl font-bold text-gradient-gold mb-1">
                    {item.time}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.phase}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="p-12 rounded-3xl bg-gradient-to-br from-gold/10 via-card to-card border border-gold/20 text-center">
              <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Send us your design via WhatsApp and we'll get back to you with
                a proof within 24 hours.
              </p>
              <WhatsAppCTA
                buttonText="Send Your Design"
                size="lg"
                variant="gold"
                message="Hi! I'd like to submit my design for laser engraving. How should I send it?"
                trackingLabel="process-page"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
