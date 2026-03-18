import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PaymentCheckout } from "@/components/payments/PaymentCheckout";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export const metadata: Metadata = {
  title: "Pay | Laser Yard",
  description: "Complete your Laser Yard payment securely via Paystack.",
  robots: { index: false, follow: false },
};

export default function PayPage() {
  return (
    <section className="pt-40 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ArrowRight className="w-3 h-3" aria-hidden />
            <span className="text-foreground">Pay</span>
          </nav>

          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Complete Your Payment
              </h1>
              <p className="text-muted-foreground">
                Enter your details below to pay securely via Paystack.
              </p>
            </div>

            <PaymentCheckout />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
