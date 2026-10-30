import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CardsCheckout } from "@/components/payments/CardsCheckout";

export const metadata: Metadata = {
  title: "Checkout | Laser Yard",
  description: "Complete your metal business card order securely.",
  robots: { index: false, follow: false },
};

// Website order checkout (the /checkout page next door serves Yara's links).
export default function CardsCheckoutPage() {
  return (
    <section className="pt-40 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ArrowRight className="w-3 h-3" aria-hidden />
          <Link
            href="/products/metal-business-cards"
            className="hover:text-foreground transition-colors"
          >
            Metal Business Cards
          </Link>
          <ArrowRight className="w-3 h-3" aria-hidden />
          <span className="text-foreground">Checkout</span>
        </nav>

        <h1 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold tracking-tight mb-8">
          Complete Your Order
        </h1>

        <CardsCheckout />
      </div>
    </section>
  );
}
