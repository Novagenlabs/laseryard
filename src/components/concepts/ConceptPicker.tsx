"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

/**
 * Taste-capture picker: the customer taps every design that looks good
 * (five to ten), adds notes, and the studio builds the final card from
 * that. Copy follows the owner-approved brand rules: no dashes, no
 * contractions, no exclamations, palette ink/yellow/muted only.
 */

type Concept = {
  id: number;
  label: string | null;
  style: string | null;
  image: string;
};

type ConceptsResponse = {
  order: string;
  finish: string | null;
  concepts: Concept[];
  pickedAt: string | null;
  pickedIds: number[];
  maxPicks: number;
};

// Finish backdrops mirror CONFIG.finishes in the brief form.
const FINISH_CSS: Record<string, string> = {
  "black-matte": "linear-gradient(135deg,#26262e,#3b3b46 45%,#16161c)",
  "silver-brushed": "linear-gradient(135deg,#c9ccd2,#f2f4f7 45%,#a8acb4)",
  "silver-mirror": "linear-gradient(135deg,#e9ecf1,#ffffff 40%,#b9bdc6)",
  "black-mirror": "linear-gradient(135deg,#101015,#3a3a48 40%,#0a0a0e)",
  gold: "linear-gradient(135deg,#c9a227,#f3dd8a 42%,#a5801a)",
  "rose-gold": "linear-gradient(135deg,#c58a72,#f0c4b3 42%,#a76f58)",
};

const YELLOW = "#FFD500";
const INK = "#1A1A24";

export function ConceptPicker() {
  const params = useSearchParams();
  const order = (params.get("order") || "").trim();

  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">(
    "loading"
  );
  const [data, setData] = useState<ConceptsResponse | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loadedIds, setLoadedIds] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!order) {
      setState("missing");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          `/api/concepts?order=${encodeURIComponent(order)}`,
          { headers: { Accept: "application/json" } }
        );
        if (!r.ok) throw new Error(String(r.status));
        const body = (await r.json()) as ConceptsResponse;
        if (!cancelled) {
          setData(body);
          setState("ready");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [order]);

  const maxPicks = data?.maxPicks ?? 10;
  const minPicks = useMemo(
    () => Math.min(5, data?.concepts.length ?? 5),
    [data]
  );

  const toggle = useCallback(
    (id: number) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else if (next.size < maxPicks) next.add(id);
        return next;
      });
    },
    [maxPicks]
  );

  const submit = useCallback(async () => {
    if (!data || selected.size < minPicks || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const r = await fetch("/api/concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: data.order,
          picks: [...selected],
          notes: notes.trim() || undefined,
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setDone(true);
    } catch {
      setSubmitError(
        "That did not go through. Please try again, or write to hello@laseryard.com."
      );
    } finally {
      setSubmitting(false);
    }
  }, [data, selected, minPicks, notes, submitting]);

  if (state === "loading") {
    return (
      <p className="text-center text-muted-foreground py-16">
        Loading your designs...
      </p>
    );
  }

  if (state === "missing") {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-foreground font-semibold mb-2">
          This link is missing its order code.
        </p>
        <p className="text-muted-foreground text-sm">
          Open the link from your email, or write to hello@laseryard.com and we
          will send a fresh one.
        </p>
      </div>
    );
  }

  if (state === "error" || !data) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-foreground font-semibold mb-2">
          We could not load your designs.
        </p>
        <p className="text-muted-foreground text-sm">
          Please refresh in a moment, or write to hello@laseryard.com.
        </p>
      </div>
    );
  }

  if (data.concepts.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-foreground font-semibold mb-2">
          Your designs are being prepared.
        </p>
        <p className="text-muted-foreground text-sm">
          This page fills up when they are ready. We will let you know by
          email.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: YELLOW }}
        >
          <Check className="h-7 w-7" style={{ color: INK }} aria-hidden />
        </div>
        <p className="text-foreground font-semibold mb-2">
          Thank you. {selected.size} designs noted.
        </p>
        <p className="text-muted-foreground text-sm">
          The design team now has a clear read on your taste and will build
          your card from it. Your next update arrives by email.
        </p>
      </div>
    );
  }

  const finishCss = data.finish ? FINISH_CSS[data.finish] : undefined;
  const count = selected.size;
  const remaining = Math.max(0, minPicks - count);

  return (
    <div>
      {data.pickedAt ? (
        <p className="text-center text-sm text-muted-foreground mb-8">
          You already sent picks on{" "}
          {new Date(data.pickedAt).toLocaleDateString()}. Picking again is
          fine, we use the newest set.
        </p>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.concepts.map((c) => {
          const isSelected = selected.has(c.id);
          const isLoaded = loadedIds.has(c.id);
          const settle = () =>
            setLoadedIds((prev) => new Set(prev).add(c.id));
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              aria-pressed={isSelected}
              className="group relative rounded-2xl border bg-card p-3 text-left transition-shadow focus:outline-none focus-visible:ring-2"
              style={{
                borderColor: isSelected ? YELLOW : undefined,
                boxShadow: isSelected ? `0 0 0 2px ${YELLOW}` : undefined,
              }}
            >
              <span
                className={`block aspect-[1586/1000] w-full overflow-hidden rounded-xl ${
                  isLoaded ? "" : "animate-pulse bg-muted"
                }`}
                style={finishCss ? { background: finishCss } : undefined}
              >
                {/* Mockups can be any aspect; contain keeps them honest.
                    Engraving is monochrome, so previews render grayscale.
                    The tile pulses until the image arrives, then fades in. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image}
                  alt={c.label || "Card design"}
                  loading="lazy"
                  onLoad={settle}
                  onError={settle}
                  className={`h-full w-full object-contain grayscale transition-opacity duration-300 ${
                    isLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              </span>
              <span className="mt-3 flex items-center justify-between px-1">
                <span className="text-sm text-muted-foreground">
                  {c.label || "Design"}
                </span>
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full border transition-colors"
                  style={
                    isSelected
                      ? { background: YELLOW, borderColor: YELLOW }
                      : undefined
                  }
                >
                  {isSelected ? (
                    <Check className="h-4 w-4" style={{ color: INK }} aria-hidden />
                  ) : null}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-10 max-w-lg">
        <label
          htmlFor="concept-notes"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Anything you want more of, or less of?
        </label>
        <textarea
          id="concept-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="Optional. For example, love the thin type, skip the borders."
          className="w-full rounded-xl border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2"
        />

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {count === 0
              ? `Pick ${minPicks} to ${maxPicks} designs`
              : remaining > 0
                ? `${count} picked, ${remaining} more to go`
                : `${count} of ${maxPicks} picked`}
          </p>
          <button
            type="button"
            onClick={submit}
            disabled={count < minPicks || submitting}
            className="rounded-full px-6 py-3 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: YELLOW, color: INK }}
          >
            {submitting ? "Sending..." : "Send my picks"}
          </button>
        </div>
        {submitError ? (
          <p className="mt-3 text-sm font-medium text-foreground" role="alert">
            {submitError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
