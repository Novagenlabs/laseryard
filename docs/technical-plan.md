# Technical Plan: Laser Yard Next.js Website

**A premium B2B storefront for metal business cards targeting West African corporate clients, with WhatsApp-driven conversational sales.**

This specification provides everything needed to build the Laser Yard website. The architecture prioritizes **mobile-first performance** (85%+ of West African traffic is mobile), **WhatsApp integration** as the primary conversion mechanism, and **premium visual presentation** through strategic use of Remotion video compositions and motion animations.

---

## Recommended tech stack with versions

The stack balances modern capabilities with aggressive performance optimization for slower African internet connections (8-15 Mbps average).

### Core framework

```json
{
  "next": "15.5.0",
  "react": "19.0.0",
  "react-dom": "19.0.0",
  "typescript": "5.6.0"
}
```

### UI and styling

```json
{
  "@shadcn/ui": "latest (CLI)",
  "tailwindcss": "4.0.0",
  "class-variance-authority": "0.7.0",
  "clsx": "2.1.0",
  "tailwind-merge": "2.5.0",
  "lucide-react": "0.460.0",
  "next-themes": "0.4.3"
}
```

### Animation

```json
{
  "motion": "12.31.0"
}
```

Motion (formerly Framer Motion) handles all micro-interactions, scroll animations, and page transitions. GSAP is not needed for this project scope.

### Remotion for product videos

```json
{
  "remotion": "4.0.417",
  "@remotion/player": "4.0.417",
  "@remotion/cli": "4.0.417"
}
```

Use exact versions (no `^`) to prevent version mismatches. All @remotion packages must match exactly.

### Forms and validation

```json
{
  "react-hook-form": "7.54.0",
  "zod": "3.24.0",
  "@hookform/resolvers": "3.9.0"
}
```

### SEO and analytics

```json
{
  "next-sitemap": "4.2.0",
  "schema-dts": "1.1.2"
}
```

### WhatsApp integration

No package needed—use native `wa.me` links with pre-filled messages. Optional floating widget via `react-floating-whatsapp` if persistent button desired.

---

## File and folder structure

```
laser-yard/
├── public/
│   ├── images/
│   │   ├── products/              # Product photography
│   │   │   ├── metal-card-hero.webp
│   │   │   ├── metal-card-02mm.webp
│   │   │   ├── metal-card-04mm.webp
│   │   │   └── card-detail-[1-6].webp
│   │   ├── process/               # Laser engraving process shots
│   │   ├── clients/               # Client logos (grayscale)
│   │   └── testimonials/          # Headshots for testimonials
│   ├── videos/
│   │   ├── card-spin-hero.mp4     # Pre-rendered Remotion video
│   │   └── engraving-process.mp4  # Pre-rendered process animation
│   ├── fonts/                     # Self-hosted fonts
│   ├── logo.svg
│   ├── og-image.jpg               # 1200x630 for social sharing
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with metadata
│   │   ├── page.tsx               # Homepage
│   │   ├── template.tsx           # Page transition animations
│   │   ├── globals.css            # Tailwind + custom CSS variables
│   │   ├── sitemap.ts             # Dynamic sitemap generation
│   │   ├── robots.ts              # robots.txt configuration
│   │   ├── (marketing)/           # Route group for marketing pages
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   ├── faq/
│   │   │   │   └── page.tsx
│   │   │   └── process/           # How laser engraving works
│   │   │       └── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx           # Product listing (single product showcase)
│   │   │   └── metal-business-cards/
│   │   │       └── page.tsx       # Main product page
│   │   ├── pricing/
│   │   │   └── page.tsx           # Detailed pricing tiers
│   │   ├── [country]/             # Country-specific landing pages
│   │   │   └── page.tsx           # nigeria, ghana, togo, benin
│   │   └── api/
│   │       └── og/
│   │           └── route.tsx      # Dynamic OG image generation
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── accordion.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── table.tsx
│   │   │   └── toast.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── Container.tsx
│   │   ├── sections/              # Page sections
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ProductShowcase.tsx
│   │   │   ├── FeaturesGrid.tsx
│   │   │   ├── PricingTable.tsx
│   │   │   ├── TestimonialsSlider.tsx
│   │   │   ├── ProcessSteps.tsx
│   │   │   ├── TrustSignals.tsx
│   │   │   ├── FAQAccordion.tsx
│   │   │   └── CTABanner.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── ProductSpecs.tsx
│   │   │   ├── ThicknessSelector.tsx
│   │   │   └── QuantityCalculator.tsx
│   │   ├── remotion/
│   │   │   ├── ProductVideoPlayer.tsx  # 'use client' wrapper
│   │   │   └── VideoSkeleton.tsx
│   │   ├── whatsapp/
│   │   │   ├── WhatsAppCTA.tsx
│   │   │   ├── WhatsAppFloating.tsx
│   │   │   └── QuoteRequestButton.tsx
│   │   └── animations/
│   │       ├── ScrollReveal.tsx
│   │       ├── StaggerContainer.tsx
│   │       ├── CounterAnimation.tsx
│   │       └── HoverCard.tsx
│   ├── lib/
│   │   ├── utils.ts               # cn() helper, formatters
│   │   ├── constants.ts           # Brand colors, pricing, phone numbers
│   │   ├── seo.ts                 # Metadata helpers
│   │   └── analytics.ts           # GA4/tracking helpers
│   ├── hooks/
│   │   ├── useReducedMotion.ts
│   │   └── useConnectionSpeed.ts
│   ├── types/
│   │   └── index.ts
│   └── remotion/                  # Remotion compositions (for rendering)
│       ├── index.ts               # registerRoot()
│       ├── Root.tsx               # Composition definitions
│       └── compositions/
│           ├── CardSpinAnimation.tsx
│           ├── LaserEngravingProcess.tsx
│           └── ProductReveal.tsx
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── components.json                # shadcn/ui config
├── remotion.config.ts
└── package.json
```

