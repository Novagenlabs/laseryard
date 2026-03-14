import { Metadata } from "next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import {
  Upload,
  FileCheck,
  Zap,
  Package,
  FileImage,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Check,
} from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { howToSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "How to order from Laser Yard: submit your design, approve the proof, we engrave, and deliver worldwide. 10-14 business day production.",
  alternates: { canonical: "/process" },
};

const steps = [
  {
    number: "01",
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
    number: "02",
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
    number: "03",
    icon: Zap,
    title: "Precision Engraving",
    description:
      "Your project is laser-engraved using industrial-grade equipment. Every piece is individually inspected to ensure perfect quality.",
    details: [
      "10-14 business days standard",
      "Can be ready in as little as 5-7 days",
      "Quality inspection on every piece",
    ],
  },
  {
    number: "04",
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
      <JsonLd
        data={[
          howToSchema({
            name: "How to Order Laser Engraving from Laser Yard",
            description:
              "Submit your design, approve the proof, we engrave with precision equipment, and deliver worldwide.",
            steps: [
              {
                name: "Submit Your Design",
                text: "Send your design via WhatsApp or email. We accept AI, EPS, PDF (vector), SVG, and high-resolution PNG files. Our team can also help create a design.",
              },
              {
                name: "Review & Approve",
                text: "We send a digital proof showing exactly how your project will look. Request unlimited revisions until satisfied.",
              },
              {
                name: "Precision Engraving",
                text: "Your project is laser-engraved using industrial-grade equipment. Every piece is individually inspected. Standard production is 10-14 business days.",
              },
              {
                name: "Delivery",
                text: "Finished products are carefully packaged and shipped. Lagos: 24-48 hours, Nigeria: 3-5 days, International: 7-14 days.",
              },
            ],
          }),
          breadcrumbSchema([{ name: "How It Works", url: "/process" }]),
        ]}
      />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h1 className="font-[family-name:var(--font-montserrat)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              From Design to <span className="font-extrabold">Delivery</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From metal business cards to custom signage, our streamlined process
              ensures you receive exactly what you envision.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Process Steps - Dark Card */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="scale">
            <div className="rounded-2xl sm:rounded-3xl bg-zinc-950 text-white p-8 sm:p-12 lg:p-16 overflow-hidden safari-fix-overflow">
              <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16">
                {/* Left - Header */}
                <div>
                  <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                    How It <span className="font-extrabold">Works</span>
                  </h2>
                  <p className="text-white/60 text-lg leading-relaxed mb-8">
                    Four steps from your design file to a finished product in your
                    hands. We keep you updated at every stage.
                  </p>
                  <Link
                    href="/products/metal-business-cards"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-zinc-950 font-medium text-base hover:opacity-90 transition-opacity"
                  >
                    Design Your Card
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Right - Steps */}
                <div className="space-y-0">
                  {steps.map((step, i) => (
                    <div
                      key={step.number}
                      className={`py-6 ${i !== steps.length - 1 ? "border-b border-white/10" : ""}`}
                    >
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">
                        <span className="text-gold mr-3">{step.number}</span>
                        {step.title}
                      </h3>
                      <p className="text-white/60 leading-relaxed pl-10 mb-3">
                        {step.description}
                      </p>
                      <ul className="pl-10 space-y-1.5">
                        {step.details.map((detail, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm">
                            <Check className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                            <span className="text-white/50">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* File Formats & Design Tips */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <ScrollReveal>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-foreground/5 dark:bg-background/10 flex items-center justify-center">
                  <FileImage className="w-6 h-6 text-foreground/70" />
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
                      <span className="px-2 py-1 text-xs font-medium bg-foreground/5 dark:bg-background/10 text-foreground/70 rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-foreground/5 dark:bg-background/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-foreground/70" />
                </div>
                <h2 className="text-2xl font-bold">Design Tips</h2>
              </div>
              <div className="space-y-3">
                {designTips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border"
                  >
                    <CheckCircle className="w-5 h-5 text-foreground/50 flex-shrink-0 mt-0.5" />
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
              Expected <span className="font-extrabold">Timeline</span>
            </h2>
            <p className="text-muted-foreground">
              Standard orders typically complete within 12-18 business days
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { phase: "Design Review", time: "1-2 days" },
              { phase: "Production", time: "10-14 days" },
              { phase: "Quality Check", time: "1 day" },
              { phase: "Shipping", time: "1-5 days" },
            ].map((item, index) => (
              <ScrollReveal key={item.phase} delay={index * 0.1}>
                <div className="text-center p-6 rounded-xl bg-card border border-border">
                  <p className="text-2xl font-extrabold mb-1">
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
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="scale">
            <div className="rounded-2xl sm:rounded-3xl bg-secondary dark:bg-card overflow-hidden safari-fix-overflow px-6 py-12 sm:px-16 sm:py-20 text-center">
              <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Ready to Get <span className="font-extrabold">Started?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Send us your design via WhatsApp and we&apos;ll get back to you with
                a proof within 24 hours.
              </p>
              <WhatsAppCTA
                buttonText="Send Your Design"
                size="lg"
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
