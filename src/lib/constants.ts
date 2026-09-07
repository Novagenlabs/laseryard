// Laser Yard - Brand Constants

export const SITE_CONFIG = {
  name: "Laser Yard",
  tagline: "Precision Laser Engraving",
  description:
    "Precision laser engraving studio serving clients worldwide. Ready-made engraved products and custom engraving:metal, wood, crystal, acrylic, and leather.",
  url: "https://laseryard.com",
};

export const WHATSAPP_NUMBER = "14159039078";

export const WHATSAPP_MESSAGES = {
  hero: "Hi! I'm interested in your laser engraving services. Can we discuss my project?",
  product: (productName: string) =>
    `Hello! I'm interested in your ${productName}. Can you tell me more about options and pricing?`,
  customEngraving: (material: string) =>
    `Hi! I'd like to get custom laser engraving on my own ${material} item. Can we discuss the details?`,
  pricing: (quantity: number) =>
    `Hi! I'm looking for a quote on a bulk order. Please share pricing for ${quantity} pieces.`,
  general:
    "Hi! I'm interested in your laser engraving services.",
};

// Metal business card pricing.
// Quantities outside this table (or other materials/finishes) get a custom quote on WhatsApp.
// 2026-09-07: 0.4mm retired — the lineup is 0.8mm only, with a 15-card entry pack.
export const CARD_QUANTITIES = [15, 30, 50, 100, 200] as const;
export type CardQuantity = (typeof CARD_QUANTITIES)[number];
export type CardThickness = "0.8mm";

// All-in delivered totals in USD — worldwide shipping is included in every
// price (same numbers the WhatsApp agent quotes). The 15-card pack does not
// include the design service (flat DESIGN_FEE_USD when we create the design);
// orders of 30+ cards include design free.
export const CARD_PRICING: Record<
  CardThickness,
  { label: string; prices: Record<CardQuantity, number> }
> = {
  "0.8mm": {
    label: "Premium",
    prices: { 15: 250, 30: 450, 50: 715, 100: 1350, 200: 2550 },
  },
};

// Flat design-service fee (USD) on the 15-card pack; design is included free
// with orders of 30 cards or more. Supplying a print-ready design is always free.
export const DESIGN_FEE_USD = 50;
export const designIncluded = (quantity: number) => quantity >= 30;

// Anodized aluminum colors from our card stock supplier (0.8mm blanks; the
// supplier's "Deep Forest Green" is a muted sage, its "gold" a pale champagne).
// `swatch` is sampled from the product photo shown for that color, so the
// picker matches what the customer sees. Photos live at
// public/images/products/colors/<id>.webp (the fanned-stack shot) — the
// product page picks them up automatically.
export const CARD_COLORS = [
  { id: "black", label: "Matte Black", swatch: "#323234" },
  { id: "silver", label: "Silver", swatch: "#d2d1d5" },
  { id: "gold", label: "Champagne Gold", swatch: "#dbc6a0" },
  { id: "blue", label: "Blue", swatch: "#025fc6" },
  { id: "red", label: "Red", swatch: "#a02230" },
  { id: "green", label: "Green", swatch: "#8eb779" },
  { id: "forest-green", label: "Sage Green", swatch: "#a1ab9e" },
  { id: "purple", label: "Purple", swatch: "#a0448f" },
  { id: "pink", label: "Blush Pink", swatch: "#e9cfcd" },
  { id: "orange", label: "Cosmic Orange", swatch: "#f7a84c" },
  { id: "brown", label: "Brown", swatch: "#7d593f" },
] as const;
export type CardColor = (typeof CARD_COLORS)[number];

