import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "../globals.css";
import "./gmbc.css";

// Root layout for the Get Metal Business Cards sub-brand. Served on
// getmetalbusinesscards.laseryard.com via src/proxy.ts. Deliberately carries
// none of the parent company's chrome, analytics or copy.

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const SITE = "https://getmetalbusinesscards.laseryard.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Get Metal Business Cards | Laser-engraved aluminum cards",
    template: "%s | Get Metal Business Cards",
  },
  description:
    "Laser-engraved metal business cards in solid 0.8 mm anodized aluminum. Eleven finishes, packs from 15 cards, delivered worldwide. Quotes in minutes on WhatsApp.",
  alternates: { canonical: SITE },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Get Metal Business Cards",
    title: "The business card people keep.",
    description:
      "Solid 0.8 mm anodized aluminum, laser engraved with your design. Eleven finishes. Packs from 15 cards, delivered worldwide.",
    images: [{ url: "/images/gmbc/hero-handoff-black-1536.png", width: 1536, height: 1024 }],
  },
  robots: { index: true, follow: true },
};

export default function GmbcLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable} data-brand="gmbc" suppressHydrationWarning>
      <body className="gmbc min-h-screen antialiased">{children}</body>
    </html>
  );
}
