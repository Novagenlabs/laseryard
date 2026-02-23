"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/ScrollReveal";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { ProductIllustration } from "@/components/product-illustrations/ProductIllustration";

export function ProductShowcase() {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="text-center mb-12 sm:mb-16">
          <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
            Our Products
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Ready-Made <span className="text-gradient-gold">Products</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            In-stock products, ready to order. Need something custom? We do that too.
          </p>
        </ScrollReveal>

        {/* Product Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCT_CATEGORIES.map((product) => (
            <StaggerItem key={product.slug}>
              <Link
                href={product.href}
                className="group relative block p-6 sm:p-8 rounded-2xl bg-card border border-border hover:border-gold/30 hover:-translate-y-1 transition-[border-color,transform] duration-300"
              >
                <div className="mb-5 rounded-xl bg-background/50 border border-border/50 p-6 flex items-center justify-center overflow-hidden safari-fix-overflow">
                  <ProductIllustration type={product.slug as "metal-business-cards" | "crystal-awards" | "wood-engraving"} className="w-full max-h-36" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{product.name}</h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  {product.description}
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-gold/10 text-gold border border-gold/20"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <span className="inline-flex items-center gap-2 text-gold font-medium text-sm">
                  View Details
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>

                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
