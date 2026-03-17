"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { WHATSAPP_NUMBER } from "@/lib/constants";

type PaymentStatus = "idle" | "loading" | "success" | "error";

const SUPPORTED_CURRENCIES = ["USD", "GBP", "EUR", "NGN", "GHS"] as const;
type Currency = (typeof SUPPORTED_CURRENCIES)[number];

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  GBP: "\u00a3",
  EUR: "\u20ac",
  NGN: "\u20a6",
  GHS: "GH\u20b5",
};

export function PaymentCheckout() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [orderRef, setOrderRef] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [verifiedData, setVerifiedData] = useState<{
    reference: string;
    amount: number;
    currency: string;
    paidAt: string;
  } | null>(null);

  // Pre-fill from URL params
  useEffect(() => {
    const urlAmount = searchParams.get("amount");
    const urlCurrency = searchParams.get("currency");
    const urlRef = searchParams.get("ref");
    const urlEmail = searchParams.get("email");

    if (urlAmount) setAmount(urlAmount);
    if (urlCurrency && SUPPORTED_CURRENCIES.includes(urlCurrency as Currency)) {
      setCurrency(urlCurrency as Currency);
    }
    if (urlRef) setOrderRef(urlRef);
    if (urlEmail) setEmail(urlEmail);
  }, [searchParams]);

  const loadPaystackScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="paystack"]')) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v2/inline.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Paystack"));
      document.head.appendChild(script);
    });
  }, []);

  const handlePayment = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const numAmount = parseFloat(amount);
      if (!email || !numAmount || numAmount <= 0) return;

      setStatus("loading");
      setErrorMessage("");

      try {
        await loadPaystackScript();

        const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
        if (!publicKey) {
          throw new Error("Payment system not configured");
        }

        // Paystack expects amount in smallest currency unit (kobo, cents, etc.)
        const paystackAmount = Math.round(numAmount * 100);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const PaystackPop = (window as any).PaystackPop;
        if (!PaystackPop) throw new Error("Payment system unavailable");

        const popup = new PaystackPop();
        popup.newTransaction({
          key: publicKey,
          email,
          amount: paystackAmount,
          currency,
          ref: orderRef || undefined,
          metadata: {
            custom_fields: [
              { display_name: "Customer Name", variable_name: "name", value: name },
              { display_name: "Order Reference", variable_name: "order_ref", value: orderRef },
            ],
          },
          onSuccess: async (transaction: { reference: string }) => {
            // Verify on server
            try {
              const res = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference: transaction.reference }),
              });
              const data = await res.json();

              if (data.verified) {
                setVerifiedData(data);
                setStatus("success");
              } else {
                setErrorMessage(data.message || "Payment could not be verified");
                setStatus("error");
              }
            } catch {
              setErrorMessage("Payment received but verification failed. Contact us with your reference.");
              setStatus("error");
            }
          },
          onCancel: () => {
            setStatus("idle");
          },
        });
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Payment failed");
        setStatus("error");
      }
    },
    [email, name, amount, currency, orderRef, loadPaystackScript]
  );

  if (status === "success" && verifiedData) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="size-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-4">
          <Check className="size-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Payment Successful</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {CURRENCY_SYMBOLS[verifiedData.currency as Currency] || ""}
          {verifiedData.amount.toLocaleString()} {verifiedData.currency} received.
        </p>
        <div className="p-4 rounded-xl bg-foreground/5 text-left text-sm space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reference</span>
            <span className="font-mono text-xs">{verifiedData.reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span>
              {new Date(verifiedData.paidAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I just completed payment. Reference: ${verifiedData.reference}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Confirm on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handlePayment} className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Amount</label>
          <div className="flex gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {CURRENCY_SYMBOLS[c]} {c}
                </option>
              ))}
            </select>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Order Reference <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={orderRef}
            onChange={(e) => setOrderRef(e.target.value)}
            placeholder="e.g. ORD-123"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
      </div>

      {status === "error" && errorMessage && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="size-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-500">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!email || !amount || parseFloat(amount) <= 0 || status === "loading"}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Pay {amount && parseFloat(amount) > 0
              ? `${CURRENCY_SYMBOLS[currency]}${parseFloat(amount).toLocaleString()} ${currency}`
              : ""}
          </>
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        Secured by Paystack. Your card details are never stored on our servers.
      </p>
    </form>
  );
}
