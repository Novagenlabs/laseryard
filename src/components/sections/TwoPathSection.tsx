"use client";

import { ShoppingBag, Paintbrush, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/ScrollReveal";

const paths = [
  {
    title: "Shop Our Products",
    description:
      "Metal business cards, crystal awards, wood boards. In stock, ready to order.",
    href: "/shop",
    icon: ShoppingBag,
    cta: "Browse Products",
  },
  {
    title: "Custom Engraving",
    description:
      "Bring your own items and we'll engrave them. Laptops, phones, leather goods, gifts — if we can laser it, we will.",
    href: "/custom-engraving",
    icon: Paintbrush,
    cta: "Learn More",
  },
];

export function TwoPathSection() {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-12">
          <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
            Two Ways to Work With Us
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            How Can We <span className="text-gradient-gold">Help You?</span>
          </h2>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {paths.map((path) => (
            <StaggerItem key={path.href}>
              <Link
                href={path.href}
                className="group block p-8 sm:p-10 rounded-2xl bg-card border border-border hover:border-gold/30 hover:-translate-y-1 transition-[border-color,transform] duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                  <path.icon className="w-7 h-7 text-gold" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{path.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {path.description}
                </p>
                <span className="inline-flex items-center gap-2 text-gold font-medium">
                  {path.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
