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
        a: "Our minimum order is 15 cards — $250 with worldwide shipping included. This allows us to maintain quality while making premium metal cards accessible to individuals and small businesses.",
      },
      {
        q: "How do I place an order?",
        a: "Order on laseryard.com: pick your color and quantity, add your email, and check out securely — you enter your name and delivery address on the checkout form. Prefer to chat? Message us on WhatsApp and we'll set it up for you.",
      },
      {
        q: "What happens after I pay?",
        a: "You get a confirmation email with your order number and tracking link right away. Send your logo and card details to sales@laseryard.com (or let our design team create the design), approve the digital proof and the engraved sample card, and production begins — 10-14 business days, then tracked delivery.",
      },
      {
        q: "Where do I enter my delivery address?",
        a: "On the secure checkout form, right after you add your email on the product page. Your confirmation email repeats the address so you can double-check it.",
      },
      {
        q: "Can I see a sample before I order?",
        a: "We don't produce samples or mock-ups before an order is placed. After you order, you approve a digital proof, and we engrave your design on one card and share it before producing the full batch. For recent finished cards, see our Instagram @thelaseryard.",
      },
      {
        q: "Do you offer rush orders?",
        a: "Yes, we offer priority production for an additional fee. Rush orders can be completed in 2-3 business days instead of the standard 10-14 business days.",
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
        a: "Absolutely! Design is included free with orders of 30 cards or more. For the 15-card starter pack, our design service is a flat $50 — or bring your own print-ready design at no extra cost.",
      },
      {
        q: "Can I include a QR code on my card?",
        a: "Yes! QR codes work very well on metal cards. We recommend keeping them at least 15mm x 15mm for reliable scanning.",
      },
      {
        q: "How thick are the cards, and what colors are available?",
        a: "Every card is 0.8mm anodized aluminum — heavy, rigid, with a substantial executive feel. Choose from 11 colors: matte black, silver, champagne gold, blue, red, green, sage green, purple, blush pink, cosmic orange, and brown.",
      },
    ],
  },
  {
    category: "Production & Quality",
    questions: [
      {
        q: "How long does production take?",
        a: "Standard production is 10-14 business days after you approve your proof. Rush production (2-3 business days) is available for an extra fee.",
      },
      {
        q: "What material are the cards made from?",
        a: "Premium 0.8mm anodized aluminum with a matte finish, available in 11 colors. Rigid and durable — they won't rust, bend, or fade over time.",
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
        a: "We ship worldwide, with shipping included in every price. Orders typically arrive within 7-14 business days after dispatch, tracked door-to-door.",
      },
      {
        q: "How long does delivery take?",
        a: "Most orders arrive within 7-14 business days depending on destination. Contact us for specific delivery estimates to your location.",
      },
      {
        q: "How much does shipping cost?",
        a: "Nothing — worldwide shipping is included in every price. The price you see is the all-in delivered total, wherever you are.",
      },
      {
        q: "Can I track my order?",
        a: "Yes! Your confirmation email includes your order number (LY-XXXX-XXXX) and a tracking link — follow every stage at laseryard.com/track. We also update you on WhatsApp if you ordered there.",
      },
    ],
  },
  {
    category: "Payment",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "Card payment at checkout through our secure Whop checkout — all major cards. For custom projects such as crystal awards or engraving your own items, the team shares payment options with your quote.",
      },
      {
        q: "When is payment due?",
        a: "Card packs are paid in full at checkout. For custom projects we take a 50% deposit to begin production, with the balance due before shipping.",
      },
      {
        q: "Do you offer volume discounts?",
        a: "The pack prices already scale: 15 cards $250, 30 cards $450, 50 cards $715, 100 cards $1,350, 200 cards $2,550 — all with worldwide shipping included. Need more than 200? Contact us for a custom quote.",
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
