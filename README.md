# Laseryard

E-commerce platform for laser-engraved custom products. Laseryard is a precision laser engraving studio headquartered in Lagos, serving clients worldwide with ready-made engraved products and custom engraving across metal, wood, crystal, acrylic, leather, and glass.

Live at [laseryard.com](https://laseryard.com).

## Features

- **Multi-product catalog** -- Metal business cards, crystal awards, and wood boards/coasters with dedicated product pages and a unified shop
- **3D product visualization** -- Interactive Three.js previews of products using React Three Fiber, including 2D and 3D card previews in the design studio
- **Design studio** -- Upload custom artwork, adjust threshold/invert settings, and preview laser engraving output in real time via client-side image processing
- **Whop Checkout payments** -- Integrated with Whop SDK for product checkout and payment verification
- **Shipping integration** -- Fez Delivery API for cost estimation, location lookup, and order tracking within Nigeria
- **Location-based pages** -- Dynamic `[location]` routes for local SEO targeting
- **Blog** -- Dynamic blog with slug-based routing
- **SEO** -- JSON-LD structured data (Organization, Product, FAQ, BreadcrumbList), sitemap generation, robots.txt, and `llms.txt`
- **Contact and support** -- WhatsApp integration, contact forms, and FAQ accordion
- **Testimonials and trust signals** -- Animated testimonial slider, trust bar, and social proof sections
- **Motion animations** -- Page transitions and scroll-driven animations via the Motion library

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router, standalone output) |
| Language | TypeScript 5 |
| UI | React 19.2.3, Tailwind CSS 4, Radix UI, Lucide icons |
| 3D | Three.js, React Three Fiber, Drei |
| Forms | React Hook Form, Zod validation |
| Payments | Whop SDK + Whop Checkout |
| Shipping | Fez Delivery API |
| Animations | Motion |
| PDF | pdfjs-dist (design file processing) |
| Carousel | Embla Carousel |
| Deployment | Nixpacks (standalone Node.js server) |

## Project Structure

```
src/
  app/
    page.tsx                    # Homepage
    shop/                       # Product shop
    products/
      metal-business-cards/     # Metal card product page
      crystal-awards/           # Crystal award product page
      wood-engraving/           # Wood engraving product page
    unforgettable/              # Landing page + design studio entry
      design-studio/            # In-browser design customization
    custom-engraving/           # Custom engraving service page
    [location]/                 # Dynamic location-based SEO pages
    blog/
      [slug]/                   # Individual blog posts
    pay/                        # Payment page
    track/                      # Order tracking
    process/                    # "How it works" page
    contact/                    # Contact page
    faq/                        # FAQ page
    about/                      # About page
    privacy/                    # Privacy policy
    terms/                      # Terms of service
    api/
      checkout/                 # Whop checkout session creation
        verify/                 # Payment verification
      payments/                 # Payment webhook handler
      shipping/
        cost/                   # Shipping cost calculation
        export-cost/            # Export shipping cost
        export-locations/       # International location lookup
        states/                 # Nigerian states list
        track/                  # Shipment tracking
      design-studio/
        generate/               # Design generation endpoint
      design-request/           # Design request submission
      chat/                     # Chat endpoint
    sitemap.ts                  # Dynamic sitemap generation
    robots.ts                   # Robots.txt generation
  components/
    sections/                   # Landing page sections (Hero, FAQ, Testimonials, CTA, etc.)
    design-studio/              # Design studio UI (uploader, 2D/3D preview, threshold controls)
    product-illustrations/      # 3D product illustration component
    payments/                   # Whop checkout components
    shipping/                   # Shipping estimator and order tracker
    layout/                     # Shared layout components
    animations/                 # Animation wrappers
    chat/                       # Chat widget
    whatsapp/                   # WhatsApp contact integration
    ui/                         # Radix-based UI primitives
    JsonLd.tsx                  # JSON-LD structured data component
  lib/
    whop.ts                     # Whop SDK client configuration
    design-processor.ts         # Client-side image-to-engrave processing
    fez-delivery.ts             # Fez Delivery API client
    schema.ts                   # JSON-LD schema generators
    blog.ts                     # Blog data utilities
    constants.ts                # Site config, product catalog, materials, nav links
    utils.ts                    # General utilities
  hooks/
    useChat.ts                  # Chat hook
    useIsMobile.ts              # Mobile detection hook
```

## Prerequisites

- Node.js >= 20.9.0
- npm

## Environment Variables

| Variable | Purpose |
|---|---|
| `WHOP_API_KEY` | Whop SDK API key for checkout and payment |
| `WHOP_PRODUCT_ID` | Whop product identifier |
| `FEZ_DELIVERY_USER_ID` | Fez Delivery API user ID |
| `FEZ_DELIVERY_PASSWORD` | Fez Delivery API password |
| `FEZ_DELIVERY_BASE_URL` | Fez Delivery API base URL (defaults to sandbox) |

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Production build (standalone output with static assets copied) |
| `npm start` | Start the standalone production server on 0.0.0.0 |
| `npm run lint` | Run ESLint |

## Deployment

The project is configured for standalone deployment via Nixpacks. The build produces a self-contained `server.js` at `.next/standalone/` with static assets copied alongside it. See `nixpacks.toml` for the build and start configuration.

## License

Proprietary. All rights reserved.
