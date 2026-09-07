"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Check,
  Ruler,
  Layers,
  Crosshair,
  Shield,
  ArrowRight,
  PenTool,
  Loader2,
} from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { cn } from "@/lib/utils";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTABanner } from "@/components/sections/CTABanner";
import {
  ShippingEstimator,
  type DeliverySelection,
} from "@/components/shipping/ShippingEstimator";
import {
  PENDING_CHECKOUT_KEY,
  type PendingCheckout,
} from "@/components/payments/CardsCheckout";
import {
  CARD_PRICING,
  CARD_QUANTITIES,
  CARD_COLORS,
  DESIGN_FEE_USD,
  designIncluded,
  WHATSAPP_NUMBER,
  type CardQuantity,
  type CardColor,
} from "@/lib/constants";
import { trackBeginCheckout, trackViewProduct } from "@/lib/analytics";

const specs = [
  { label: "Material", value: "Premium Anodized Aluminum" },
  { label: "Thickness", value: "0.8mm — heavy, rigid, executive feel" },
  { label: "Standard Size", value: "86mm × 54mm" },
  { label: "Colors", value: "11 anodized colors, matte finish" },
  { label: "Minimum Order", value: "15 cards" },
  { label: "Production Time", value: "10-14 business days after approval" },
];

const features = [
  {
    icon: Layers,
    title: "Anodized Aluminum",
    description: "0.8mm premium stock in 11 anodized colors",
  },
  {
    icon: Crosshair,
    title: "Laser Precision",
    description: "Micron-level engraving accuracy",
  },
  {
    icon: Shield,
    title: "Weather Resistant",
    description: "Won't fade, rust, or deteriorate",
  },
  {
    icon: Ruler,
    title: "Standard Size",
    description: "Fits any wallet or card holder",
  },
];

const galleryImages = [
  {
    src: "/images/products/blac_card_product_photo_whitebackground.png",
    alt: "Matte black laser-engraved metal business card, angled view",
  },
  {
    src: "/images/products/card_whitebackground_product_photo_1.png",
    alt: "Silver laser-engraved metal business card",
  },
  {
    src: "/images/products/card_whitebackground_product_photo_2.png",
    alt: "Back of metal business card with contact details",
  },
  {
    src: "/images/products/front_and back_blac_card_product_photo_whitebackground.png",
    alt: "Front and back of matte black metal business card",
  },
];

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow";

// We only ask for the email (Whop's API doesn't hand it back to us, and the
// order confirmation needs it) plus an optional phone for the courier. Name
// and delivery address are typed once, on Whop's checkout form, and reach
// the order via the payment webhook. The email is prefilled into that form.
const EMPTY_SHIPPING = {
  email: "",
  phone: "",
};

const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

