"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { FAQ_ITEMS } from "@/lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQAccordion() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Header */}
          <ScrollReveal className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              FAQs
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Got questions? We&apos;ve got answers. Everything you need to know
              about the cards themselves.
            </p>

            <Link
              href="/products/metal-business-cards"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-foreground font-medium text-sm hover:border-gold transition-colors"
            >
              Design Your Card
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
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
