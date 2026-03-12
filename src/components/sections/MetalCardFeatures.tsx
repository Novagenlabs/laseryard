"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const features = [
  { title: "Matte black, glossy & brushed steel", subtitle: "Three finishes to match your style." },
  { title: "Aluminum & stainless steel", subtitle: "Real metal you can feel." },
  { title: "Optional NFC chip", subtitle: "Modern, not mandatory." },
  { title: "Fast production", subtitle: "5-7 business days standard." },
  { title: "Laser-engraved", subtitle: "Consistent quality every time." },
  { title: "Ships worldwide", subtitle: "Free shipping on select orders." },
];

export function MetalCardFeatures() {
  return (
    <section className="py-16 sm:py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="scale">
          <div className="rounded-2xl sm:rounded-3xl bg-secondary dark:bg-card overflow-hidden safari-fix-overflow">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left - Card Image */}
              <div className="relative p-8 sm:p-12 lg:p-16 flex items-center justify-center">
                <div className="relative w-full max-w-lg">
                  <img
                    src="/images/products/blac_card_product_photo_whitebackground.png"
                    alt="Matte black laser-engraved metal business card"
                    className="w-full rounded-xl shadow-xl"
                  />
                  <img
                    src="/images/products/card_whitebackground_product_photo_1.png"
                    alt="Brushed stainless steel metal business card"
                    className="absolute -bottom-6 -left-4 w-3/5 rounded-lg shadow-lg"
                  />
                </div>
              </div>

              {/* Right - Features */}
              <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                  Custom <span className="font-extrabold">Metal Business Cards,</span>
                  <br />Made Simple
                </h2>
                <div className="w-16 h-px bg-border mb-6" />
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Make a first impression that feels confident, not overdone.
                  Our metal business cards are built to stand out. Fast, simple,
                  and done right from start to finish.
                </p>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  {features.map((feature) => (
                    <div key={feature.title} className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-foreground/60" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{feature.title}</p>
                        <p className="text-muted-foreground text-sm">{feature.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/products/metal-business-cards"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background font-medium text-base hover:opacity-90 transition-opacity self-start"
                >
                  Design Your Card
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