// Blend a hex color toward a target (0..1) — used to shade the anodized card.
function mixHex(hex: string, target: string, ratio: number): string {
  const h = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [a, b] = [h(hex), h(target)];
  return `#${a
    .map((v, i) =>
      Math.round(v + (b[i] - v) * ratio)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Generated product visual: a laser-engraved sample card in the selected
// anodized color (our own render — no supplier imagery).
function CardPreview({ color }: { color: CardColor }) {
  const light = mixHex(color.swatch, "#ffffff", 0.38);
  const dark = mixHex(color.swatch, "#000000", 0.32);
  const edge = mixHex(color.swatch, "#000000", 0.5);
  // The laser reveals silver on dark stock; on light stock the engraving
  // reads darker — pick whichever contrasts with the card color.
  const engrave = luminance(color.swatch) > 0.55 ? "#4b4e53" : "#d9dbde";
  return (
    <div className="w-full aspect-[4/3] flex items-center justify-center">
      <svg
        viewBox="0 0 430 270"
        role="img"
        aria-label={`${color.label} anodized metal business card preview`}
        className="w-[80%] drop-shadow-xl"
      >
        <defs>
          <linearGradient id={`body-${color.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={light} />
            <stop offset="0.45" stopColor={color.swatch} />
            <stop offset="1" stopColor={dark} />
          </linearGradient>
          <linearGradient id={`sheen-${color.id}`} x1="0" y1="0" x2="0.7" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g transform="rotate(-3 215 135)">
          <rect
            x="15"
            y="15"
            width="400"
            height="240"
            rx="16"
            fill={`url(#body-${color.id})`}
            stroke={edge}
            strokeOpacity="0.6"
          />
          <rect
            x="15"
            y="15"
            width="400"
            height="240"
            rx="16"
            fill={`url(#sheen-${color.id})`}
          />
          {/* The "Alex Carter" sample layout — the same design the
              per-color product photos reproduce (tools/reference-card-design.svg) */}
          <g fill={engrave} fontFamily="var(--font-montserrat), system-ui, sans-serif">
            <circle
              cx="67"
              cy="72"
              r="19"
              fill="none"
              stroke={engrave}
              strokeWidth="2.5"
            />
            <text x="67" y="77" textAnchor="middle" fontSize="14" fontWeight="600" letterSpacing="1">
              AC
            </text>
            <text x="48" y="152" fontSize="28" fontWeight="600" letterSpacing="6">
              ALEX CARTER
            </text>
            <text x="48" y="178" fontSize="12" letterSpacing="4" fillOpacity="0.85">
              FOUNDER &amp; CEO
            </text>
            <line x1="48" y1="197" x2="206" y2="197" stroke={engrave} strokeOpacity="0.5" />
            <text x="48" y="220" fontSize="11" letterSpacing="1.5" fillOpacity="0.8">
              +1 415 000 0000 · alexcarter.com
            </text>
            <g stroke={engrave} fill="none" strokeWidth="2">
              <rect x="332" y="176" width="46" height="46" rx="5" />
              <rect x="340" y="184" width="10" height="10" />
              <rect x="360" y="184" width="10" height="10" />
              <rect x="340" y="204" width="10" height="10" />
              <path d="M360 204 h10 M365 204 v10" strokeWidth="2.5" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

// Per-color product photo (the fanned-stack shot) found under
// public/images/products/colors/ at build time — page.tsx checks the
// filesystem. A color without a photo shows the generated preview instead.
export type ColorPhotos = Partial<Record<CardColor["id"], string>>;

export function ProductPage({ colorPhotos = {} }: { colorPhotos?: ColorPhotos }) {
  const [selectedColor, setSelectedColor] = useState<CardColor>(CARD_COLORS[0]);
  const [selectedQuantity, setSelectedQuantity] = useState<CardQuantity>(15);
  const [wantsDesignService, setWantsDesignService] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [delivery, setDelivery] = useState<DeliverySelection | null>(null);
  const [ship, setShip] = useState(EMPTY_SHIPPING);
  const setShipField =
    (key: keyof typeof EMPTY_SHIPPING) => (e: ChangeEvent<HTMLInputElement>) =>
      setShip((s) => ({ ...s, [key]: e.target.value }));
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const deliveryRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // The sticky order bar only shows while the in-page checkout button is
  // scrolled out of view — once the real button is visible, the bar slides
  // away. Starts "visible" so the bar doesn't flash in before the first check.
  const ctaRef = useRef<HTMLButtonElement>(null);
  const [ctaVisible, setCtaVisible] = useState(true);
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setCtaVisible(entry.isIntersecting),
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleDeliveryChange = useCallback(
    (d: DeliverySelection | null) => setDelivery(d),
    []
  );

  useEffect(() => {
    trackViewProduct("Metal Business Cards", CARD_PRICING["0.8mm"].prices[15]);
  }, []);

  const pricing = CARD_PRICING["0.8mm"];
  const cardsSubtotal = pricing.prices[selectedQuantity];
  const freeDesign = designIncluded(selectedQuantity);
  const designFee = !freeDesign && wantsDesignService ? DESIGN_FEE_USD : 0;
  const total = cardsSubtotal + designFee;
  const designService: PendingCheckout["designService"] = freeDesign
    ? "included"
    : wantsDesignService
      ? "paid"
      : "none";

  // Creates the server-priced Whop session, then hands off to the checkout
  // page so the customer sees their summary next to Whop's form.
  const proceedToCheckout = async () => {
    setCheckoutError("");
    if (!delivery) {
      setCheckoutError("Select your delivery destination first.");
      deliveryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!ship.email.includes("@")) {
      setCheckoutError("Add your email so we can send your order confirmation.");
      emailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      emailRef.current?.focus();
      return;
    }
    setCheckingOut(true);
    trackBeginCheckout(total);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "usd",
          metadata: {
            thickness: "0.8mm",
            color: selectedColor.label,
            quantity: String(selectedQuantity),
            designService,
            deliveryDestination: delivery.destination,
            email: ship.email,
            phone: ship.phone,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error || !data.sessionId) {
        setCheckoutError(data.error || "Could not start checkout. Please try again.");
        return;
      }
      const pending: PendingCheckout = {
        sessionId: data.sessionId,
        purchaseUrl: data.purchaseUrl,
        amount: typeof data.amount === "number" ? data.amount : total,
        email: ship.email,
        quantity: selectedQuantity,
        color: selectedColor.label,
        designService,
        destination: delivery.destination,
        createdAt: Date.now(),
      };
      try {
        sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(pending));
      } catch {
        setCheckoutError("Your browser blocked the checkout hand-off. Please enable site storage and try again.");
        return;
      }
      router.push("/checkout/cards");
    } catch {
      setCheckoutError("Could not start checkout. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  // Gallery: the selected color's stack photo leads (the generated preview
  // stands in until a photo exists), then the studio photos.
  const colorPhoto = colorPhotos[selectedColor.id];
  const slides: Array<
    { kind: "preview" } | { kind: "image"; src: string; alt: string }
  > = [
    colorPhoto
      ? {
          kind: "image",
          src: colorPhoto,
          alt: `Stack of ${selectedColor.label} 0.8mm metal business cards`,
        }
      : { kind: "preview" },
    ...galleryImages.map((g) => ({ kind: "image" as const, ...g })),
  ];
  const active = slides[Math.min(activeImage, slides.length - 1)];

  return (
    <>
      <section className="pt-40 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Metal Business Cards</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Gallery */}
            <ScrollReveal direction="left">
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative rounded-2xl bg-card border border-border overflow-hidden safari-fix-overflow">
                  {active.kind === "preview" ? (
                    <CardPreview color={selectedColor} />
                  ) : (
                    <img src={active.src} alt={active.alt} className="w-full" />
                  )}
                </div>

                {/* Thumbnails */}
                <div
                  className={cn(
                    "grid gap-3",
                    slides.length > 5 ? "grid-cols-6" : "grid-cols-5"
                  )}
                >
                  {slides.map((slide, index) => (
                    <button
                      key={slide.kind === "preview" ? "preview" : slide.src}
                      onClick={() => setActiveImage(index)}
                      aria-label={
                        slide.kind === "preview"
                          ? `${selectedColor.label} card preview`
                          : slide.alt
                      }
                      className={cn(
                        "aspect-square rounded-lg border-2 transition-all bg-card overflow-hidden flex items-center justify-center",
                        activeImage === index
                          ? "border-foreground"
                          : "border-border hover:border-foreground/30"
                      )}
                    >
                      {slide.kind === "preview" ? (
                        <CardPreview color={selectedColor} />
                      ) : (
                        <img
                          src={slide.src}
                          alt={slide.alt}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Product Info */}
            <ScrollReveal direction="right">
              <div className="lg:sticky lg:top-32 space-y-8 lg:px-8">
                <div>
                  <h1 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                    Premium Metal Business Cards
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Laser-engraved 0.8mm anodized aluminum cards in 11 colors.
                    Heavy, cold to the touch, and impossible to throw away.
                    Every price includes worldwide shipping.
                  </p>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Choose Your Color
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      — {selectedColor.label}
                    </span>
                  </label>
                  <div className="grid grid-cols-6 gap-2.5 w-fit">
                    {CARD_COLORS.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => {
                          setSelectedColor(color);
                          setActiveImage(0);
                        }}
                        title={color.label}
                        aria-label={`${color.label} card`}
                        aria-pressed={selectedColor.id === color.id}
                        className={cn(
                          "w-9 h-9 rounded-full transition-all duration-150",
                          selectedColor.id === color.id
                            ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
                            : "ring-1 ring-black/15 dark:ring-white/20 hover:scale-110"
                        )}
                        style={{
                          background: `linear-gradient(135deg, color-mix(in srgb, ${color.swatch}, white 40%), ${color.swatch} 45%, color-mix(in srgb, ${color.swatch}, black 30%))`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Card Quantity
                  </label>
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {CARD_QUANTITIES.map((qty) => (
                      <button
                        key={qty}
                        onClick={() => setSelectedQuantity(qty)}
                        className={cn(
                          "relative p-3 rounded-xl border-2 text-center transition-all",
                          selectedQuantity === qty
                            ? "border-foreground bg-foreground/5"
                            : "border-border hover:border-foreground/30"
                        )}
                      >
                        <p className="font-semibold">{qty}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    All prices include worldwide shipping. Need a different
                    quantity or something custom?{" "}
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I'd like a custom quote for metal business cards.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground transition-colors"
                    >
                      Get a custom quote
                    </a>
                    .
                  </p>
                </div>

                {/* Design Service */}
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Design
                  </label>
                  {freeDesign ? (
                    <div className="flex items-center gap-2.5 p-4 rounded-xl border-2 border-border">
                      <PenTool className="w-4 h-4 text-gold flex-shrink-0" />
                      <p className="text-sm">
                        Professional design service{" "}
                        <span className="text-gold font-semibold">
                          included free
                        </span>{" "}
                        — send us your logo, or bring your own print-ready
                        design.
                      </p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setWantsDesignService(!wantsDesignService)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all",
                          wantsDesignService
                            ? "border-foreground bg-foreground/5"
                            : "border-border hover:border-foreground/30"
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                              wantsDesignService
                                ? "bg-foreground border-foreground"
                                : "border-border"
                            )}
                          >
                            {wantsDesignService && (
                              <Check className="w-3.5 h-3.5 text-background" />
                            )}
                          </span>
                          <span className="text-sm font-medium">
                            Add our design service
                          </span>
                        </span>
                        <span className="text-sm font-semibold">
                          +{formatUsd(DESIGN_FEE_USD)}
                        </span>
                      </button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Or{" "}
                        <button
                          onClick={() => setSelectedQuantity(30)}
                          className="underline hover:text-foreground transition-colors"
                        >
                          go for 30+ cards
                        </button>{" "}
                        and design is included free.
                      </p>
                    </>
                  )}
                </div>

                {/* Delivery */}
                <div ref={deliveryRef}>
                  <ShippingEstimator onDeliveryChange={handleDeliveryChange} />
                </div>

                {/* Contact details */}
                <div className="p-5 rounded-xl bg-card border border-border">
                  <label className="text-sm font-medium mb-3 block">
                    Your Email
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      ref={emailRef}
                      className={inputCls}
                      type="email"
                      placeholder="Email *"
                      autoComplete="email"
                      value={ship.email}
                      onChange={setShipField("email")}
                    />
                    <input
                      className={inputCls}
                      type="tel"
                      placeholder="Phone (optional, for the courier)"
                      autoComplete="tel"
                      value={ship.phone}
                      onChange={setShipField("phone")}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    For your order confirmation and tracking link. Your name
                    and delivery address are entered once, on the secure
                    checkout page.
                  </p>
                </div>

                {/* Order Summary */}
                <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {selectedQuantity} cards · {selectedColor.label} (0.8mm)
                    </span>
                    <span className="font-semibold">
                      {formatUsd(cardsSubtotal)}
                    </span>
                  </div>
                  {designFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Design service
                      </span>
                      <span className="font-semibold">
                        {formatUsd(designFee)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {delivery
                        ? `Delivery to ${delivery.destination}`
                        : "Worldwide delivery"}
                    </span>
                    <span className="font-semibold text-gold">Included</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold text-lg">
                      {formatUsd(total)}
                    </span>
                  </div>
                  {!delivery && (
                    <p className="text-sm text-muted-foreground">
                      Select your delivery destination above to check out.
                    </p>
                  )}
                </div>

                {/* CTA */}
                <div className="space-y-3">
                  <button
                    ref={ctaRef}
                    onClick={proceedToCheckout}
                    disabled={checkingOut}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-foreground text-background font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {checkingOut ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Preparing…
                      </>
                    ) : (
                      <>
                        Proceed to checkout · {formatUsd(total)}
                        <ArrowRight className="size-5" />
                      </>
                    )}
                  </button>
                  {checkoutError && (
                    <p className="text-sm text-red-500">{checkoutError}</p>
                  )}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'm interested in ordering ${selectedQuantity} metal business cards (0.8mm, ${selectedColor.label}). Can you help me with pricing and the design process?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all group"
                  >
                    Need a custom quote? Chat on WhatsApp
                    <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-foreground/5 dark:bg-background/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-foreground/70" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-montserrat)] text-2xl sm:text-3xl font-bold tracking-tight mb-8">
              Specifications
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {specs.map((spec, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <p className="text-sm text-muted-foreground mb-1">
                    {spec.label}
                  </p>
                  <p className="font-semibold">{spec.value}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <FAQAccordion />
      <CTABanner />

      {/* Sticky order bar: keeps the running total + checkout in reach while
          the in-page button is scrolled out of view; slides away otherwise */}
      <div className="h-28 sm:h-32" aria-hidden />
      <div
        aria-hidden={ctaVisible}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out",
          ctaVisible ? "translate-y-full pointer-events-none" : "translate-y-0"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between gap-4 sm:gap-8">
          <div className="min-w-0">
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              {selectedQuantity} × {selectedColor.label} · 0.8mm ·{" "}
              {designFee > 0
                ? "design service"
                : freeDesign
                  ? "design included"
                  : "your own design"}{" "}
              · shipping included
            </p>
            <p className="leading-tight">
              <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground mr-2">
                Total
              </span>
              <span className="font-[family-name:var(--font-montserrat)] font-bold text-2xl sm:text-3xl">
                {formatUsd(total)}
              </span>
            </p>
            {checkoutError && (
              <p className="text-sm text-red-500 mt-1">{checkoutError}</p>
            )}
          </div>
          <button
            onClick={proceedToCheckout}
            disabled={checkingOut}
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 py-4 px-6 sm:px-9 rounded-full bg-foreground text-background font-semibold text-base sm:text-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {checkingOut ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Preparing…
              </>
            ) : (
              <>
                Proceed to checkout
                <ArrowRight className="size-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
