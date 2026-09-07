"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { trackPurchase } from "@/lib/analytics";

/**
 * Website checkout page for metal cards. The product page creates the Whop
 * session (server-priced) and parks the details here via sessionStorage, so
 * the customer sees their order summary next to Whop's form. The email they
 * gave us is prefilled and locked in that form — name and delivery address
 * are typed once, there.
 */

export const PENDING_CHECKOUT_KEY = "ly-pending-checkout";
const PENDING_TTL_MS = 2 * 60 * 60 * 1000;

export type PendingCheckout = {
  sessionId: string;
  purchaseUrl: string;
  amount: number;
  email: string;
  quantity: number;
  color: string;
  designService: "included" | "paid" | "none";
  destination: string;
  createdAt: number;
};

const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export function CardsCheckout() {
  // undefined = still reading storage; null = nothing pending
  const [pending, setPending] = useState<PendingCheckout | null | undefined>(
    undefined
  );
  const [completed, setCompleted] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
      const parsed = raw ? (JSON.parse(raw) as PendingCheckout) : null;
      const fresh =
        parsed &&
        /^ch_[A-Za-z0-9]+$/.test(parsed.sessionId || "") &&
        Date.now() - (parsed.createdAt || 0) < PENDING_TTL_MS;
      setPending(fresh ? parsed : null);
    } catch {
      setPending(null);
    }
  }, []);

  if (pending === undefined) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
        Loading your order…
      </div>
    );
  }

  if (!pending) {
    return (
      <div className="max-w-md mx-auto rounded-xl border border-border p-8 text-center">
        <p className="font-medium mb-2">No order in progress.</p>
        <p className="text-sm text-muted-foreground mb-6">
          Pick your cards first and we&apos;ll bring you back here.
        </p>
        <Link
          href="/products/metal-business-cards"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Choose your cards
        </Link>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="max-w-md mx-auto rounded-2xl border border-border bg-card p-8 text-center">
        <div className="size-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-4">
          <Check className="size-8 text-green-500" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Payment Successful</h2>
        <p className="text-sm text-muted-foreground mb-2">
          Your order has been placed. Your confirmation and tracking link are
          on their way to {pending.email}.
        </p>
        {paymentId && (
          <p className="text-xs text-muted-foreground mb-6 font-mono">
            Payment ID: {paymentId}
          </p>
        )}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I just completed payment${paymentId ? ` (${paymentId})` : ""}. Can we get started on my metal business cards?`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Continue on WhatsApp
        </a>
      </div>
    );
  }

  const designLine =
    pending.designService === "paid"
      ? "Design service — we design it for you"
      : pending.designService === "included"
        ? "Professional design included free"
        : "Your own print-ready design";

  return (
    <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-8 items-start">
      {/* Order summary */}
      <aside className="p-6 rounded-xl bg-card border border-border lg:sticky lg:top-32 space-y-4">
        <h2 className="font-semibold">Your order</h2>
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground">
            {pending.quantity} × {pending.color} metal business cards (0.8mm)
          </span>
        </div>
        <ul className="text-sm text-muted-foreground space-y-1.5">
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-gold flex-shrink-0" /> {designLine}
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-gold flex-shrink-0" /> Worldwide
            shipping to {pending.destination} included
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-gold flex-shrink-0" /> Digital
            proof + engraved sample card before the full batch
          </li>
        </ul>
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <span className="font-semibold">Total</span>
          <span className="font-semibold text-lg">{formatUsd(pending.amount)}</span>
        </div>
        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
          <ShieldCheck className="size-3.5 mt-0.5 flex-shrink-0" aria-hidden />
          Enter your name and delivery address on the form — your confirmation
          email repeats them so you can double-check.
        </p>
        <Link
          href="/products/metal-business-cards"
          className="text-xs underline text-muted-foreground hover:text-foreground transition-colors"
        >
          Change your order
        </Link>
      </aside>

      {/* Whop checkout */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <WhopCheckoutEmbed
          sessionId={pending.sessionId}
          theme="system"
          prefill={{ email: pending.email }}
          disableEmail
          returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/pay/success`}
          onComplete={(id) => {
            trackPurchase(pending.amount, id);
            setPaymentId(id);
            setCompleted(true);
            try {
              sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
            } catch {}
          }}
        />
      </div>
    </div>
  );
}
