"use client";

import { useSearchParams } from "next/navigation";
import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { AlertCircle, Loader2 } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";

/**
 * Whop checkout embedded on our own domain, used by the links Yara sends
 * ("pay on the website"). The checkout session the agent API created is the
 * handle: ?session=ch_XXX. Older links carried ?plan=plan_XXX(&session=…)
 * and still work.
 */
export function WhopEmbeddedCheckout() {
  const searchParams = useSearchParams();
  const session = searchParams.get("session") || "";
  const plan = searchParams.get("plan") || "";

  const validSession = /^ch_[A-Za-z0-9]+$/.test(session);
  const validPlan = /^plan_[A-Za-z0-9]+$/.test(plan);

  if (!validSession && !validPlan) {
    return (
      <div className="rounded-xl border border-border p-6 text-center">
        <AlertCircle className="w-6 h-6 mx-auto mb-3 text-destructive" aria-hidden />
        <p className="font-medium mb-2">This checkout link looks incomplete.</p>
        <p className="text-sm text-muted-foreground">
          Message us on{" "}
          <a
            className="underline hover:text-foreground"
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
          >
            WhatsApp
          </a>{" "}
          and we&apos;ll send you a fresh one right away.
        </p>
      </div>
    );
  }

  const whopFallback = validSession
    ? `https://whop.com/checkout/${session}`
    : `https://whop.com/checkout/${plan}/`;
  const embedProps = validSession ? { sessionId: session } : { planId: plan };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <WhopCheckoutEmbed
        {...embedProps}
        theme="system"
        returnUrl="https://laseryard.com/track"
        fallback={
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
            <span>Loading secure checkout…</span>
          </div>
        }
      />
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Trouble loading?{" "}
        <a href={whopFallback} className="underline hover:text-foreground">
          Open the same checkout on Whop
        </a>
        .
      </p>
    </div>
  );
}
