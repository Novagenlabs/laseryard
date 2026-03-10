import { Metadata } from "next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { ProductIllustration } from "@/components/product-illustrations/ProductIllustration";

export const metadata: Metadata = {
  title: "Crystal Awards",
  description:
    "3D laser-engraved crystal trophies and awards. Used for corporate recognition, team events, and milestones.",
};

export default function CrystalAwardsPage() {
  return (
    <>
      {/* Spacer for fixed header */}
      <div className="pt-32" />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl">
              <div className="rounded-2xl bg-card border border-border p-8 max-w-md mb-8">
                <ProductIllustration type="crystal-awards" className="w-full" />
              </div>
              <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
                Our Products
              </p>
              <h1 className="font-[family-name:var(--font-montserrat)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Crystal <span className="text-gradient-gold">Awards</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                3D laser-engraved crystal trophies and awards for corporate
                recognition, team events, and milestones. Each piece is
                engraved to capture every detail of your design.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mb-10">
                {["3D Engraving", "Multiple Shapes", "Custom Text & Logos"].map(
                  (feature) => (
                    <div
                      key={feature}
                      className="p-4 rounded-xl bg-card border border-border text-center"
                    >
                      <p className="text-sm font-semibold">{feature}</p>
                    </div>
                  )
                )}
              </div>

              <WhatsAppCTA
                buttonText="Get a Quote"
                size="lg"
                message="Hi! I'm interested in your crystal awards. Can you tell me more about options and pricing?"
                trackingLabel="crystal-awards"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
