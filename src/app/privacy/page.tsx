import { Metadata } from "next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Laser Yard collects, uses, and protects your personal data when you use our website and laser engraving services.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Privacy Policy", url: "/privacy" },
        ])}
      />

      {/* Hero */}
      <section className="pt-32 pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h1 className="font-[family-name:var(--font-montserrat)] text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Privacy Policy
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
                Laser Yard (&quot;we,&quot; &quot;us&quot;) is a laser engraving
                studio headquartered in Lagos, Nigeria. This page explains what
                data we collect when you visit laseryard.com or order from us,
                and what we do with it.
              </p>

              <h2>What we collect</h2>
              <p>
                We only collect information that we actually need to process your
                order or improve the website. Here is what that looks like:
              </p>
              <ul className="list-disc pl-6">
                <li>
                  Your name, email, phone number, and shipping address when you
                  place an order or contact us
                </li>
                <li>
                  Design files you send us (logos, artwork, text content for
                  engraving)
                </li>
                <li>
                  Payment details processed through our payment provider (we
                  do not store card numbers on our servers)
                </li>
                <li>
                  Basic analytics data: pages visited, referral source, device
                  type, country. This is aggregated and anonymous.
                </li>
              </ul>

              <h2>How we use your data</h2>
              <ul className="list-disc pl-6">
                <li>To produce and ship your order</li>
                <li>To communicate about your order via WhatsApp or email</li>
                <li>
                  To send you a shipping tracking link once your order is
                  dispatched
                </li>
                <li>
                  To understand how people use the website so we can fix
                  problems and make it better
                </li>
              </ul>
              <p>
                We do not sell your data. We do not rent it out. We do not send
                marketing emails unless you asked for them.
              </p>

              <h2>Cookies</h2>
              <p>
                The site uses a small number of cookies for basic functionality:
                remembering your theme preference (light or dark mode), keeping
                track of your session, and anonymous analytics. No advertising
                or cross-site tracking cookies.
              </p>

              <h2>Third-party services</h2>
              <p>We use a few external services to run things:</p>
              <ul className="list-disc pl-6">
                <li>
                  Payment processing (to handle transactions securely)
                </li>
                <li>
                  Shipping and logistics partners (to deliver your order)
                </li>
                <li>
                  Analytics (to see which pages get traffic and which
                  don&apos;t)
                </li>
                <li>WhatsApp / email (to communicate with you)</li>
              </ul>
              <p>
                Each of these services has its own privacy policy. We pick
                providers we trust, but we can&apos;t control how they handle
                data once it reaches them.
              </p>

              <h2>Design files</h2>
              <p>
                When you send us artwork or logos for engraving, we keep those
                files for the duration of your project plus 90 days after
                delivery, in case you want to reorder. After that, we delete
                them. If you want your files deleted sooner, let us know and
                we will take care of it.
              </p>

              <h2>Data retention</h2>
              <p>
                Order records (name, address, what you ordered, transaction
                amounts) are kept for 3 years for accounting and tax purposes.
                Analytics data is aggregated and does not identify you
                personally.
              </p>

              <h2>Your rights</h2>
              <p>You can ask us to:</p>
              <ul className="list-disc pl-6">
                <li>Show you what data we have about you</li>
                <li>Correct anything that is wrong</li>
                <li>
                  Delete your data (subject to legal requirements like tax
                  record keeping)
                </li>
              </ul>
              <p>
                Email{" "}
                <a
                  href="mailto:hello@laseryard.com"
                  className="text-gold hover:underline"
                >
                  hello@laseryard.com
                </a>{" "}
                with your request. We will respond within 30 days.
              </p>

              <h2>Security</h2>
              <p>
                We use HTTPS across the entire site. Payment processing is
                handled by PCI-compliant providers. Access to customer data is
                restricted to team members who need it to fulfill orders. Could
                we be doing more? Probably. We review and tighten things
                regularly.
              </p>

              <h2>Children</h2>
              <p>
                This website is not directed at anyone under 16. We do not
                knowingly collect data from minors. If you believe a child has
                provided us with personal information, contact us and we will
                delete it.
              </p>

              <h2>Changes to this policy</h2>
              <p>
                If we change how we handle your data, we will update this page
                and the &quot;last updated&quot; date at the top. For anything
                major, we will send an email to active customers.
              </p>

              <h2>Contact</h2>
              <p>
                Questions about your data or this policy? Reach us at{" "}
                <a
                  href="mailto:hello@laseryard.com"
                  className="text-gold hover:underline"
                >
                  hello@laseryard.com
                </a>
                .
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
