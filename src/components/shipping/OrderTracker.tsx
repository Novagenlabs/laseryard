"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IBM_Plex_Mono } from "next/font/google";
import {
  Search,
  Loader2,
  Package,
  Check,
  Truck,
  Flame,
  Cog,
  ScanSearch,
  BadgeCheck,
  ClipboardCheck,
  XCircle,
} from "lucide-react";
import styles from "./OrderTracker.module.css";
import { processDesign, generate2DPreview } from "@/lib/design-processor";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
});

export type OrderStatus =
  | "received"
  | "processing"
  | "in_production"
  | "quality_check"
  | "approved"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderInfo = {
  trackingNumber: string;
  customerName: string;
  itemDescription: string;
  destination: string | null;
  designUrl: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type OrderEvent = {
  status: OrderStatus;
  note: string | null;
  createdAt: string;
};

// Visual tuning knobs (dev DialKit panel); omit for the production look
export type TrackerLook = {
  plateStyle?: "steel" | "anodized" | "brass";
  laserColor?: string;
  glow?: number; // 0–2
  sparkSpeed?: number; // seconds per pass
  pulseSpeed?: number; // seconds per pulse
  engraveDepth?: number; // px
  cardRadius?: number; // px
  sheen?: boolean;
  beamEdge?: boolean;
  screws?: boolean;
};

const STEPS: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: "received", label: "Received", icon: ClipboardCheck },
  { status: "processing", label: "Processing", icon: Cog },
  { status: "in_production", label: "In Production", icon: Flame },
  { status: "quality_check", label: "Quality Check", icon: ScanSearch },
  { status: "approved", label: "Approved", icon: BadgeCheck },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: Check },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Order Received",
  processing: "Processing",
  in_production: "In Production",
  quality_check: "Quality Check",
  approved: "Approved",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function statusIcon(status: OrderStatus) {
  if (status === "cancelled") return XCircle;
  return STEPS.find((s) => s.status === status)?.icon ?? Package;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Minimal search: navigates to /track?order=… ─────────────────── */

export function TrackSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/track?order=${encodeURIComponent(trimmed.toUpperCase())}`);
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${styles.tracker}`}>
      <h1 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-[40px] font-extrabold tracking-tight text-center mb-12">
        Track Your Order
      </h1>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter your order number"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className={`${plexMono.className} w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-gold/70 transition-shadow`}
          />
        </div>
        <button
          type="submit"
          disabled={!value.trim()}
          className={`${styles.trackButton} px-6 py-3 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50`}
        >
          Track
        </button>
      </form>
    </div>
  );
}

/* ── Engrave preview ──────────────────────────────────────────────────
   A laser can't print color: the card shows the design as the machine
   would cut it. We reuse the design studio's pipeline — threshold the
   artwork into an engrave mask, then composite it on coated metal.
   Material comes from the item description: stainless = dark marks on
   steel; everything else = exposed silver on black anodized. Artwork
   that is already a white-on-transparent engrave mask (design studio
   exports) is detected and inverted so it doesn't vanish. */

function isStainless(itemDescription: string): boolean {
  return (
    /stainless|steel/i.test(itemDescription) &&
    !/anodiz|black/i.test(itemDescription)
  );
}

export type CardMaterial = "steel" | "anodized" | "brass";

const MATERIAL_COLORS: Record<CardMaterial, [string, string]> = {
  anodized: ["#1a1a1a", "#c0c0c0"], // black coating, exposed silver
  steel: ["#c9c8c4", "#42413e"], // steel base, dark laser marks
  brass: ["#d9c485", "#57431c"], // brass base, dark engraving
};

