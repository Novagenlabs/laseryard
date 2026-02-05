import { Metadata } from "next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Laser Yard's laser engraving services - ordering, customization, delivery, payment, and more.",
};

const faqCategories = [
  {
    category: "Ordering",
    questions: [
      {
        q: "What is the minimum order quantity?",
        a: "Our minimum order is 25 cards. This allows us to maintain quality while making premium metal cards accessible to individuals and small businesses.",
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
        q: "What's the difference between 0.2mm and 0.4mm thickness?",
        a: "0.2mm cards are lightweight and flexible, similar to a thick credit card. 0.4mm cards are more rigid and have a substantial, premium weight feel. Most clients prefer 0.4mm for the executive impression it makes.",
      },
    ],
  },
  {
    category: "Production & Quality",
    questions: [
      {
        q: "How long does production take?",
        a: "Standard production is 5-7 business days after design approval. Rush orders (2-3 days) are available for an additional fee.",
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
        a: "We ship across West Africa including Nigeria, Ghana, Togo, Benin, and Cameroon. We can also arrange international shipping on request.",
      },
      {
        q: "How long does delivery take?",
        a: "Lagos: 24-48 hours. Other Nigerian cities: 3-5 days. Ghana (Accra): 5-7 days. Other West African countries: 7-10 days.",
      },
      {
        q: "How much does shipping cost?",
        a: "Shipping costs vary by location: Lagos ($5), Other Nigerian cities ($10), Ghana ($15), Other West Africa ($20). These are estimates - exact costs confirmed at checkout.",
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
        a: "We accept bank transfers (Nigerian and Ghanaian banks), mobile money (MTN MoMo, Airtel Money), and can discuss international wire transfers for overseas clients.",
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
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
              FAQ
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Frequently Asked{" "}
              <span className="text-gradient-gold">Questions</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to know about working with Laser Yard on your
              laser engraving projects.
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
                    >
                      <AccordionTrigger className="text-left text-base hover:no-underline hover:text-gold transition-colors py-5">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                        {item.a}
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
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
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
