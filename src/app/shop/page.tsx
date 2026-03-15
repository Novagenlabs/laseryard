import { Metadata } from "next";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { CTABanner } from "@/components/sections/CTABanner";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Laser-engraved products ready to order. Metal business cards, crystal awards, wood boards and coasters.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Shop", url: "/shop" }]),
          itemListSchema([
            {
              name: "Metal Business Cards",
              url: "/products/metal-business-cards",
              position: 1,
            },
            {
              name: "Crystal Awards",
              url: "/products/crystal-awards",
              position: 2,
            },
            {
              name: "Wood Boards & Coasters",
              url: "/products/wood-engraving",
              position: 3,
            },
          ]),
        ]}
      />
      {/* Spacer for fixed header */}
      <div className="pt-32" />
      <ProductShowcase />
      <CTABanner />
    </>
  );
}
