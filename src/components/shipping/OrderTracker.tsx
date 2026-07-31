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
  ExternalLink,
  Copy,
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
  // Shipment details, maintained by us — only set once the parcel is
  // handed over. The waybill is the courier's number.
  carrier?: string | null;
  waybillNumber?: string | null;
  shipmentStatus?: string | null;
  shipmentDetail?: string | null;
  estimatedDelivery?: string | null;
  carrierUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

const CARRIER_LABELS: Record<string, string> = {
  dhl: "DHL",
  fedex: "FedEx",
  ups: "UPS",
  fez: "Fez Delivery",
  other: "Courier",
};

export type OrderFeedbackInfo = {
  rating: number;
  comment: string | null;
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

// Estimated delivery is a bare calendar date (YYYY-MM-DD). Parsing it with
// Date() would treat it as UTC midnight and shift a day west of Greenwich,
// so build the date from its parts instead.
function formatDay(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// A timestamp shown as a plain calendar day. The delivered date sits next to
// the estimate, which has no time, so the two should read alike — and the
// minute a parcel landed is noise the customer does not need.
function formatDayOf(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

/* ── Shipped hero: a delivery truck carrying the engraved card ─────
   Drawn rather than photographed so it inherits the page's ink and gold
   and stays crisp at any size. Motion lines to the left read as travel. */

function TruckWithCard() {
  return (
    <svg
      width="196"
      height="121"
      viewBox="0 0 104 64"
      fill="none"
      role="img"
      aria-label="Your order on its way"
      className="max-w-full h-auto"
    >
      <path d="M2 22h14" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 32h10" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M2 42h14" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 12h40v34H24z" className="fill-card" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      {/* the metal card riding on the truck's side panel */}
      <rect x="30" y="19" width="28" height="19" rx="2.5" fill="currentColor" />
      <path d="M35 26h13" stroke="#EEC335" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M35 31h8" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" className="stroke-card" />
      <path d="M64 24h11l10 11v11H64z" className="fill-card" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M67 27h6.5l6 7H67z" fill="currentColor" />
      <path d="M20 46h68" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="38" cy="50" r="6" className="fill-card" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="74" cy="50" r="6" className="fill-card" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

/* ── Copy-to-clipboard for the waybill ───────────────────────────── */

/* ── Feedback: shown once an order is delivered ───────────────────── */

function FeedbackStars({
  value,
  hovered,
  onPick,
  onHover,
  disabled,
}: {
  value: number;
  hovered: number;
  onPick: (n: number) => void;
  onHover: (n: number) => void;
  disabled?: boolean;
}) {
  // Hover previews the rating, but only as a hint — the committed value is
  // what shows when the pointer leaves, and touch users never hover at all.
  const shown = hovered || value;
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => onHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onPick(n)}
          onMouseEnter={() => onHover(n)}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          aria-pressed={value === n}
          className="p-0.5 rounded transition-transform hover:scale-110 disabled:cursor-default disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
        >
          <svg
            viewBox="0 0 20 20"
            fill={n <= shown ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={n <= shown ? 0 : 1.5}
            className={`w-7 h-7 transition-colors ${
              n <= shown ? "text-amber-400" : "text-muted-foreground/30"
            }`}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

const RATING_WORDS: Record<number, string> = {
  1: "Not what you hoped for",
  2: "Below par",
  3: "Fine",
  4: "Good",
  5: "Exactly right",
};

function FeedbackPanel({
  trackingNumber,
  existing,
}: {
  trackingNumber: string;
  existing: OrderFeedbackInfo | null;
}) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Submitted in this session, as opposed to loaded from a past visit —
  // only the former earns a thank-you.
  const [justSaved, setJustSaved] = useState(false);
  const [editing, setEditing] = useState(!existing);

  const submit = async () => {
    if (rating < 1) {
      setError("Pick a rating first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNumber,
          rating,
          comment: comment.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not save your feedback.");
        return;
      }
      setJustSaved(true);
      setEditing(false);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-base font-semibold">
          {justSaved ? "Thank you — we've got it." : "Your feedback"}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <FeedbackStars
            value={rating}
            hovered={0}
            onPick={() => {}}
            onHover={() => {}}
            disabled
          />
          <span className="text-muted-foreground text-sm">
            {RATING_WORDS[rating]}
          </span>
        </div>
        {comment.trim() && (
          <p className="text-muted-foreground text-sm italic">
            “{comment.trim()}”
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setEditing(true);
            setJustSaved(false);
          }}
          className="self-start text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
        >
          Change my feedback
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold">How did we do?</p>
        <p className="text-muted-foreground text-xs">
          Your order arrived — we&apos;d love to know how it turned out. This
          goes straight to our team and isn&apos;t published anywhere.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <FeedbackStars
          value={rating}
          hovered={hovered}
          onPick={(n) => {
            setRating(n);
            setError(null);
          }}
          onHover={setHovered}
        />
        {(hovered || rating) > 0 && (
          <span className="text-muted-foreground text-sm">
            {RATING_WORDS[hovered || rating]}
          </span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Anything you'd like to tell us? (optional)"
        className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30 transition-colors resize-y"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:border-foreground/30 disabled:opacity-60 transition-colors"
        >
          {saving ? "Sending…" : existing ? "Update feedback" : "Send feedback"}
        </button>
        {existing && (
          <button
            type="button"
            onClick={() => {
              setRating(existing.rating);
              setComment(existing.comment ?? "");
              setEditing(false);
              setError(null);
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard
          ?.writeText(value)
          .then(() => setCopied(true))
          .catch(() => {});
      }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" /> Copied
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" /> Copy
        </>
      )}
    </button>
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
    feedback?: OrderFeedbackInfo | null;
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
          setFetched({
            order: data.order,
            events: data.events || [],
            feedback: data.feedback ?? null,
          });
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
  // When it actually arrived, not when we guessed it would. The estimate is
  // a forecast made at dispatch and is routinely wrong by the time the
  // parcel lands, so once there is a real delivered event we show that.
  // Events arrive newest-first, so the first match is the latest delivery —
  // a re-delivery supersedes an earlier attempt.
  const deliveredAt = delivered
    ? (events.find((e) => e.status === "delivered")?.createdAt ?? null)
    : null;
  // Tracking only makes sense once the parcel has left us.
  const shipped = order?.status === "shipped" || delivered;
  const carrierName = order?.carrier
    ? (CARRIER_LABELS[order.carrier] ?? "the courier")
    : "the courier";
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
            {shipped ? (
              /* Once it ships, the parcel in motion is the story — the
                 truck carries the engraved card, so the hero says "on its
                 way" before a word is read. */
              <div className="w-full sm:w-[360px] shrink-0 flex flex-col items-center justify-center gap-4 py-7 px-5 rounded-xl bg-secondary/60 border border-border">
                <TruckWithCard />
                <div className="flex items-center gap-3">
                  <span
                    className={`${plexMono.className} text-sm font-semibold tracking-wider`}
                  >
                    {order.trackingNumber}
                  </span>
                  <span
                    className={`${plexMono.className} px-2.5 py-1 rounded-md border text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
                      delivered
                        ? "border-gold/40 text-gold-dark"
                        : "border-border text-foreground"
                    }`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
            ) : order.designUrl ? (
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
              {/* Shipment headline — only once the parcel is on its way.
                  These two fields describe the parcel in transit ("On the
                  way", "Departed our Lagos studio"), so once it has arrived
                  they are stale by definition and we state the arrival
                  instead of whatever the last transit update said. */}
              {shipped && (order.shipmentStatus || delivered) && (
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold">
                    {delivered ? "Delivered" : order.shipmentStatus}
                  </p>
                  {!delivered && order.shipmentDetail && (
                    <p className="text-muted-foreground text-xs">
                      {order.shipmentDetail}
                    </p>
                  )}
                </div>
              )}

              {/* Waybill: the courier's number, which is what a customer
                  needs to check the parcel on the courier's own site. It is
                  usually issued a little after we mark the order shipped. */}
              {shipped && (
                <div className="flex flex-col gap-1">
                  <p className={`${plexMono.className} text-[10px] uppercase tracking-[0.2em] text-muted-foreground`}>
                    Waybill Number
                    {order.carrier ? ` · ${carrierName}` : ""}
                  </p>
                  {order.waybillNumber ? (
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`${plexMono.className} text-base font-semibold tracking-wider break-all`}
                      >
                        {order.waybillNumber}
                      </span>
                      <CopyButton value={order.waybillNumber} />
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      Your waybill number will be available shortly.
                    </p>
                  )}
                </div>
              )}

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

              {/* Once the parcel has arrived an *estimate* is meaningless, so
                  we state when it actually landed. Falling back to the
                  estimate under a "Delivered" label would assert a date the
                  parcel never arrived on, so without a real event we simply
                  drop the row. */}
              {shipped && (deliveredAt || (!delivered && order.estimatedDelivery)) && (
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <span className="text-muted-foreground">
                    {deliveredAt ? "Delivered" : "Estimated delivery"}
                  </span>
                  <span className="font-semibold">
                    {deliveredAt
                      ? formatDayOf(deliveredAt)
                      : formatDay(order.estimatedDelivery!)}
                  </span>
                </div>
              )}

              {order.carrierUrl && order.waybillNumber && (
                <a
                  href={order.carrierUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors -mt-2"
                >
                  Check on {carrierName}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Laser Stepper */}
        {!cancelled && (
          <div className={`${styles.reveal} ${styles.revealDelay1} ${styles.card} p-6 bg-card border border-border shadow-sm`}>
            {/* vertical timeline on phones */}
            <div className="flex flex-col sm:hidden">
              {STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep && !delivered;
                const segDone = i + 1 <= currentStep;
                const segFeedsActive = i + 1 === currentStep && !delivered;
                const Icon = step.icon;
                return (
                  <div key={step.status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                      {i < STEPS.length - 1 && (
                        <div className="relative w-[3px] flex-1 min-h-7 my-1 rounded-full">
                          <div
                            className={`h-full w-full rounded-full ${
                              segDone ? styles.trackDoneV : styles.trackTodoV
                            }`}
                          />
                          {segFeedsActive && <span className={styles.sparkV} />}
                        </div>
                      )}
                    </div>
                    <p
                      className={`pt-1.5 ${i < STEPS.length - 1 ? "pb-5" : ""} text-sm ${
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

            {/* horizontal stepper on larger screens */}
            <div className="hidden sm:flex items-start">
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

        {/* Feedback — only worth asking once the order has actually landed.
            Suppressed in the dev preview, which has no order to post to. */}
        {delivered && !override && (
          <div className={`${styles.reveal} ${styles.revealDelay2} ${styles.card} p-6 bg-card border border-border shadow-sm`}>
            <FeedbackPanel
              trackingNumber={order.trackingNumber}
              existing={fetched?.feedback ?? null}
            />
          </div>
        )}

      </div>
    </div>
  );
}
