import { Metadata } from "next";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { CTABanner } from "@/components/sections/CTABanner";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Laser-engraved products ready to order. Metal business cards, crystal awards, wood boards and coasters.",
};

export default function ShopPage() {
  return (
    <>
      {/* Spacer for fixed header */}
      <div className="pt-32" />
      <ProductShowcase />
      <CTABanner />
    </>
  );
}
