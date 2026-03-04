import { Metadata } from "next";
import { UnforgettableLanding } from "./UnforgettableLanding";

export const metadata: Metadata = {
  title: "BE UNFORGETTABLE | Metal Business Cards",
  description:
    "Premium matte-black metal business cards with laser-cut engraving. Credit-card sized. Impossible to throw away. Order yours today.",
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
  return <UnforgettableLanding />;
}
