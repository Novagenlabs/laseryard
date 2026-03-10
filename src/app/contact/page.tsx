import { Metadata } from "next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { DesktopBlur } from "@/components/ui/DesktopBlur";
import { MessageCircle, Mail, Clock, MapPin } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Laser Yard. We're here to help with your laser engraving projects. WhatsApp, email, or phone - reach us your way.",
};

const contactMethods = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    subtitle: "Fastest response",
    value: "Talk to us on WhatsApp",
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    primary: true,
  },
  {
    icon: Mail,
    title: "Email",
    subtitle: "For detailed inquiries",
    value: "hello@laseryard.com",
    href: "mailto:hello@laseryard.com",
  },
];

const businessInfo = [
  {
    icon: Clock,
    title: "Business Hours",
    lines: ["Monday - Friday: 9am - 6pm", "Saturday: 10am - 4pm"],
  },
  {
    icon: MapPin,
    title: "Location",
    lines: ["Serving clients worldwide"],
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <DesktopBlur className="absolute top-1/3 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
              Get In Touch
            </p>
            <h1 className="font-[family-name:var(--font-montserrat)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="text-gradient-gold">Talk</span> to Us
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Questions about a project? Send us a message.
              We reply within an hour during business hours.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {contactMethods.map((method, index) => (
              <ScrollReveal key={method.title} delay={index * 0.1}>
                <a
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    method.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className={`block p-8 rounded-2xl border text-center transition-all duration-300 hover:-translate-y-1 ${
                    method.primary
                      ? "bg-whatsapp/10 border-whatsapp/30 hover:border-whatsapp"
                      : "bg-card border-border hover:border-gold/30"
                  }`}
                >
                  <div
                    className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 ${
                      method.primary ? "bg-whatsapp/20" : "bg-gold/10"
                    }`}
                  >
                    <method.icon
                      className={`w-8 h-8 ${
                        method.primary ? "text-whatsapp" : "text-gold"
                      }`}
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {method.subtitle}
                  </p>
                  <p
                    className={`font-medium ${
                      method.primary ? "text-whatsapp" : "text-gold"
                    }`}
                  >
                    {method.value}
                  </p>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Primary CTA */}
      <section className="py-16 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Prefer WhatsApp?
              </h2>
              <p className="text-muted-foreground mb-8">
                Most of our customers prefer the convenience of WhatsApp. Send
                us a message and we'll typically respond within an hour during
                business hours.
              </p>
              <WhatsAppCTA
                buttonText="Start WhatsApp Chat"
                size="lg"
                message="Hi! I'd like to discuss a laser engraving project with Laser Yard."
                trackingLabel="contact-page"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Business Info */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {businessInfo.map((info, index) => (
              <ScrollReveal key={info.title} delay={index * 0.1}>
                <div className="p-6 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                      <info.icon className="w-5 h-5 text-gold" />
                    </div>
                    <h3 className="font-semibold">{info.title}</h3>
                  </div>
                  <div className="space-y-1">
                    {info.lines.map((line, i) => (
                      <p key={i} className="text-muted-foreground">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Response Time */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-[family-name:var(--font-montserrat)] text-2xl font-bold tracking-tight mb-4">
                What to Expect
              </h2>
              <div className="grid sm:grid-cols-3 gap-6 mt-8">
                {[
                  { time: "< 1 hour", label: "WhatsApp Response" },
                  { time: "< 24 hours", label: "Email Response" },
                  { time: "Same Day", label: "Quote Delivery" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-2xl font-bold text-gradient-gold mb-1">
                      {item.time}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
