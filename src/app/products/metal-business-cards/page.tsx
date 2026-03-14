import { Metadata } from "next";
import { ProductPage } from "./ProductPage";
import { JsonLd } from "@/components/JsonLd";
import {
  productSchema,
  breadcrumbSchema,
  faqSchema,
} from "@/lib/schema";
import { FAQ_ITEMS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Premium Metal Business Cards",
  description:
    "Premium laser-engraved metal business cards in aluminum and stainless steel. 0.4mm and 0.8mm thickness, matte black, glossy, and brushed finishes. Min. 30 cards.",
  alternates: { canonical: "/products/metal-business-cards" },
};

export default function MetalBusinessCardsPage() {
  return (
    <>
      <JsonLd
        data={[
          productSchema({
            name: "Premium Metal Business Cards",
            description:
              "Laser-engraved aluminum business cards. Heavy, cold to the touch, and impossible to throw away. Available in 0.4mm and 0.8mm thickness with matte black, glossy, and brushed finishes.",
            image: "/og-image.jpg",
            material: "Aluminum",
            url: "/products/metal-business-cards",
          }),
          breadcrumbSchema([
            { name: "Metal Business Cards", url: "/products/metal-business-cards" },
          ]),
          faqSchema(
            FAQ_ITEMS.map((item) => ({
              question: item.question,
              answer: item.answer,
            }))
          ),
        ]}
      />
      <ProductPage />
    </>
  );
}
