import { Metadata } from "next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { ProductIllustration } from "@/components/product-illustrations/ProductIllustration";

export const metadata: Metadata = {
  title: "Wood Boards & Coasters",
  description:
    "Laser-engraved wooden boards and coasters. Popular with restaurants, corporate gifting, and home decor.",
};

export default function WoodEngravingPage() {
  return (
    <>
      {/* Spacer for fixed header */}
      <div className="pt-32" />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl">
              <div className="rounded-2xl bg-card border border-border p-8 max-w-md mb-8">
                <ProductIllustration type="wood-engraving" className="w-full" />
              </div>
              <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
                Our Products
              </p>
              <h1 className="font-[family-name:var(--font-montserrat)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Wood Boards &{" "}
                <span className="text-gradient-gold">Coasters</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Laser-engraved wooden boards and coasters for restaurants,
                corporate gifts, and home decor. The laser brings out the
                grain and gives each piece a clean, handcrafted look.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mb-10">
                {["Natural Wood", "Detailed Engraving", "Custom Designs"].map(
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
                message="Hi! I'm interested in your wood boards and coasters. Can you tell me more about options and pricing?"
                trackingLabel="wood-engraving"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
