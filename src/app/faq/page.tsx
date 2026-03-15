import { Metadata } from "next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import { DesktopBlur } from "@/components/ui/DesktopBlur";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd } from "@/components/JsonLd";
import { faqSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about metal business cards, laser engraving, ordering, design, production, shipping, and payment at Laser Yard.",
  alternates: { canonical: "/faq" },
};

const faqCategories = [
  {
    category: "Ordering",
    questions: [
      {
        q: "What is the minimum order quantity?",
        a: "Our minimum order is 30 cards. This allows us to maintain quality while making premium metal cards accessible to individuals and small businesses.",
      },
      {
        q: "How do I place an order?",
        a: "Simply contact us via WhatsApp with your design (or design requirements). We'll provide a quote, create a proof for your approval, and proceed with production once you're satisfied.",
      },
      {
        q: "Can I order a sample before placing a bulk order?",
        a: "Yes! We offer sample packs for serious inquiries. Contact us on WhatsApp to discuss sample options and pricing.",
      },
      {
        q: "Do you offer rush orders?",
        a: "Yes, we offer priority production for an additional fee. Rush orders can be completed in 2-3 business days instead of the standard 5-7 days.",
      },
    ],
  },
  {
    category: "Design & Customization",
    questions: [
      {
        q: "What file formats do you accept?",
        a: "We accept AI, EPS, PDF (vector), SVG, and high-resolution PNG files (minimum 300 DPI). Vector formats are preferred for best results.",
      },
      {
        q: "Can you help design my card?",
        a: "Absolutely! Our design team can create a custom design based on your requirements. Design services are available for an additional fee.",
      },
      {
        q: "Can I include a QR code on my card?",
        a: "Yes! QR codes work very well on metal cards. We recommend keeping them at least 15mm x 15mm for reliable scanning.",
      },
      {
        q: "What's the difference between 0.4mm and 0.8mm thickness?",
        a: "0.4mm cards are solid and durable, similar to a premium credit card. 0.8mm cards are heavy, rigid, and have a substantial executive feel. Most clients prefer 0.8mm for the impression it makes.",
      },
    ],
  },
  {
    category: "Production & Quality",
    questions: [
      {
        q: "How long does production take?",
        a: "Standard production is 10-14 business days after design approval, though cards can be ready in as little as 5-7 days.",
      },
      {
        q: "What material are the cards made from?",
        a: "Our cards are made from premium aluminum alloy. They're durable, lightweight, and won't rust, bend, or fade over time.",
      },
      {
        q: "How is the design engraved?",
        a: "We use precision laser engraving equipment that etches your design directly into the metal surface. This creates a permanent, high-contrast result that won't wear off.",
      },
      {
        q: "Do you inspect each card?",
        a: "Yes! Every single card is individually inspected before packaging to ensure it meets our quality standards.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        q: "Where do you ship to?",
        a: "We ship worldwide! Local delivery in Lagos is 24-48 hours, rest of Nigeria in 3-5 days, and international orders typically arrive within 7-14 business days.",
      },
      {
        q: "How long does delivery take?",
        a: "Lagos: 24-48 hours. Other Nigerian cities: 3-5 days. International: 7-14 business days depending on destination. Contact us for specific delivery estimates to your location.",
      },
      {
        q: "How much does shipping cost?",
        a: "Shipping costs vary by destination. Local Lagos delivery starts at $5, other Nigerian cities from $10. International shipping is quoted per order. Contact us on WhatsApp for exact costs to your location.",
      },
      {
        q: "Can I track my order?",
        a: "Yes! We provide tracking information via WhatsApp once your order ships. You'll receive updates at each stage of delivery.",
      },
    ],
  },
  {
    category: "Payment",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept bank transfers, mobile money (MTN MoMo, Airtel Money), and international wire transfers. Contact us to discuss the best payment method for your location.",
      },
      {
        q: "When is payment due?",
        a: "We require 50% deposit to begin production, with the remaining 50% due before shipping. For orders under 50 cards, full payment may be required upfront.",
      },
      {
        q: "Do you offer volume discounts?",
        a: "Yes! Orders of 500+ cards automatically receive a 10% discount. Contact us for custom pricing on larger orders.",
      },
    ],
  },
];

export default function FAQPage() {
  const allQuestions = faqCategories.flatMap((cat) =>
    cat.questions.map((q) => ({ question: q.q, answer: q.a }))
  );

  return (
    <>
      <JsonLd
        data={[
          faqSchema(allQuestions),
          breadcrumbSchema([{ name: "FAQ", url: "/faq" }]),
        ]}
      />
      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <DesktopBlur className="absolute top-1/3 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
              FAQ
            </p>
            <h1 className="font-[family-name:var(--font-montserrat)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Frequently Asked{" "}
              <span className="text-gradient-gold">Questions</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Common questions about ordering, materials, pricing, and delivery.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {faqCategories.map((category, catIndex) => (
            <ScrollReveal key={category.category} delay={catIndex * 0.1}>
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-sm font-bold text-gold">
                    {catIndex + 1}
                  </span>
                  {category.category}
                </h2>

                <Accordion type="single" collapsible className="space-y-3">
                  {category.questions.map((item, qIndex) => (
                    <AccordionItem
                      key={qIndex}
                      value={`${category.category}-${qIndex}`}
                      className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-gold/30 transition-colors"
                      itemScope
                      itemType="https://schema.org/Question"
                    >
                      <AccordionTrigger className="text-left text-base hover:no-underline hover:text-gold transition-colors py-5">
                        <span itemProp="name">{item.q}</span>
                      </AccordionTrigger>
                      <AccordionContent
                        className="text-muted-foreground pb-5 leading-relaxed"
                        itemScope
                        itemType="https://schema.org/Answer"
                      >
                        <span itemProp="text">{item.a}</span>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="p-12 rounded-3xl bg-gradient-to-br from-gold/10 via-card to-card border border-gold/20 text-center">
              <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Still Have Questions?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Can't find what you're looking for? Our team is happy to help
                with any questions about our laser engraving services.
              </p>
              <WhatsAppCTA
                buttonText="Ask Us Anything"
                size="lg"
                variant="gold"
                message="Hi! I have a question about your laser engraving services..."
                trackingLabel="faq-page"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
