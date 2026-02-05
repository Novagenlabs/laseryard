import { Metadata } from "next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { Target, Eye, Gem, Users, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Laser Yard - West Africa's premier laser engraving studio. Our story, mission, and commitment to precision craftsmanship.",
};

const values = [
  {
    icon: Gem,
    title: "Quality First",
    description:
      "We never compromise on materials or craftsmanship. Every piece that leaves our studio meets exacting standards.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description:
      "Your success is our success. We work closely with each client to ensure their vision becomes reality.",
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
  "Lome, Togo",
  "Cotonou, Benin",
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <ScrollReveal>
              <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
                Our Story
              </p>
              <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Where Precision Meets{" "}
                <span className="text-gradient-gold">Craftsmanship</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Laser Yard was born from a passion for precision and a vision to
                bring world-class laser engraving to West Africa. From metal
                business cards to custom signage, architectural elements to
                promotional products — we turn your ideas into tangible reality.
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
                <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-gold" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To be West Africa's go-to destination for precision laser
                  engraving. Whether you're creating premium business cards,
                  custom signage, or unique promotional items — we combine
                  cutting-edge technology with meticulous craftsmanship to bring
                  your vision to life.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="p-8 rounded-2xl bg-card border border-border h-full">
                <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-gold" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To become the region's most trusted name in laser engraving.
                  We envision a future where every business, from startups to
                  multinationals, knows that when it comes to precision
                  engraving — you come to Laser Yard.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Why Laser Yard */}
      <section className="py-16 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Why Laser Yard?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              When precision matters, businesses across West Africa trust us to
              deliver.
            </p>
          </ScrollReveal>

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
                stat: "4",
                label: "Countries Served",
                description: "Nigeria, Ghana, Togo, Benin & beyond",
              },
            ].map((item, index) => (
              <ScrollReveal key={item.label} delay={index * 0.1}>
                <div className="text-center">
                  <p className="text-5xl font-bold text-gradient-gold mb-2">
                    {item.stat}
                  </p>
                  <p className="font-semibold mb-1">{item.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Our Values
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <ScrollReveal key={value.title} delay={index * 0.1}>
                <div className="p-8 rounded-2xl bg-card border border-border h-full hover:border-gold/30 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6">
                    <value.icon className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-4">
              <MapPin className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">We Serve</span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Serving West Africa
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Based in Lagos, Nigeria, we deliver precision laser engraving
              services across the region.
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

      {/* Quality Promise */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Our Quality Promise
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Every Laser Yard project is executed using industrial-grade laser
                equipment calibrated for micron-level precision. From metal business
                cards to custom signage, we inspect each piece individually before
                delivery, ensuring you receive nothing but the best.
              </p>
              <WhatsAppCTA
                buttonText="Start Your Project"
                size="lg"
                message="Hi! I'd like to learn more about Laser Yard's laser engraving services."
                trackingLabel="about-page"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
