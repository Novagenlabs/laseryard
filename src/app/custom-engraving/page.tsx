import { Metadata } from "next";
import { CustomEngravingSection } from "@/components/sections/CustomEngravingSection";
import { CTABanner } from "@/components/sections/CTABanner";

export const metadata: Metadata = {
  title: "Custom Engraving",
  description:
    "Bring your own items for custom laser engraving. We work with metal, wood, acrylic, leather, glass, and fabric.",
};

export default function CustomEngravingPage() {
  return (
    <>
      {/* Spacer for fixed header + announcement bar */}
      <div className="pt-32" />
      <CustomEngravingSection />
      <CTABanner />
    </>
  );
}