function useEngravePreview(
  designUrl: string | null | undefined,
  material: CardMaterial
) {
  const [result, setResult] = useState<{
    for: string;
    url: string;
    aspect: number;
  } | null>(null);

  useEffect(() => {
    if (!designUrl) return;
    let alive = true;

    const img = new Image();
    img.onload = async () => {
      try {
        // Detect designs that are already engrave masks: nearly all
        // opaque pixels near-white → threshold would erase them.
        const probe = document.createElement("canvas");
        probe.width = 128;
        probe.height = 128;
        const pctx = probe.getContext("2d")!;
        pctx.drawImage(img, 0, 0, 128, 128);
        const pd = pctx.getImageData(0, 0, 128, 128).data;
        const total = pd.length / 4;
        let opaque = 0;
        let white = 0;
        let dark = 0;
        for (let i = 0; i < pd.length; i += 4) {
          if (pd[i + 3] < 10) continue;
          opaque++;
          const gray = 0.299 * pd[i] + 0.587 * pd[i + 1] + 0.114 * pd[i + 2];
          if (gray > 200) white++;
          if (gray < 128) dark++;
        }
        const alreadyMask = opaque > 0 && white / opaque > 0.95;
        // Engraving covers the design, not most of the card: if the
        // threshold would cut the majority of the surface, flip it.
        const majorityEngraved = dark / total > 0.5;

        // Full-bleed card artwork: the CARD adopts the artwork's own
        // aspect ratio (clamped to plausible card shapes), then the
        // design is cover-fit with a 5% overscan — the bleed crop.
        // Exported card art routinely carries border strokes and crop
        // artifacts near its edges; without the crop they threshold
        // into engraved lines along the card.
        const fullBleed = opaque / total > 0.9;
        const imgAspect = img.width / img.height || 850 / 550;
        const canvasW = 850;
        const canvasH = fullBleed
          ? Math.round(850 / Math.min(2.1, Math.max(1.3, imgAspect)))
          : 550;

        let sourceImg = img;
        if (fullBleed) {
          const c = document.createElement("canvas");
          c.width = canvasW;
          c.height = canvasH;
          const cctx = c.getContext("2d")!;
          // slim bare-metal margin, whole design shown — never cropped
          const pad = Math.round(canvasW * 0.03);
          const contentW = canvasW - pad * 2;
          const contentH = canvasH - pad * 2;
          const scale = Math.min(contentW / img.width, contentH / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          cctx.drawImage(img, pad + (contentW - w) / 2, pad + (contentH - h) / 2, w, h);
          sourceImg = await new Promise<HTMLImageElement>((res, rej) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = () => rej(new Error("recanvas failed"));
            i.src = c.toDataURL("image/png");
          });
        }

        const mask = processDesign(sourceImg, {
          invert: alreadyMask || majorityEngraved,
          outputWidth: canvasW,
          outputHeight: canvasH,
        });
        const [cardColor, markColor] = MATERIAL_COLORS[material];
        // square corners (CSS rounds them) and gentle texture — the
        // studio's row-noise aliases into visible bands at card size
        const url = await generate2DPreview(
          mask,
          cardColor,
          markColor,
          0,
          0.3,
          canvasW,
          canvasH
        );
        if (alive) setResult({ for: designUrl, url, aspect: canvasW / canvasH });
      } catch {
        // canvas failed (tainted/odd SVG) — fall back to raw artwork
        if (alive) setResult({ for: designUrl, url: designUrl, aspect: 850 / 550 });
      }
    };
    img.onerror = () => {
      if (alive) setResult({ for: designUrl, url: designUrl, aspect: 850 / 550 });
    };
    img.src = designUrl;

    return () => {
      alive = false;
    };
  }, [designUrl, material]);

  return result && result.for === designUrl ? result : null;
}

/* ── Details view: driven by the order number in the URL ─────────── */

