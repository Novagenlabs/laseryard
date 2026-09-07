import fs from "fs";
import path from "path";
import { Metadata } from "next";
import { ProductPage, type ColorPhotos } from "./ProductPage";
import { JsonLd } from "@/components/JsonLd";
import {
  productSchema,
  breadcrumbSchema,
  faqSchema,
} from "@/lib/schema";
import { CARD_COLORS, FAQ_ITEMS } from "@/lib/constants";

// Per-color product photos are picked up from the filesystem at build time:
// public/images/products/colors/<id>.webp — the fanned-stack shot that shows
// the color and the 0.8mm thickness. A missing file falls back to the
// generated preview — drop a file in, redeploy, done.
function findColorPhotos(): ColorPhotos {
  const dir = path.join(process.cwd(), "public", "images", "products", "colors");
  const photos: ColorPhotos = {};
  for (const color of CARD_COLORS) {
    if (fs.existsSync(path.join(dir, `${color.id}.webp`))) {
      photos[color.id] = `/images/products/colors/${color.id}.webp`;
    }
  }
  return photos;
}

export const metadata: Metadata = {
  title: "Premium Metal Business Cards",
  description:
    "Premium laser-engraved metal business cards in 0.8mm anodized aluminum. 11 colors including matte black, silver, and gold. From $250 for 15 cards, worldwide shipping included.",
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
              "Laser-engraved 0.8mm anodized aluminum business cards. Heavy, cold to the touch, and impossible to throw away. Available in 11 colors with worldwide shipping included.",
            image: "/og-image.jpg",
            material: "Anodized aluminum",
            url: "/products/metal-business-cards",
            metalCards: true,
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
      <ProductPage colorPhotos={findColorPhotos()} />
    </>
  );
}
