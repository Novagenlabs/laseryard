"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { FAQ_ITEMS } from "@/lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";

export function FAQAccordion() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-background to-background" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Header */}
          <ScrollReveal className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
              FAQ
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Questions?
              <br />
              <span className="text-gradient-gold">We've Got Answers</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Common questions about pricing, materials, and turnaround.
              Can&apos;t find yours? Chat with us.
            </p>

            <WhatsAppCTA
              buttonText="Ask a Question"
              message="Hi! I have a question about your laser engraving services..."
              trackingLabel="faq"
            />
          </ScrollReveal>

          {/* Accordion */}
          <ScrollReveal delay={0.2}>
            <Accordion type="single" collapsible className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-gold/30 transition-colors"
                >
                  <AccordionTrigger className="text-left text-base hover:no-underline hover:text-gold transition-colors py-6">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
