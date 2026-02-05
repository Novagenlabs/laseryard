import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/whatsapp/WhatsAppFloating";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Laser Yard | Precision Laser Engraving",
    template: "%s | Laser Yard",
  },
  description:
    "West Africa's premier laser engraving studio. From metal business cards to custom signage, we bring your vision to life with micron-level precision.",
  keywords: [
    "laser engraving",
    "metal business cards",
    "custom engraving",
    "Nigeria",
    "Ghana",
    "West Africa",
    "precision engraving",
    "signage",
  ],
  authors: [{ name: "Laser Yard" }],
  creator: "Laser Yard",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://laseryard.com",
    siteName: "Laser Yard",
    title: "Precision Laser Engraving",
    description:
      "West Africa's premier laser engraving studio. From business cards to custom signage.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Laser Yard - Premium Metal Business Cards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Laser Yard | Precision Laser Engraving",
    description:
      "West Africa's premier laser engraving studio. From business cards to custom signage.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${dmSans.variable} ${playfair.variable} font-sans antialiased`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppFloating />
      </body>
    </html>
  );
}
