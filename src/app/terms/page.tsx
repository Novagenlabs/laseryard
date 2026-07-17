import { Metadata } from "next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions for using the Laser Yard website and ordering laser engraving services, including payment, shipping, returns, and intellectual property.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Terms of Service", url: "/terms" },
        ])}
      />

      {/* Hero */}
      <section className="pt-32 pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h1 className="font-[family-name:var(--font-montserrat)] text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Terms of Service
            </h1>
            <div className="w-16 h-px bg-border mb-4" />
            <p className="text-muted-foreground text-sm">
              Last updated: March 20, 2026
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="prose prose-neutral dark:prose-invert max-w-none [&_h2]:font-[family-name:var(--font-montserrat)] [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_li]:text-muted-foreground [&_li]:leading-relaxed [&_ul]:my-3 [&_ul]:space-y-1">
              <p>
                These terms apply when you use the Laser Yard website
                (laseryard.com) or purchase any of our products and services.
                By placing an order, you agree to what is outlined below.
              </p>

              <h2>Who we are</h2>
              <p>
                Laser Yard is a laser engraving studio based in Lagos, Nigeria.
                We sell ready-made engraved products (metal business cards,
                crystal awards, wood items) and offer custom engraving on items
                you provide.
              </p>

              <h2>Placing an order</h2>
              <p>
                You can order through our website or by contacting us on
                WhatsApp. When you place an order, you are making an offer to
                buy. The order is confirmed once we accept it and send you a
                proof or order confirmation.
              </p>
              <p>
                We reserve the right to decline any order. If we do, we will
                refund any payment you have already made in full.
              </p>

              <h2>Pricing and payment</h2>
              <p>
                Prices on the website are listed in the currency shown at the
                time of purchase. Shipping costs are calculated at checkout and
                vary by destination.
              </p>
              <p>
                For custom orders, we require a 50% deposit before production
                begins. The remaining balance is due before shipping. Orders
                under 50 units may require full payment upfront.
              </p>
              <p>
                If a price is listed incorrectly due to a technical error, we
                will contact you before proceeding. You can cancel for a full
                refund in that case.
              </p>

              <h2>Design approval</h2>
              <p>
                For custom engraving, we send a digital proof before
                production. You are responsible for reviewing the proof
                carefully: spelling, layout, sizing, contact details. Once you
                approve the proof, we begin production. Errors caught after
                approval are your responsibility.
              </p>
              <p>
                We will flag anything that looks off, but the final sign-off is
                yours.
              </p>

              <h2>Production and delivery</h2>
              <p>
                Standard production takes 10 to 14 business days after design
                approval. Rush production (2 to 3 business days) is available
                for an extra fee.
              </p>
              <p>
                Delivery times depend on your location. Lagos: 24 to 48 hours.
                Other Nigerian cities: 3 to 5 days. International: 7 to 14
                business days. These are estimates, not guarantees. Customs
                delays, weather, and carrier issues are outside our control.
              </p>
              <p>
                Risk of loss passes to you once the order is handed to the
                shipping carrier. If a package is lost or damaged in transit,
                we will help you file a claim with the carrier.
              </p>

              <h2>Returns and refunds</h2>
              <p>
                Custom-engraved products are made to your specification and
                cannot be returned unless they arrive defective or do not match
                the approved proof.
              </p>
              <p>
                If your order arrives damaged or wrong, contact us within 7
                days of delivery with photos. We will either replace the items
                or refund you, depending on the situation.
              </p>
              <p>
                Ready-made products (not custom engraved) can be returned
                unused and in original packaging within 14 days for a refund.
                You cover return shipping costs.
              </p>

              <h2>Your content and intellectual property</h2>
              <p>
                When you send us logos, artwork, or designs for engraving, you
                are telling us that you have the right to use them. We take
                that at face value. If someone claims that a design you
                submitted infringes their copyright or trademark, that is
                between you and them.
              </p>
              <p>
                We may photograph finished products for our portfolio or social
                media unless you tell us not to. We will not share your design
                files with other customers.
              </p>

              <h2>Website use</h2>
              <p>
                You can browse the website, place orders, and use the tools we
                provide (like the shipping calculator). Do
                not scrape the site, overload it with automated requests, or
                use it for anything illegal.
              </p>
              <p>
                The website content, including text, images, and code, belongs
                to Laser Yard. You may not copy or redistribute it without
                permission.
              </p>

              <h2>Limitation of liability</h2>
              <p>
                We stand behind our products. If something goes wrong with an
                order, we will make it right as described in the returns
                section above.
              </p>
              <p>
                Beyond that, our liability is limited to the amount you paid
                for the specific order in question. We are not liable for
                indirect losses like lost business opportunities, event
                deadlines missed due to shipping delays, or anything else that
                goes beyond the cost of the order itself.
              </p>

              <h2>Cancellations</h2>
              <p>
                You can cancel an order before production starts for a full
                refund. Once production has begun, the deposit is
                non-refundable because materials have been cut and the work is
                already underway.
              </p>

              <h2>Governing law</h2>
              <p>
                These terms are governed by the laws of the Federal Republic of
                Nigeria. Any disputes that cannot be resolved between us will
                be handled in the courts of Lagos State.
              </p>

              <h2>Changes to these terms</h2>
              <p>
                We may update these terms from time to time. When we do, we
                will change the date at the top of this page. Continued use of
                the website after changes are posted means you accept the
                updated terms.
              </p>

              <h2>Contact</h2>
              <p>
                Questions about these terms? Email us at{" "}
                <a
                  href="mailto:hello@laseryard.com"
                  className="text-gold hover:underline"
                >
                  hello@laseryard.com
                </a>{" "}
                or reach out on WhatsApp.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
