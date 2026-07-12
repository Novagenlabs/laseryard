import { Metadata } from "next";
import { OrderDetails, TrackSearch } from "@/components/shipping/OrderTracker";
import { OrderTrackerPreview } from "@/components/shipping/OrderTrackerPreview";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Track Your Order | Laser Yard",
  description:
    "Track your Laser Yard order in real time. Enter your order number to see order status and timeline.",
  alternates: { canonical: "https://laseryard.com/track" },
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const orderNumber = order?.trim() || undefined;

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
            {process.env.NODE_ENV === "development" ? (
              <OrderTrackerPreview orderParam={orderNumber} />
            ) : orderNumber ? (
              <OrderDetails trackingNumber={orderNumber} />
            ) : (
              <TrackSearch />
            )}
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
