import { Metadata } from "next";
import { CustomEngravingSection } from "@/components/sections/CustomEngravingSection";
import { CTABanner } from "@/components/sections/CTABanner";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Custom Engraving",
  description:
    "Bring your own items for custom laser engraving. We work with metal, wood, acrylic, leather, glass, and fabric.",
  alternates: { canonical: "/custom-engraving" },
};

export default function CustomEngravingPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: "Custom Laser Engraving",
            description:
              "Bring your own items for precision laser engraving. We work with metal, wood, acrylic, leather, glass, and fabric.",
            url: "/custom-engraving",
          }),
          breadcrumbSchema([
            { name: "Custom Engraving", url: "/custom-engraving" },
          ]),
        ]}
      />
      {/* Spacer for fixed header + announcement bar */}
      <div className="pt-32" />
      <CustomEngravingSection />
      <CTABanner />
    </>
  );
}
