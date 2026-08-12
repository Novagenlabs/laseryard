import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { WhopEmbeddedCheckout } from "@/components/payments/WhopEmbeddedCheckout";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export const metadata: Metadata = {
  title: "Checkout | Laser Yard",
  description: "Complete your Laser Yard order securely.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <section className="pt-40 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ArrowRight className="w-3 h-3" aria-hidden />
            <span className="text-foreground">Checkout</span>
          </nav>

          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Complete Your Order
              </h1>
              <p className="text-muted-foreground flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" aria-hidden />
                Secure payment — once you&apos;re done, the design team gets
                started right away.
              </p>
            </div>

            <Suspense
              fallback={
                <div className="text-center text-muted-foreground py-8">
                  Loading checkout...
                </div>
              }
            >
              <WhopEmbeddedCheckout />
            </Suspense>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