---

## Page-by-page breakdown with sections

### Homepage (`/`)

The homepage is the primary conversion page, designed to showcase the product and drive WhatsApp inquiries.

**Sections in order:**

1. **Header** (sticky)
   - Logo left, navigation center, WhatsApp CTA button right
   - Transparent on hero, solid on scroll
   - Mobile: Hamburger menu with slide-out drawer

2. **Hero Section**
   - Split layout: content left, product video/image right
   - Pre-headline: "LASER ENGRAVING SERVICES"
   - Main headline (H1): "Metal Cards That Command Respect"
   - Subheadline: "Handcrafted premium business cards for executives across Nigeria, Ghana & West Africa"
   - Trust micro-copy: "Trusted by 500+ executives • 48hr Lagos delivery"
   - Primary CTA: WhatsApp button (green, prominent)
   - Secondary CTA: "View Designs" ghost button
   - Hero media: Pre-rendered MP4 of spinning card (autoplay, muted, loop) OR high-quality static image with subtle float animation

3. **Trust Signals Bar**
   - Horizontal scroll on mobile
   - Grayscale client logos (banks, telecoms, oil companies)
   - "Trusted by leading West African companies"

4. **Product Showcase**
   - Large product image with interactive hotspots
   - Key specs callouts (aluminum, 0.2mm/0.4mm, custom engraving)
   - "Starting from $5 per card" price anchor
   - WhatsApp CTA

