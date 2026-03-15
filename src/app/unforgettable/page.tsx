import { Metadata } from "next";
import { UnforgettableLanding } from "./UnforgettableLanding";
import { JsonLd } from "@/components/JsonLd";
import { productSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "BE UNFORGETTABLE | Metal Business Cards",
  description:
    "Premium matte-black metal business cards with laser-cut engraving. Credit-card sized. Impossible to throw away. Order yours today.",
  alternates: { canonical: "/unforgettable" },
  openGraph: {
    title: "BE UNFORGETTABLE | Laser Yard Metal Business Cards",
    description:
      "Premium matte-black metal business cards with laser-cut engraving. Credit-card sized. Impossible to throw away.",
    url: "https://laseryard.com/unforgettable",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Laser Yard Metal Business Cards",
      },
    ],
  },
};

export default function UnforgettablePage() {
  return (
    <>
      <JsonLd
        data={[
          productSchema({
            name: "BE UNFORGETTABLE Metal Business Cards",
            description:
              "Premium matte-black metal business cards with laser-cut engraving. Credit-card sized. Impossible to throw away.",
            image: "/og-image.jpg",
            material: "Aluminum",
            url: "/unforgettable",
          }),
          breadcrumbSchema([
            { name: "BE UNFORGETTABLE", url: "/unforgettable" },
          ]),
        ]}
      />
      <UnforgettableLanding />
    </>
  );
}
