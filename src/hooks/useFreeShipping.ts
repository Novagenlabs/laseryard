"use client";

import { useEffect, useState } from "react";
import { FREE_SHIPPING_CAMPAIGN } from "@/lib/constants";

const STORAGE_KEY = "ly-free-shipping-deadline";

/**
 * Per-visitor free-shipping window. The countdown starts on the visitor's
 * first page load and is kept in localStorage, so it survives navigation
 * and return visits but expires per visitor. Returns { active: false }
 * while the campaign is disabled, expired, or before hydration.
 */
export function useFreeShipping(): {
  active: boolean;
  remainingMs: number;
} {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!FREE_SHIPPING_CAMPAIGN.enabled) return;

    let deadline: number;
    try {
      deadline = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
      if (!deadline) {
        deadline = Date.now() + FREE_SHIPPING_CAMPAIGN.windowHours * 3600_000;
        localStorage.setItem(STORAGE_KEY, String(deadline));
      }
    } catch {
      return; // storage unavailable (private mode) — no campaign
    }

    const tick = () => setRemainingMs(Math.max(0, deadline - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { active: remainingMs > 0, remainingMs };
}

export function formatCountdown(ms: number): string {
  const total = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}