export const NAV_LINKS = [
  { href: "/products/metal-business-cards", label: "Metal Cards" },
  { href: "/shop", label: "More Products" },
  { href: "/process", label: "How It Works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const PRODUCT_CATEGORIES = [
  {
    slug: "metal-business-cards",
    name: "Metal Business Cards",
    description:
      "Laser-engraved 0.8mm anodized aluminum cards in 11 colors. Heavy, cold to the touch, and impossible to throw away. From $250 for 15 cards, shipping included.",
    features: ["Premium Aluminum", "0.8mm Thick", "11 Anodized Colors"],
    href: "/products/metal-business-cards",
  },
  {
    slug: "crystal-awards",
    name: "Crystal Awards",
    description:
      "3D laser-engraved crystal trophies and awards. Used for corporate recognition, team events, and milestones.",
    features: ["3D Engraving", "Multiple Shapes", "Custom Text & Logos"],
    href: "/products/crystal-awards",
  },
  {
    slug: "wood-engraving",
    name: "Wood Boards & Coasters",
    description:
      "Laser-engraved wooden boards and coasters. Popular with restaurants, corporate gifting, and home decor.",
    features: ["Natural Wood", "Detailed Engraving", "Custom Designs"],
    href: "/products/wood-engraving",
  },
];

export const CUSTOM_ENGRAVING_MATERIALS = [
  {
    name: "Metal",
    description: "Stainless steel, aluminum, brass, copper",
    icon: "Layers",
  },
  {
    name: "Wood",
    description: "Hardwood, plywood, bamboo, MDF",
    icon: "TreePine",
  },
  {
    name: "Acrylic",
    description: "Clear, colored, frosted acrylic sheets",
    icon: "Square",
  },
  {
    name: "Leather",
    description: "Genuine leather, faux leather goods",
    icon: "Briefcase",
  },
  {
    name: "Glass",
    description: "Bottles, awards, drinkware, mirrors",
    icon: "GlassWater",
  },
  {
    name: "Fabric",
    description: "Denim, canvas, patches, labels",
    icon: "Shirt",
  },
];

export const CUSTOM_ENGRAVING_STEPS = [
  {
    step: 1,
    title: "Send Your Item",
    description: "Bring or ship your item to our studio. We'll assess it and confirm what's possible.",
  },
  {
    step: 2,
    title: "Share Your Design",
    description: "Upload your design or work with our team to create one that fits your item.",
  },
  {
    step: 3,
    title: "We Engrave",
    description: "Our precision laser equipment engraves your design onto your item with care.",
  },
  {
    step: 4,
    title: "Pick Up or Deliver",
    description: "Collect your engraved item from our studio or we ship it right to your door.",
  },
];

export const FEATURES = [
  {
    title: "Precision Equipment",
    description: "Industrial-grade laser systems for micron-level accuracy",
    icon: "Crosshair",
  },
  {
    title: "Any Material",
    description: "Metal, wood, acrylic, leather, glass. We engrave it all.",
    icon: "Layers",
  },
  {
    title: "Custom Designs",
    description: "From your file or created by our design team",
    icon: "PenTool",
  },
  {
    title: "Reliable Turnaround",
    description: "10-14 business days standard, rush production available",
    icon: "Clock",
  },
  {
    title: "Quality Guaranteed",
    description: "Every piece inspected before it leaves our studio",
    icon: "Shield",
  },
  {
    title: "Worldwide Delivery",
    description: "Serving clients across Africa, Europe, the Americas, and beyond",
    icon: "Truck",
  },
];

export const PROCESS_STEPS = [
  {
    step: 1,
    title: "Design",
    description: "Upload your design or work with our team to create one that fits your product",
  },
  {
    step: 2,
    title: "Approve",
    description: "Review your digital proof and request any adjustments before production",
  },
  {
    step: 3,
    title: "Engrave",
    description: "Your piece is laser-engraved with precision industrial equipment",
  },
  {
    step: 4,
    title: "Deliver",
    description: "Receive your finished product, inspected and packaged",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "These cards changed how people perceive my brand. Every meeting starts with compliments.",
    author: "Adaeze Okonkwo",
    title: "CEO, Fintech Solutions Ltd",
    location: "Nigeria",
    rating: 5,
  },
  {
    quote:
      "The quality is exceptional. I've had clients keep my card for months just because of how it feels.",
    author: "James Hartley",
    title: "Director, Hartley & Co",
    location: "London, UK",
    rating: 5,
  },
  {
    quote:
      "Worth every penny. These aren't just business cards, they're conversation starters.",
    author: "Sarah Chen",
    title: "Founder, Apex Ventures",
    location: "New York, US",
    rating: 5,
  },
  {
    quote:
      "Ordered crystal awards for our annual gala. The engraving detail was flawless. Will be back next year.",
    author: "Fatima Al-Rashid",
    title: "Events Manager, Gulf Properties",
    location: "Dubai, UAE",
    rating: 5,
  },
  {
    quote:
      "We use Laser Yard for all our corporate gifting. Fast turnaround, consistent quality every time.",
    author: "Kwame Asante",
    title: "Managing Director, Asante Holdings",
    location: "Accra, Ghana",
    rating: 5,
  },
];

export const TESTIMONIAL_STATS = {
  averageRating: 4.9,
  totalClients: 500,
};

export const TRUST_LOGOS = [
  { name: "First Bank", logo: "/images/clients/firstbank.svg" },
  { name: "MTN", logo: "/images/clients/mtn.svg" },
  { name: "Dangote Group", logo: "/images/clients/dangote.svg" },
  { name: "Zenith Bank", logo: "/images/clients/zenith.svg" },
  { name: "Access Bank", logo: "/images/clients/access.svg" },
];

export const FAQ_ITEMS = [
  {
    question: "Will I see a proof before my cards are made?",
    answer:
      "Absolutely. We send you a digital proof within 1-3 business days of your order. You can request unlimited revisions until you're completely happy. Nothing gets engraved until you approve.",
  },
  {
    question: "How do I design my metal business cards?",
    answer:
      "You have two options: upload your own design (PDF or high-resolution PNG) when you order, or let our design team handle it. Design is included free with orders of 30 cards or more; for the 15-card starter pack the design service is a flat $50.",
  },
  {
    question: "How long does it take to get my cards?",
    answer:
      "Standard production is 10-14 business days after you approve your proof; rush production (2-3 business days) is available for an extra fee. Tracked worldwide delivery, included in the price, takes 7-14 business days after dispatch.",
  },
  {
    question: "Are the cards really made of metal?",
    answer:
      "Yes. Our cards are premium anodized aluminum, 0.8mm thick, available in 11 colors. They're heavy, cold to the touch, and built to last. The kind of card people keep instead of throwing away.",
  },
  {
    question: "What is the minimum order quantity?",
    answer:
      "Our minimum order is 15 cards — $250 with worldwide shipping included. Pack prices scale from there (30 cards $450, up to 200 cards $2,550). Need more than 200? Contact us for a custom quote.",
  },
  {
    question: "Can I add NFC to my cards?",
    answer:
      "Not at the moment — our cards are solid laser-engraved aluminum with no NFC chip. If you want a tap-to-share experience, we can engrave a QR code that links to your website or digital business card; it works with every phone camera, no app required.",
  },
];

export const COUNTRIES = [
  {
    slug: "africa",
    name: "Africa",
    cities: ["Accra", "Abuja", "Nairobi", "Johannesburg", "Cairo"],
    currency: "USD",
    phone: "+234",
  },
  {
    slug: "nigeria",
    name: "Nigeria",
    cities: ["Abuja", "Port Harcourt", "Ibadan", "Kano"],
    currency: "NGN",
    phone: "+234",
  },
  {
    slug: "ghana",
    name: "Ghana",
    cities: ["Accra", "Kumasi", "Tema"],
    currency: "GHS",
    phone: "+233",
  },
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    cities: ["London", "Manchester", "Birmingham"],
    currency: "GBP",
    phone: "+44",
  },
  {
    slug: "united-states",
    name: "United States",
    cities: ["New York", "Los Angeles", "Houston"],
    currency: "USD",
    phone: "+1",
  },
  {
    slug: "uae",
    name: "UAE",
    cities: ["Dubai", "Abu Dhabi"],
    currency: "AED",
    phone: "+971",
  },
  {
    slug: "eu",
    name: "EU",
    cities: ["Berlin", "Paris", "Amsterdam", "Milan"],
    currency: "EUR",
    phone: "+49",
  },
];
