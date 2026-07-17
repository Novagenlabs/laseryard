// Laser Yard - Brand Constants

export const SITE_CONFIG = {
  name: "Laser Yard",
  tagline: "Precision Laser Engraving",
  description:
    "Precision laser engraving studio headquartered in Lagos, serving clients worldwide. Ready-made engraved products and custom engraving:metal, wood, crystal, acrylic, and leather.",
  url: "https://laseryard.com",
};

export const WHATSAPP_NUMBER = "22893184418";

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
export const CARD_QUANTITIES = [30, 50, 100, 200] as const;
export type CardQuantity = (typeof CARD_QUANTITIES)[number];
export type CardThickness = "0.4mm" | "0.8mm";

// Total price in USD per thickness and quantity.
// Base: $200 (0.4mm) / $450 (0.8mm) per 30 cards; ~5% off per card at 50, ~10% at 100, ~15% at 200.
export const CARD_PRICING: Record<
  CardThickness,
  { label: string; prices: Record<CardQuantity, number> }
> = {
  "0.4mm": {
    label: "Standard",
    prices: { 30: 200, 50: 315, 100: 600, 200: 1135 },
  },
  "0.8mm": {
    label: "Premium",
    prices: { 30: 450, 50: 715, 100: 1350, 200: 2550 },
  },
};

// Limited-time marketing campaign: free delivery if the visitor orders within
// `windowHours` of their first visit (per-visitor countdown, localStorage).
// Flip `enabled` to start/stop the campaign.
export const FREE_SHIPPING_CAMPAIGN = {
  enabled: true,
  windowHours: 48,
};

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
      "Laser-engraved aluminum cards. Heavy, cold to the touch, and impossible to throw away. The kind of card people ask about.",
    features: ["Premium Aluminum", "0.4mm / 0.8mm Thickness", "Multiple Finishes"],
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
    title: "Fast Turnaround",
    description: "Most projects completed within 5-7 business days",
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
    location: "Lagos, Nigeria",
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
      "You have two options: upload your own design (PDF or high-resolution PNG) when you order, or let our design team handle it for you. Just share your logo and details, and we'll create a production-ready layout.",
  },
  {
    question: "How long does it take to get my cards?",
    answer:
      "Standard production is 10-14 business days after you approve your proof, though cards can be ready in as little as 5-7 days. We ship worldwide.",
  },
  {
    question: "Are the cards really made of metal?",
    answer:
      "Yes. Our cards are made from premium aluminum, available in 0.4mm or 0.8mm thick. They're heavy, cold to the touch, and built to last. The kind of card people keep instead of throwing away.",
  },
  {
    question: "What is the minimum order quantity?",
    answer:
      "Our minimum order is 30 cards. We offer volume discounts starting at 50+ cards. Contact us for bulk pricing on orders of 200+.",
  },
  {
    question: "Can I add NFC to my cards?",
    answer:
      "Yes! We offer custom NFC-enabled metal cards. Tap your card against any smartphone to instantly share your contact info, website, or digital business card. No app required.",
  },
];

export const COUNTRIES = [
  {
    slug: "africa",
    name: "Africa",
    cities: ["Lagos", "Accra", "Abuja", "Nairobi", "Johannesburg"],
    currency: "USD",
    phone: "+234",
  },
  {
    slug: "nigeria",
    name: "Nigeria",
    cities: ["Lagos", "Abuja", "Port Harcourt", "Kano"],
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
