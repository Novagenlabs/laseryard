"use client";

import { useState, useCallback } from "react";
import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { Loader2, X, Check } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics";

interface WhopCheckoutProps {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  buttonText?: string;
  className?: string;
}

export function WhopCheckout({
  amount,
  currency = "usd",
  metadata,
  buttonText = "Buy Now",
  className,
}: WhopCheckoutProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const startCheckout = useCallback(async () => {
    setLoading(true);
    setError("");
    trackBeginCheckout(amount);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, metadata }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSessionId(data.sessionId);
      }
    } catch {
      setError("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [amount, currency, metadata]);

  // Success state
  if (completed) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="size-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-4">
          <Check className="size-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Payment Successful</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Your order has been placed. We'll start working on your cards right away.
        </p>
        {paymentId && (
          <p className="text-xs text-muted-foreground mb-4 font-mono">
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

  // Checkout embed active
  if (sessionId) {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-sm">Complete Your Order</h3>
          <button
            onClick={() => setSessionId(null)}
            className="p-1 rounded-lg hover:bg-foreground/5 transition-colors"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-4">
          <WhopCheckoutEmbed
            sessionId={sessionId}
            returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/pay/success`}
            onComplete={(id) => {
              trackPurchase(amount, id);
              setPaymentId(id);
              setCompleted(true);
              setSessionId(null);
            }}
          />
        </div>
      </div>
    );
  }

  // Default: Buy button
  return (
    <div>
      {error && (
        <p className="text-sm text-red-500 mb-3">{error}</p>
      )}
      <button
        onClick={startCheckout}
        disabled={loading}
        className={
          className ||
          "w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-foreground text-background font-medium text-base hover:opacity-90 transition-opacity disabled:opacity-50"
        }
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Loading...
          </>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
}