5. **Features Grid**
   - 6 cards highlighting benefits:
     - Premium Material (aluminum construction)
     - Custom Engraving (your design, laser-etched)
     - Durability (won't bend, tear, or fade)
     - First Impressions (memorable networking)
     - Bulk Pricing (volume discounts)
     - Pan-African Shipping

6. **Process Steps**
   - 4 steps: Design → Approve → Engrave → Deliver
   - Animated timeline on scroll
   - Process video embed (optional)

7. **Pricing Preview**
   - Thickness options with visual comparison
   - Bulk tier teaser: "25 / 50 / 100 / 500 cards"
   - "Get Custom Quote" WhatsApp CTA

8. **Testimonials Slider**
   - 3-5 testimonials from Nigerian/Ghanaian executives
   - Photo, name, title, company
   - Auto-play carousel with pause on hover

9. **FAQ Section**
   - Accordion with 6-8 common questions
   - Topics: ordering, customization, delivery, payment

10. **Final CTA Banner**
    - High-contrast section (gold background)
    - "Ready to elevate your networking?"
    - Large WhatsApp button
    - Phone number displayed

11. **Footer**
    - Logo, tagline
    - Quick links
    - Countries served
    - Social links
    - WhatsApp contact
    - Copyright

---

### Product Page (`/products/metal-business-cards`)

**Sections:**

1. **Breadcrumb Navigation**

2. **Product Hero**
   - Gallery with 4-6 images (carousel on mobile)
   - Zoom on hover/tap
   - 360° view option (Remotion Player, lazy-loaded)

3. **Product Info Panel**
   - Title: "Premium Metal Business Cards"
   - Price display: "From $5.00 / card"
   - Thickness selector: 0.2mm ($5) | 0.4mm ($7.30)
   - Visual thickness comparison
   - Quantity selector with bulk pricing display
   - WhatsApp "Request Quote" button

4. **Specifications Table**
   - Material: Aluminum
   - Thickness: 0.2mm / 0.4mm
   - Standard size: 85mm × 55mm (credit card size)
   - Finish: Brushed metal with laser engraving
   - Customization: Full custom design

5. **Bulk Pricing Table**
   ```
   | Quantity | 0.2mm Price | 0.4mm Price |
   |----------|-------------|-------------|
   | 25       | $125        | $182.50     |
   | 50       | $250        | $365        |
   | 100      | $500        | $730        |
   | 500      | $2,250      | $3,285      |
   ```
   Note: Consider volume discounts (e.g., 500 cards at 10% off)

6. **How It Works**
   - Upload design → Review proof → Approve → Production → Delivery

7. **Related Content**
   - Link to Process page
   - Link to FAQ

8. **Sticky Mobile CTA**
   - Fixed bottom bar on mobile with "Get Quote on WhatsApp"

---

### Pricing Page (`/pricing`)

**Sections:**

1. **Header**
   - "Transparent Pricing"
   - "No hidden fees. Volume discounts available."

2. **Product Comparison**
   - Side-by-side comparison of 0.2mm vs 0.4mm
   - Visual weight/durability indicators

3. **Bulk Pricing Calculator**
   - Interactive quantity input
   - Real-time price calculation
   - Shows per-card cost at each tier

4. **Detailed Pricing Tiers**
   - Table format with all quantities
   - Delivery costs by country
   - Timeline estimates

5. **Payment Info**
   - Bank transfer details
   - Mobile money (Nigeria, Ghana)
   - Note: "Payment discussed via WhatsApp"

6. **CTA**
   - WhatsApp quote request

---

### About Page (`/about`)

**Sections:**

1. **Brand Story**
   - Origin, mission, vision
   - Why metal cards for West Africa

2. **Quality Promise**
   - Materials sourcing
   - Equipment/technology
   - Quality control

3. **Team (optional)**
   - Founder story
   - Key personnel

4. **Location**
   - Service areas map
   - Delivery coverage

---

### Country Landing Pages (`/nigeria`, `/ghana`, `/togo`, `/benin`)

Localized versions for SEO targeting each market:

**Unique per country:**
- H1 with country name: "Premium Metal Business Cards in Nigeria"
- Local city mentions (Lagos, Abuja, Accra, etc.)
- Currency display (NGN, GHS, XOF)
- Local phone number
- Local testimonials
- Delivery timeline to major cities
- LocalBusiness schema markup

---

### Contact Page (`/contact`)

**Sections:**

1. **Contact Options**
   - WhatsApp (primary, prominent)
   - Email
   - Phone

2. **Contact Form**
   - Name, Email, Phone, Message
   - Server action submission → WhatsApp redirect with form data

3. **Business Info**
   - Address
   - Operating hours
   - Response time expectations

4. **Map (optional)**
   - Embedded map if physical location shown

---

### Process Page (`/process`)

**Sections:**

1. **How Laser Engraving Works**
   - Educational content with visuals
   - Video of engraving process

2. **Our 4-Step Process**
   - Detailed breakdown
   - Timeline for each step

3. **Design Guidelines**
   - Accepted file formats
   - Resolution requirements
   - What works best on metal

---

### FAQ Page (`/faq`)

- Full FAQ accordion
- Categories: Ordering, Customization, Delivery, Payment, Technical
- Schema markup for FAQ rich results

---

## Component specifications

### WhatsAppCTA component

```tsx
// src/components/whatsapp/WhatsAppCTA.tsx
'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { WHATSAPP_NUMBER } from '@/lib/constants';

interface WhatsAppCTAProps {
  message?: string;
  buttonText?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  trackingLabel?: string;
}

export function WhatsAppCTA({
  message = "Hi! I'm interested in premium metal business cards for my business.",
  buttonText = "Chat on WhatsApp",
  variant = 'primary',
  size = 'md',
  className,
  trackingLabel = 'general'
}: WhatsAppCTAProps) {
  const handleClick = () => {
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'whatsapp_click', {
        event_category: 'CTA',
        event_label: trackingLabel,
      });
    }
    
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const variants = {
    primary: 'bg-[#25D366] hover:bg-[#128C7E] text-white',
    secondary: 'bg-gold hover:bg-gold/90 text-black',
    ghost: 'border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10'
  };

  const sizes = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg'
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-lg transition-colors
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      <MessageCircle className={size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />
      {buttonText}
    </motion.button>
  );
}
```

### ScrollReveal animation wrapper

```tsx
// src/components/animations/ScrollReveal.tsx
'use client';

import { motion, useReducedMotion } from 'motion/react';
import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ScrollReveal({ children, delay = 0, className }: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### ProductVideoPlayer (Remotion)

```tsx
// src/components/remotion/ProductVideoPlayer.tsx
'use client';

import { Player } from '@remotion/player';
import { Suspense, lazy } from 'react';
import { VideoSkeleton } from './VideoSkeleton';

// Lazy load the composition to reduce initial bundle
const CardSpinAnimation = lazy(() => 
  import('@/remotion/compositions/CardSpinAnimation').then(m => ({ default: m.CardSpinAnimation }))
);

interface ProductVideoPlayerProps {
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
}

export function ProductVideoPlayer({ 
  autoPlay = true, 
  loop = true, 
  controls = false 
}: ProductVideoPlayerProps) {
  return (
    <Suspense fallback={<VideoSkeleton />}>
      <Player
        component={CardSpinAnimation}
        inputProps={{}}
        durationInFrames={120}
        compositionWidth={1080}
        compositionHeight={1080}
        fps={30}
        autoPlay={autoPlay}
        loop={loop}
        controls={controls}
        style={{ 
          width: '100%', 
          aspectRatio: '1/1',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      />
    </Suspense>
  );
}
```

---

## Remotion composition ideas for product animations

Pre-render these videos at build time and serve as MP4 for optimal performance. Use the Remotion Player only for interactive 360° views.

### 1. Card Spin Animation (Hero)

**Duration:** 4 seconds (120 frames at 30fps)  
**Resolution:** 1080×1080 (square for flexibility)

**Sequence:**
- Frames 0-30: Card enters from below with slight rotation
- Frames 30-90: Smooth 360° Y-axis rotation showing front and back
- Frames 90-120: Settle into front-facing position with subtle float

```tsx
// src/remotion/compositions/CardSpinAnimation.tsx
import { AbsoluteFill, Img, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

export const CardSpinAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry animation
  const translateY = spring({
    frame: frame - 0,
    fps,
    config: { damping: 12, stiffness: 100 },
    durationInFrames: 30
  });
  const entryY = interpolate(translateY, [0, 1], [100, 0]);

  // 360 rotation
  const rotation = interpolate(
    frame,
    [30, 90],
    [0, 360],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Subtle float at end
  const float = interpolate(
    frame,
    [90, 105, 120],
    [0, -5, 0],
    { extrapolateLeft: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          transform: `translateY(${entryY + float}px) rotateY(${rotation}deg)`,
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
      >
        <Img
          src="/images/products/metal-card-hero.webp"
          style={{ width: 600, height: 'auto', borderRadius: 12 }}
        />
      </div>
    </AbsoluteFill>
  );
};
```

### 2. Laser Engraving Process Animation

**Duration:** 6 seconds (180 frames)  
**Resolution:** 1920×1080

**Sequence:**
- Frames 0-30: Blank card slides in
- Frames 30-120: Laser beam traces the design (animated SVG path)
- Frames 120-150: Glow effect as engraving completes
- Frames 150-180: Final reveal with shine sweep

**Implementation approach:**
- Use SVG path animation with `stroke-dasharray` and `stroke-dashoffset`
- Animated laser point follows the path
- Particle effects for metal sparks
- Final shine uses CSS gradient animation

### 3. Product Reveal Animation (For landing pages)

**Duration:** 3 seconds (90 frames)

**Sequence:**
- Card emerges from shadow/darkness
- Dramatic lighting sweep
- Settles with subtle reflection

---

## Copy suggestions

### Hero section

**Pre-headline:**
```
LASER ENGRAVING SERVICES
```

**Main headline options:**

Option A (Outcome-focused):
```
Metal Cards That Command Respect
```

Option B (Differentiation):
```
The Business Card That Closes Deals
```

Option C (Premium positioning):
```
First Impressions. Forged in Metal.
```

**Subheadline:**
```
Handcrafted premium metal business cards for executives who understand 
that first impressions are everything. Ships across Nigeria, Ghana & West Africa.
```

**Trust micro-copy:**
```
✓ Trusted by 500+ executives  •  ✓ 48-hour Lagos delivery  •  ✓ Custom designs
```

### CTA button copy

| Location | Primary CTA | Secondary CTA |
|----------|-------------|---------------|
| Hero | "Request Quote on WhatsApp" | "View Designs" |
| Product page | "Get Custom Quote" | "See Pricing" |
| Pricing page | "Start Your Order" | "Contact Us" |
| Sticky mobile | "Chat Now" | — |

### Pre-filled WhatsApp messages

**Hero CTA:**
```
Hi! I'm interested in premium metal business cards for my executive team. 
Can we discuss customization options and pricing?
```

**Product page CTA:**
```
Hello! I'd like to order [QUANTITY] metal business cards ([THICKNESS]mm thickness). 
Can you help me with the process?
```

**Pricing page CTA:**
```
Hi! I'm looking for a quote on bulk metal business cards. 
Please share pricing for [QUANTITY] cards.
```

### Key value propositions for features

1. **Premium Material**
   "Precision-cut aluminum that feels substantial in the hand"

2. **Custom Laser Engraving**
   "Your design, permanently etched with micron-level precision"

3. **Unmatched Durability**
   "Won't bend, tear, or fade—built to last longer than deals it closes"

4. **Memorable First Impressions**
   "The card that gets kept, not tossed"

5. **Volume Discounts**
   "Better rates at 25, 50, 100, and 500+ cards"

6. **Pan-African Delivery**
   "Fast shipping across Nigeria, Ghana, Togo & Benin"

---

## Color palette and typography specifications

### Brand colors

```css
/* src/app/globals.css */
:root {
  /* Primary - Laser Yard Gold */
  --gold: oklch(0.87 0.18 95);           /* #FFD700 equivalent */
  --gold-dark: oklch(0.75 0.16 90);      /* Hover state */
  --gold-light: oklch(0.92 0.12 95);     /* Subtle backgrounds */

  /* Neutrals */
  --black: oklch(0.145 0 0);             /* #0a0a0a - Primary text */
  --white: oklch(1 0 0);                 /* #ffffff - Backgrounds */
  --gray-900: oklch(0.205 0 0);          /* Dark backgrounds */
  --gray-800: oklch(0.269 0 0);          /* Cards on dark */
  --gray-600: oklch(0.446 0 0);          /* Secondary text */
  --gray-400: oklch(0.556 0 0);          /* Muted text */
  --gray-200: oklch(0.85 0 0);           /* Borders */
  --gray-100: oklch(0.95 0 0);           /* Light backgrounds */

  /* Semantic */
  --whatsapp-green: #25D366;
  --whatsapp-green-dark: #128C7E;
  --success: oklch(0.75 0.18 145);
  --error: oklch(0.65 0.2 25);

  /* Component tokens */
  --background: var(--white);
  --foreground: var(--black);
  --primary: var(--gold);
  --primary-foreground: var(--black);
  --secondary: var(--black);
  --secondary-foreground: var(--white);
  --muted: var(--gray-100);
  --muted-foreground: var(--gray-600);
  --border: var(--gray-200);
  --ring: var(--gold);
  --radius: 0.625rem;
}

.dark {
  --background: var(--gray-900);
  --foreground: var(--white);
  --muted: var(--gray-800);
  --muted-foreground: var(--gray-400);
  --border: var(--gray-800);
}
```

### Typography

**Font stack:**

The brand uses a bold serif for "Laser" + italic serif for "yard" in the logo. For body text, use a clean sans-serif:

```tsx
// src/app/layout.tsx
import { DM_Sans, Playfair_Display } from 'next/font/google';

// Primary body font - clean, modern, readable
const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

// Display font for headlines - premium feel
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['600', '700', '800'],
});
```

**Typography scale:**

```css
/* Tailwind config extension */
fontSize: {
  'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],   /* 72px - Hero */
  'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],  /* 60px */
  'display': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],        /* 48px - Section headers */
  'heading-lg': ['2.25rem', { lineHeight: '1.3' }],  /* 36px */
  'heading': ['1.875rem', { lineHeight: '1.3' }],    /* 30px */
  'heading-sm': ['1.5rem', { lineHeight: '1.4' }],   /* 24px */
  'body-lg': ['1.25rem', { lineHeight: '1.6' }],     /* 20px - Subheadlines */
  'body': ['1rem', { lineHeight: '1.6' }],           /* 16px - Body text */
  'body-sm': ['0.875rem', { lineHeight: '1.5' }],    /* 14px - Captions */
  'caption': ['0.75rem', { lineHeight: '1.5' }],     /* 12px - Labels */
}
```

**Usage guidelines:**

| Element | Font | Weight | Size (mobile/desktop) |
|---------|------|--------|----------------------|
| H1 (Hero headline) | Playfair Display | 700 | 2.5rem / 4rem |
| H2 (Section headers) | Playfair Display | 600 | 1.875rem / 2.25rem |
| H3 (Subsections) | DM Sans | 600 | 1.25rem / 1.5rem |
| Body text | DM Sans | 400 | 1rem |
| Buttons | DM Sans | 600 | 0.875rem / 1rem |
| Labels/captions | DM Sans | 500 | 0.75rem |

---

## Responsive design considerations

### Breakpoint strategy

```ts
// Tailwind default breakpoints
const breakpoints = {
  sm: '640px',   // Large phones
  md: '768px',   // Tablets
  lg: '1024px',  // Small laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px' // Large screens
};
```

### Mobile-first priorities

West Africa is **85%+ mobile traffic**. Design mobile-first:

1. **Touch targets:** Minimum 48×48px for all interactive elements
2. **Thumb zones:** Primary CTAs in bottom 40% of viewport
3. **Single column:** Stack all content on mobile
4. **Sticky CTA:** Fixed bottom bar with WhatsApp button on product pages
5. **Font sizes:** Minimum 16px for body text (prevents iOS zoom)
6. **Forms:** Large inputs, native date/select pickers

### Layout patterns

**Hero section:**
- Mobile: Full-width image above, content below, stacked CTAs
- Desktop: 50/50 split, content left, image/video right

**Product showcase:**
- Mobile: Carousel gallery, full-width specs
- Desktop: Gallery left (sticky), info panel right

**Pricing table:**
- Mobile: Cards or horizontal scroll table
- Desktop: Full table view

**Testimonials:**
- Mobile: Single card carousel
- Desktop: 3-column grid or carousel

### Performance budget for mobile

| Metric | Target | Critical |
|--------|--------|----------|
| Total page weight | <500KB | <1MB |
| Hero LCP | <2.0s | <2.5s |
| JavaScript | <150KB | <200KB |
| Images (above fold) | <100KB | <150KB |
| Time to Interactive | <3.0s | <4.0s |

### Slow connection handling

```tsx
// src/hooks/useConnectionSpeed.ts
'use client';

import { useState, useEffect } from 'react';

export function useConnectionSpeed() {
  const [speed, setSpeed] = useState<'fast' | 'slow'>('fast');

  useEffect(() => {
    const connection = (navigator as any).connection;
    if (connection) {
      const type = connection.effectiveType;
      if (type === '2g' || type === 'slow-2g' || type === '3g') {
        setSpeed('slow');
      }
      if (connection.saveData) {
        setSpeed('slow');
      }
    }
  }, []);

  return speed;
}
```

Use this to:
- Reduce image quality (60 vs 80)
- Disable autoplay videos
- Simplify animations
- Load skeleton placeholders longer

---

## Deployment notes for self-hosted server

### Recommended infrastructure

| Component | Recommendation |
|-----------|---------------|
| Server | Ubuntu 22.04 LTS, 2+ vCPUs, 4GB+ RAM |
| Node.js | v20 LTS (matches Next.js requirements) |
| Process manager | PM2 |
| Reverse proxy | Nginx |
| SSL | Let's Encrypt (Certbot) |
| CDN | Cloudflare (Lagos, Accra PoPs) |

### Server location

Host in or near West Africa for lowest latency:
- **DigitalOcean** - has Lagos datacenter (ideal)
- **Vultr** - has Johannesburg (acceptable)
- **AWS** - Cape Town region (acceptable)
- **Local providers** - MainOne, Rack Centre (Nigeria-specific)

### Next.js production configuration

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Creates minimal deployment bundle
  
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 31536000, // 1 year
  },

  // Remotion renderer (if doing server-side rendering)
  serverExternalPackages: ['@remotion/renderer'],

  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Nginx configuration

```nginx
# /etc/nginx/sites-available/laseryard
upstream nextjs {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name laseryard.com www.laseryard.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name laseryard.com www.laseryard.com;

    ssl_certificate /etc/letsencrypt/live/laseryard.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/laseryard.com/privkey.pem;

    # Gzip for slow African connections
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/json application/xml;

    # Static assets - serve directly, bypass Node
    location /_next/static {
        alias /var/www/laseryard/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location /images {
        alias /var/www/laseryard/public/images;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location /videos {
        alias /var/www/laseryard/public/videos;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Proxy to Next.js
    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 ecosystem file

```js
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'laseryard',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/laseryard',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
```

### Deployment script

```bash
#!/bin/bash
# deploy.sh - Run on server after git pull

cd /var/www/laseryard

# Install dependencies
npm ci --production=false

# Build Next.js
npm run build

# Restart PM2
pm2 reload ecosystem.config.js --env production

# Clear Cloudflare cache (optional)
# curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
#   -H "Authorization: Bearer {api_token}" \
#   -H "Content-Type: application/json" \
#   --data '{"purge_everything":true}'

echo "Deployment complete!"
```

### Cloudflare configuration

Enable these Cloudflare features for optimal West African performance:

1. **Caching:** Cache everything, respect edge TTLs
2. **Tiered caching:** Smart tiered caching enabled
3. **Argo Smart Routing:** Reduces latency (paid feature)
4. **Polish:** Lossless image compression
5. **Brotli:** Enable for text compression
6. **HTTP/3:** Enable for mobile performance
7. **Page Rules:**
   - `*.laseryard.com/images/*` → Cache Level: Cache Everything, TTL: 1 year
   - `*.laseryard.com/_next/static/*` → Cache Level: Cache Everything, TTL: 1 year

### Environment variables

```env
# .env.production
NEXT_PUBLIC_SITE_URL=https://laseryard.com
NEXT_PUBLIC_WHATSAPP_NUMBER=2348012345678
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: If using analytics
NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXX
```

---

## Implementation priority order

For Claude Code to build efficiently, follow this order:

### Phase 1: Foundation (Day 1)
1. Initialize Next.js 15 project with TypeScript
2. Install and configure shadcn/ui with custom theme
3. Set up Tailwind with brand colors and typography
4. Create folder structure
5. Build layout components (Header, Footer, Container)
6. Implement WhatsAppCTA component

### Phase 2: Core pages (Days 2-3)
1. Build Homepage with all sections
2. Build Product page
3. Build Pricing page
4. Implement all animation components (ScrollReveal, etc.)

### Phase 3: Supporting pages (Day 4)
1. Build About page
2. Build Contact page
3. Build Process page
4. Build FAQ page
5. Create country landing pages

### Phase 4: Remotion and media (Day 5)
1. Set up Remotion project structure
2. Create CardSpinAnimation composition
3. Pre-render videos to MP4
4. Integrate ProductVideoPlayer where appropriate

### Phase 5: SEO and optimization (Day 6)
1. Implement all metadata
2. Add JSON-LD structured data
3. Generate sitemap
4. Set up robots.txt
5. Optimize images
6. Performance testing and fixes

### Phase 6: Deployment (Day 7)
1. Server setup
2. Nginx configuration
3. SSL setup
4. PM2 configuration
5. Cloudflare integration
6. Final testing

---

This specification provides a complete technical blueprint for building the Laser Yard website. The architecture prioritizes the unique requirements of the West African B2B market: mobile-first design, aggressive performance optimization, WhatsApp as the conversion mechanism, and premium visual presentation appropriate for corporate clients.