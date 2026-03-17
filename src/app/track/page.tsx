import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OrderTracker } from "@/components/shipping/OrderTracker";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Track Your Order | Laser Yard",
  description:
    "Track your Laser Yard order in real time. Enter your order number to see delivery status and timeline.",
  alternates: { canonical: "https://laseryard.com/track" },
};

export default function TrackPage() {
  const schemas = [
    breadcrumbSchema([
      { name: "Home", url: SITE_CONFIG.url },
      { name: "Track Order", url: `${SITE_CONFIG.url}/track` },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />

      <section className="pt-40 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <ArrowRight className="w-3 h-3" aria-hidden />
              <span className="text-foreground">Track Order</span>
            </nav>

            <div className="max-w-2xl mb-12">
              <h1 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Track Your Order
              </h1>
              <p className="text-muted-foreground text-lg">
                Enter your order number to see real-time delivery status and
                timeline. You can find your order number in the confirmation
                message we sent via WhatsApp.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <OrderTracker />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