export function OrderDetails({
  trackingNumber,
  override,
  look,
}: {
  trackingNumber: string;
  // Dev preview: render this order/timeline instead of fetching
  override?: { order: OrderInfo; events: OrderEvent[] } | null;
  look?: TrackerLook;
}) {
  const [fetched, setFetched] = useState<{
    order: OrderInfo;
    events: OrderEvent[];
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (override) return;
    let alive = true;

    fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!alive) return;
        if (!res.ok || data.error) {
          setError(data.error || "Could not look up that order number.");
        } else {
          setFetched({ order: data.order, events: data.events || [] });
        }
      })
      .catch(() => {
        if (alive) setError("Could not track order. Please try again.");
      });

    return () => {
      alive = false;
    };
  }, [trackingNumber, override]);

  const order = override ? override.order : fetched?.order;
  const events = override ? override.events : (fetched?.events ?? []);
  const material: CardMaterial =
    look?.plateStyle ??
    (isStainless(order?.itemDescription ?? "") ? "steel" : "anodized");
  const engravePreview = useEngravePreview(order?.designUrl, material);

  const cancelled = order?.status === "cancelled";
  const delivered = order?.status === "delivered";
  const currentStep = order
    ? STEPS.findIndex((s) => s.status === order.status)
    : -1;

  const showScrews = look?.screws ?? false;
  const showBeamEdge = look?.beamEdge ?? false;
  const plateClass =
    look?.plateStyle === "anodized"
      ? styles.plateAnodized
      : look?.plateStyle === "brass"
        ? styles.plateBrass
        : "";
  const lookVars = {
    ...(look?.laserColor ? { "--laser": look.laserColor } : {}),
    ...(look?.glow !== undefined ? { "--glow": look.glow } : {}),
    ...(look?.sparkSpeed !== undefined ? { "--spark-s": `${look.sparkSpeed}s` } : {}),
    ...(look?.pulseSpeed !== undefined ? { "--pulse-s": `${look.pulseSpeed}s` } : {}),
    ...(look?.engraveDepth !== undefined ? { "--engrave": `${look.engraveDepth}px` } : {}),
    ...(look?.cardRadius !== undefined ? { "--card-r": `${look.cardRadius}px` } : {}),
  } as React.CSSProperties;

  const loading = !override && !fetched && !error;

  const header = (
    <>
      <h1 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-[40px] font-extrabold tracking-tight text-center">
        Order {(order?.trackingNumber ?? trackingNumber).toUpperCase()}
      </h1>
      <div className="w-full flex mt-2">
        <Link
          href="/track"
          className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
        >
          <span aria-hidden>&lsaquo;</span> Back
        </Link>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className={`w-full max-w-2xl mx-auto ${styles.tracker}`}>
        {header}
        <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className={`${plexMono.className} text-sm tracking-widest uppercase`}>
            Locating {trackingNumber}
          </span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={`w-full max-w-2xl mx-auto ${styles.tracker}`}>
        {header}
        <div className={`${styles.reveal} mt-8 p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center`}>
          <p className="text-sm text-red-500">
            {error || "No order found with that number."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-2xl mx-auto ${styles.tracker}`}
      style={lookVars}
    >
      {header}
      <div className="space-y-4 mt-8" key={order.trackingNumber + order.status}>
        {/* Job Ticket */}
        <div className={`${styles.reveal} ${styles.card} bg-card border border-border overflow-hidden`}>
          {showBeamEdge && <div className={styles.beamEdge} />}
          <div className="p-6 flex flex-col sm:flex-row gap-5 items-start">
            {order.designUrl ? (
              <div
                className={`${styles.jobCardWrap} w-full sm:w-[360px] shrink-0`}
                style={engravePreview ? { aspectRatio: `${engravePreview.aspect}` } : undefined}
              >
                {engravePreview && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={engravePreview.url}
                    alt=""
                    aria-hidden
                    className={styles.jobCardAmbient}
                  />
                )}
                <div
                  className={`${styles.jobCard} ${
                    material === "steel"
                      ? styles.jobCardSteel
                      : material === "brass"
                        ? styles.jobCardBrass
                        : ""
                  }`}
                >
                  {engravePreview && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={engravePreview.url}
                      alt={`Engraving preview for ${order.trackingNumber}`}
                      className={styles.jobCardFace}
                    />
                  )}
                  <div className={styles.jobCardTexture} />
                  <div className={styles.jobCardGloss} />
                  {look?.sheen !== false && <div className={styles.jobCardSheen} />}
                  <div className={styles.jobCardRim} />
                  <span
                    className={`${plexMono.className} ${styles.stamp} ${styles.stampFloating} ${
                      cancelled ? styles.stampCancelled : ""
                    } text-[11px] font-semibold uppercase`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
            ) : (
              <div
                className={`${styles.plate} ${plateClass} ${
                  look?.sheen === false ? styles.plateStill : ""
                } w-full sm:w-[360px] h-[215px] shrink-0 flex flex-col gap-2`}
              >
                  {showScrews && (
                    <>
                      <span className={styles.screw} style={{ top: 7, left: 7 }} />
                      <span className={styles.screw} style={{ top: 7, right: 7 }} />
                      <span className={styles.screw} style={{ bottom: 7, left: 7 }} />
                      <span className={styles.screw} style={{ bottom: 7, right: 7 }} />
                    </>
                  )}
                  <p className={`${plexMono.className} ${styles.plateLabel} text-[10px] font-medium uppercase`}>
                    Laser Yard · Job Ticket
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className={`${plexMono.className} ${styles.engraved} text-[26px] leading-8 font-semibold`}>
                      {order.trackingNumber}
                    </h3>
                    <span
                      className={`${plexMono.className} ${styles.stamp} ${
                        cancelled ? `${styles.stampCancelled} text-red-600` : ""
                      } ${delivered ? "text-gold-dark" : ""} ${
                        !cancelled && !delivered ? styles.stampNeutral : ""
                      } text-[11px] font-semibold uppercase shrink-0`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
              </div>
            )}

            <div className="flex flex-col gap-6 text-sm flex-1">
              <div className="flex flex-col gap-1">
                <p className={`${plexMono.className} text-[10px] uppercase tracking-[0.2em] text-muted-foreground`}>
                  Order
                </p>
                <p className="font-medium">{order.itemDescription}</p>
                <p className="text-muted-foreground text-xs">
                  for {order.customerName}
                  {order.destination ? ` · ${order.destination}` : ""}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className={`${plexMono.className} text-[10px] uppercase tracking-[0.2em] text-muted-foreground`}>
                  Placed
                </p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Laser Stepper */}
        {!cancelled && (
          <div className={`${styles.reveal} ${styles.revealDelay1} ${styles.card} p-6 bg-card border border-border shadow-sm`}>
            <div className="flex items-start">
              {STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep && !delivered;
                const Icon = step.icon;
                return (
                  <div
                    key={step.status}
                    className="flex-1 flex flex-col items-center relative"
                  >
                    {i > 0 && (
                      <div className="absolute top-4 right-1/2 w-full h-[3px] -mt-px overflow-visible rounded-full">
                        <div
                          className={`h-full w-full rounded-full ${
                            done ? styles.trackDone : styles.trackTodo
                          }`}
                        />
                        {active && <span className={styles.spark} />}
                      </div>
                    )}
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                        active
                          ? styles.nodeActive
                          : done
                            ? delivered && i === STEPS.length - 1
                              ? styles.nodeFinal
                              : "bg-foreground text-background"
                            : "bg-card border border-border text-foreground/40"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <p
                      className={`mt-2 text-[11px] sm:text-xs text-center leading-tight ${
                        active
                          ? "font-semibold"
                          : done
                            ? "text-foreground/70"
                            : "text-muted-foreground/60"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Job Log */}
        {events.length > 0 && (
          <div className={`${styles.reveal} ${styles.revealDelay2} ${styles.card} p-6 bg-card border border-border shadow-sm`}>
            <p className={`${plexMono.className} text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6`}>
              Job Log
            </p>
            <div className="space-y-0">
              {events.map((entry, i) => {
                const Icon = statusIcon(entry.status);
                const latest = i === 0;
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          latest
                            ? `bg-foreground text-background ${
                                entry.status === "cancelled"
                                  ? styles.logLatestDotCancelled
                                  : styles.logLatestDot
                              }`
                            : "bg-foreground/10 text-foreground/60"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {i < events.length - 1 && <div className={styles.rail} />}
                    </div>

                    <div className={i === events.length - 1 ? "pb-0" : "pb-6"}>
                      <p className="font-medium text-sm">
                        {STATUS_LABELS[entry.status] ?? entry.status}
                      </p>
                      {entry.note && (
                        <p className="text-muted-foreground text-xs mt-1">
                          {entry.note}
                        </p>
                      )}
                      <p className={`${plexMono.className} text-muted-foreground/70 text-[11px] mt-1`}>
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
