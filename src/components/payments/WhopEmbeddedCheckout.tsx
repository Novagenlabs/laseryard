"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";

/**
 * Whop embedded checkout, hosted on our own domain so agent checkout links
 * keep customers on laseryard.com ("so not thru a website?" — now it is).
 * Same Whop plan/session as the hosted page, so payment verification and
 * order tracking are untouched.
 *
 * URL params: ?plan=plan_XXX&session=ch_YYY (session optional but carries
 * the order metadata the agent attached).
 */

const LOADER_SRC = "https://js.whop.com/static/checkout/loader.js";
const LOAD_TIMEOUT_MS = 12000;

export function WhopEmbeddedCheckout() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "";
  const session = searchParams.get("session") || "";
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);

  const validPlan = /^plan_[A-Za-z0-9]+$/.test(plan);
  const validSession = session === "" || /^ch_[A-Za-z0-9]+$/.test(session);

  useEffect(() => {
    if (!validPlan || !validSession) return;

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled && !mountRef.current?.querySelector("iframe")) {
        setFailed(true);
      }
    }, LOAD_TIMEOUT_MS);

    const existing = document.querySelector(`script[src="${LOADER_SRC}"]`);
    if (!existing) {
      const script = document.createElement("script");
      script.src = LOADER_SRC;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        if (!cancelled) setFailed(true);
      };
      document.head.appendChild(script);
    }

    // The loader replaces the data-attribute div with an iframe; watch for it
    // so we can drop our spinner.
    const observer = new MutationObserver(() => {
      if (mountRef.current?.querySelector("iframe")) {
        setReady(true);
        window.clearTimeout(timeout);
        observer.disconnect();
      }
    });
    if (mountRef.current) {
      observer.observe(mountRef.current, { childList: true, subtree: true });
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      observer.disconnect();
    };
  }, [validPlan, validSession]);

  if (!validPlan || !validSession) {
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

  const whopFallback = `https://whop.com/checkout/${plan}/${
    session ? `?session=${session}` : ""
  }`;

  return (
    <div>
      {!ready && !failed && (
        <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
          <span>Loading secure checkout…</span>
        </div>
      )}
      {failed && !ready && (
        <div className="rounded-xl border border-border p-6 text-center mb-4">
          <p className="font-medium mb-2">The embedded checkout didn&apos;t load.</p>
          <a
            href={whopFallback}
            className="inline-block rounded-lg bg-primary px-5 py-2.5 text-primary-foreground font-semibold"
          >
            Continue to secure checkout →
          </a>
          <p className="text-sm text-muted-foreground mt-3">
            Same order, processed by our payment partner Whop.
          </p>
        </div>
      )}
      <div ref={mountRef}>
        <div
          data-whop-checkout-plan-id={plan}
          {...(session ? { "data-whop-checkout-session": session } : {})}
          data-whop-checkout-theme="system"
          data-whop-checkout-return-url="https://laseryard.com/track"
        />
      </div>
    </div>
  );
}
