import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ChatAssistant } from "@/components/chat/ChatAssistant";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
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
    "Laser engraving studio based in Lagos, serving West Africa. Ready-made engraved products and custom engraving on your own items — metal, wood, crystal, acrylic, and leather.",
  keywords: [
    "laser engraving",
    "metal business cards",
    "crystal awards",
    "wood engraving",
    "custom engraving",
    "Nigeria",
    "Ghana",
    "West Africa",
    "precision engraving",
    "coasters",
    "trophies",
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
      "Laser engraving studio based in Lagos, serving West Africa. Shop products or bring your own items for custom engraving.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Laser Yard - Precision Laser Engraving",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Laser Yard | Precision Laser Engraving",
    description:
      "Laser engraving studio based in Lagos, serving West Africa. Shop products or bring your own items for custom engraving.",
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#F7F5F0" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1A1A24" />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement,c=d.classList,u=navigator.userAgent;function m(){var w=window.innerWidth;if(w<768){c.add('is-mobile')}else{c.remove('is-mobile')}}m();if(/iPhone|iPad|iPod/.test(u)){c.add('is-ios')}window.addEventListener('orientationchange',function(){setTimeout(m,100)})})()`,
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${playfair.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <AnnouncementBar />
          <Header />
          <main className="min-h-[100dvh]">{children}</main>
          <Footer />
          <ChatAssistant />
        </ThemeProvider>
      </body>
    </html>
  );
}
