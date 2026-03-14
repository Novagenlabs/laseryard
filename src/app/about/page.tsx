import { Metadata } from "next";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { Target, Eye, BadgeCheck, Users, MapPin } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Laser Yard is a precision laser engraving studio headquartered in Lagos, serving clients worldwide. Our story, how we work, and what we stand for.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: BadgeCheck,
    title: "Quality First",
    description:
      "We never compromise on materials or craftsmanship. Every piece that leaves our studio meets exacting standards.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description:
      "We work directly with each client. You tell us what you need, we figure out how to make it happen.",
  },
  {
    icon: Target,
    title: "Precision",
    description:
      "Micron-level accuracy in every engraving. We obsess over the details so you don't have to.",
  },
];

const locations = [
  "Lagos, Nigeria",
  "Accra, Ghana",
  "London, UK",
  "New York, US",
  "Dubai, UAE",
  "Johannesburg, SA",
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "About", url: "/about" }])} />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <ScrollReveal>
              <h1 className="font-[family-name:var(--font-montserrat)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Where Precision Meets{" "}
                <span className="font-extrabold">Craftsmanship</span>
              </h1>
              <div className="w-16 h-px bg-border mb-6" />
              <p className="text-muted-foreground text-lg leading-relaxed">
                Laser Yard started because we saw a gap in the market for
                truly high-quality laser engraving. So we built
                the studio ourselves. Metal business cards, crystal awards,
                custom signage, promotional products. If a laser can mark it,
                we do it, for clients around the world.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <ScrollReveal>
              <div className="p-8 rounded-2xl bg-card border border-border h-full">
                <div className="w-14 h-14 rounded-xl bg-foreground/5 dark:bg-background/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-foreground/70" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <div className="w-12 h-px bg-border mb-4" />
                <p className="text-muted-foreground leading-relaxed">
                  To be the studio people think of first when
                  they need something engraved. Business cards, signage,
                  awards, promotional items. We use industrial-grade
                  equipment and we sweat the small stuff.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="p-8 rounded-2xl bg-card border border-border h-full">
                <div className="w-14 h-14 rounded-xl bg-foreground/5 dark:bg-background/10 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-foreground/70" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <div className="w-12 h-px bg-border mb-4" />
                <p className="text-muted-foreground leading-relaxed">
                  To make laser engraving accessible to every business,
                  anywhere. Whether you&apos;re a startup in Lagos or a corporation
                  in London, you should be able to get your stuff engraved
                  properly, fast, and at a fair price.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Why Laser Yard */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Why <span className="font-extrabold">Laser Yard?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              When precision matters, businesses worldwide trust us to
              deliver.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="scale">
            <div className="rounded-2xl sm:rounded-3xl bg-zinc-950 text-white p-8 sm:p-12 lg:p-16 overflow-hidden safari-fix-overflow">
              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[
                  {
                    stat: "500+",
                    label: "Projects Completed",
                    description: "Business cards, signage, and custom work",
                  },
                  {
                    stat: "5+",
                    label: "Materials",
                    description: "Metal, wood, acrylic, leather, glass",
                  },
                  {
                    stat: "20+",
                    label: "Countries Served",
                    description: "Clients across Africa, Europe, the Americas & beyond",
                  },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-5xl font-extrabold mb-2">
                      {item.stat}
                    </p>
                    <p className="font-semibold mb-1">{item.label}</p>
                    <p className="text-sm text-white/60">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Our <span className="font-extrabold">Values</span>
            </h2>
          </ScrollReveal>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <div className="group">
                  <div className="w-12 h-12 rounded-xl bg-foreground/5 dark:bg-background/10 flex items-center justify-center mb-5">
                    <value.icon className="w-6 h-6 text-foreground/70" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <div className="w-12 h-px bg-border mb-4" />
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <div className="w-12 h-12 rounded-xl bg-foreground/5 dark:bg-background/10 flex items-center justify-center mb-4 mx-auto">
              <MapPin className="w-6 h-6 text-foreground/70" />
            </div>
            <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Serving Clients <span className="font-extrabold">Worldwide</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Headquartered in Lagos, Nigeria, we deliver precision laser engraving
              services to clients around the globe.
            </p>
          </ScrollReveal>

          <div className="flex flex-wrap justify-center gap-4">
            {locations.map((location, index) => (
              <ScrollReveal key={location} delay={index * 0.05}>
                <div className="px-6 py-3 rounded-full bg-card border border-border">
                  {location}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Promise CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="scale">
            <div className="rounded-2xl sm:rounded-3xl bg-secondary dark:bg-card overflow-hidden safari-fix-overflow px-6 py-12 sm:px-16 sm:py-20 text-center">
              <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Our Quality <span className="font-extrabold">Promise</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                We use industrial-grade lasers calibrated for micron-level
                accuracy. Every piece is inspected individually before it
                ships. If it doesn&apos;t meet our standard, it doesn&apos;t
                leave the studio.
              </p>
              <WhatsAppCTA
                buttonText="Start Your Project"
                size="lg"
                message="Hi! I'd like to learn more about Laser Yard's laser engraving services."
                trackingLabel="about-page"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
