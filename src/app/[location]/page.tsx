import { Metadata } from "next";
import { notFound } from "next/navigation";
import { COUNTRIES, WHATSAPP_NUMBER, SITE_CONFIG } from "@/lib/constants";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, productSchema } from "@/lib/schema";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import {
  ArrowRight,
  Clock,
  CreditCard,
  Globe,
  Layers,
  Package,
  Shield,
  Truck,
} from "lucide-react";
import Link from "next/link";

function getCountry(slug: string) {
  return COUNTRIES.find((c) => c.slug === slug);
}

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ location: c.slug }));
}

type Props = {
  params: Promise<{ location: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  const country = getCountry(location);
  if (!country) return {};

  const title = `Metal Business Cards in ${country.name} | Laser Yard`;
  const description = `Premium laser-engraved metal business cards delivered to ${country.name}. Serving ${country.cities.join(", ")} and more. 11 anodized colors. From $250 for 15 cards, shipping included.`;

  return {
    title,
    description,
    alternates: { canonical: `https://laseryard.com/${country.slug}` },
    openGraph: {
      title,
      description,
      url: `https://laseryard.com/${country.slug}`,
      type: "website",
    },
  };
}

const SHIPPING_INFO: Record<
  string,
  { time: string; method: string; note: string }
> = {
  africa: {
    time: "3-7 business days across the continent",
    method: "Tracked courier, door-to-door",
    note: "Customs-cleared delivery — rush options available on request",
  },
  nigeria: {
    time: "3-5 business days nationwide",
    method: "Local courier and dispatch riders",
    note: "Rush delivery available on request",
  },
  ghana: {
    time: "5-7 business days",
    method: "International courier",
    note: "Customs-cleared delivery to your door",
  },
  "united-kingdom": {
    time: "7-10 business days",
    method: "DHL / FedEx tracked international shipping",
    note: "VAT and duties handled at delivery",
  },
  "united-states": {
    time: "7-14 business days",
    method: "DHL / FedEx tracked international shipping",
    note: "Tracked door-to-door delivery",
  },
  uae: {
    time: "5-7 business days",
    method: "DHL Express",
    note: "Fast DHL Express delivery to your door",
  },
  eu: {
    time: "7-10 business days",
    method: "DHL / FedEx tracked international shipping",
    note: "Delivered across all EU member states",
  },
};

// Card packs are paid by card at the secure checkout everywhere; custom
// projects get their payment options with the quote.
const PAYMENT_METHODS = [
  "Secure card checkout on laseryard.com (all major cards)",
  "Priced in USD — worldwide shipping included",
  "Custom projects: payment options shared with your quote",
];
const PAYMENT_INFO: Record<string, string[]> = Object.fromEntries(
  ["africa", "nigeria", "ghana", "united-kingdom", "united-states", "uae", "eu"].map(
    (slug) => [slug, PAYMENT_METHODS]
  )
);

export default async function LocationPage({ params }: Props) {
  const { location } = await params;
  const country = getCountry(location);
  if (!country) notFound();

  const shipping = SHIPPING_INFO[country.slug];
  const payments = PAYMENT_INFO[country.slug];

  const schemas = [
    productSchema({
      name: `Metal Business Cards - ${country.name}`,
      description: `Premium laser-engraved metal business cards delivered to ${country.name}. 0.8mm anodized aluminum in 11 matte colors, from $250 for 15 cards with shipping included.`,
      image: `${SITE_CONFIG.url}/og-image.jpg`,
      url: `${SITE_CONFIG.url}/${country.slug}`,
      metalCards: true,
    }),
    breadcrumbSchema([
      { name: "Home", url: SITE_CONFIG.url },
      {
        name: `Metal Business Cards in ${country.name}`,
        url: `${SITE_CONFIG.url}/${country.slug}`,
      },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />

      {/* Hero */}
      <section className="pt-40 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <ArrowRight className="w-3 h-3" aria-hidden />
              <span className="text-foreground">
                Metal Business Cards in {country.name}
              </span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
                Metal Business Cards in {country.name}
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed mb-4">
                Premium laser-engraved 0.8mm anodized aluminum business cards
                in 11 colors, delivered to {country.name} with shipping
                included. Heavy, cold to the touch, and impossible to throw
                away — from $250 for 15 cards.
              </p>
              <p className="text-muted-foreground">
                We serve {country.cities.join(", ")}, and everywhere in between.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <WhatsAppCTA
                buttonText="Get a Quote"
                message={`Hi! I'm in ${country.name} and interested in ordering metal business cards. Can you help me with pricing and shipping?`}
                trackingLabel={`location-${country.slug}`}
              />
              <Link
                href="/products/metal-business-cards"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border text-foreground font-medium text-sm hover:border-foreground/30 transition-colors group"
              >
                Order Your Cards
                <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl font-bold tracking-tight mb-10">
              What You Get
            </h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Layers,
                title: "Premium Anodized Aluminum",
                desc: "0.8mm thick, available in 11 colors",
              },
              {
                icon: Shield,
                title: "Built to Last",
                desc: "Won't fade, rust, or bend. Keeps its finish for years",
              },
              {
                icon: CreditCard,
                title: "Wallet-Ready Size",
                desc: "Standard 86mm x 54mm, fits any card holder",
              },
              {
                icon: Package,
                title: `Ships to ${country.name}`,
                desc: shipping.time,
              },
            ].map((item) => (
              <ScrollReveal key={item.title}>
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-foreground/5 dark:bg-background/10 flex items-center justify-center mb-4">
                    <item.icon
                      className="w-7 h-7 text-foreground/70"
                      aria-hidden
                    />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping & Payment */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Shipping */}
            <ScrollReveal>
              <div className="p-8 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-foreground/70" />
                  </div>
                  <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-bold">
                    Shipping to {country.name}
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Delivery Time
                    </p>
                    <p className="font-semibold">{shipping.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Method</p>
                    <p className="font-semibold">{shipping.method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Note</p>
                    <p className="text-sm">{shipping.note}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Payment */}
            <ScrollReveal delay={0.15}>
              <div className="p-8 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-foreground/70" />
                  </div>
                  <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-bold">
                    Payment Options
                  </h2>
                </div>
                <ul className="space-y-3">
                  {payments.map((method) => (
                    <li
                      key={method}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-1.5 shrink-0" />
                      {method}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-muted-foreground">
                  Card packs are paid in full at checkout, priced in USD with
                  shipping to {country.name} included. Custom projects: 50%
                  deposit to start, balance before shipping.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl font-bold tracking-tight mb-10">
              How to Order from {country.name}
            </h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Order & Send Your Design",
                desc: "Pick your color and quantity and check out online, then send your logo and details to sales@laseryard.com — or let our team design it.",
              },
              {
                step: "02",
                title: "Approve the Proof",
                desc: "We send a digital proof within 1-3 business days. Unlimited revisions until you're happy.",
              },
              {
                step: "03",
                title: "We Engrave",
                desc: "Production takes 10-14 business days after you approve your proof. Rush production (2-3 business days) available for an extra fee.",
              },
              {
                step: "04",
                title: `Delivered to ${country.name}`,
                desc: `${shipping.method}. ${shipping.time}. Tracked to your door.`,
              },
            ].map((item) => (
              <ScrollReveal key={item.step}>
                <div>
                  <span className="text-3xl font-extrabold text-foreground/10">
                    {item.step}
                  </span>
                  <h3 className="font-semibold mt-2 mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Cities We Serve in {country.name}
            </h2>
            <p className="text-muted-foreground mb-10 max-w-2xl">
              We deliver metal business cards to every major city in{" "}
              {country.name}. Here are some of the cities our clients order
              from most.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {country.cities.map((city) => (
              <ScrollReveal key={city}>
                <div className="p-4 rounded-xl bg-card border border-border text-center">
                  <Globe
                    className="w-5 h-5 text-foreground/40 mx-auto mb-2"
                    aria-hidden
                  />
                  <p className="font-semibold text-sm">{city}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {country.name}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-card" />
              <div className="relative px-6 py-12 sm:px-16 sm:py-20 text-center">
                <h2 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                  Ready to Stand Out in {country.name}?
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-8">
                  Join hundreds of professionals in {country.cities[0]} and
                  beyond who've switched to metal business cards.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <WhatsAppCTA
                    buttonText="Get Started"
                    message={`Hi! I'm in ${country.name} and want to order metal business cards. Can you help?`}
                    trackingLabel={`location-${country.slug}-cta`}
                  />
                  <Link
                    href="/products/metal-business-cards"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border font-medium text-sm hover:border-foreground/30 transition-colors group"
                  >
                    View Product Details
                    <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <Clock className="w-4 h-4 text-muted-foreground inline mt-8" />
                <p className="text-sm text-muted-foreground mt-2">
                  We reply within the hour during business hours
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
