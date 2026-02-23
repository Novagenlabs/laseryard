// Laser Yard - Brand Constants

export const SITE_CONFIG = {
  name: "Laser Yard",
  tagline: "Precision Laser Engraving",
  description:
    "Laser engraving studio based in Lagos, serving all of West Africa. We sell ready-made engraved products and custom-engrave items you bring us — metal, wood, crystal, acrylic, and leather.",
  url: "https://laseryard.com",
};

export const WHATSAPP_NUMBER = "22899883594";

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

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/custom-engraving", label: "Custom Engraving" },
  { href: "/process", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const PRODUCT_CATEGORIES = [
  {
    slug: "metal-business-cards",
    name: "Metal Business Cards",
    description:
      "Laser-engraved aluminum cards. Heavy, cold to the touch, and impossible to throw away. The kind of card people ask about.",
    features: ["Premium Aluminum", "0.2mm / 0.4mm Thickness", "Multiple Finishes"],
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
    title: "West Africa Wide",
    description: "Serving Nigeria, Ghana, Togo, Benin and beyond",
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
    author: "Kwame Asante",
    title: "Managing Director, Asante Holdings",
    location: "Accra, Ghana",
    rating: 5,
  },
  {
    quote:
      "Worth every kobo. These aren't just business cards, they're conversation starters.",
    author: "Emeka Nwosu",
    title: "Founder, NexGen Consulting",
    location: "Abuja, Nigeria",
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
    question: "What products do you offer?",
    answer:
      "We offer laser-engraved metal business cards, 3D crystal awards and trophies, and custom wood boards and coasters. We also provide custom engraving on your own items — metal, wood, acrylic, leather, glass, and fabric.",
  },
  {
    question: "What is the minimum order quantity?",
    answer:
      "For metal business cards, our minimum order is 25 cards. For crystal awards and wood products, we can handle single-piece orders. Custom engraving on your own items has no minimum — bring us one item or a hundred.",
  },
  {
    question: "How long does production take?",
    answer:
      "Standard production is 5-7 business days after design approval. Rush orders (2-3 days) are available for an additional fee. Custom engraving on personal items is typically completed within 1-3 business days.",
  },
  {
    question: "What file formats do you accept for designs?",
    answer:
      "We accept AI, EPS, PDF (vector), and high-resolution PNG files (minimum 300 DPI). Our team can also help convert your existing designs or create new ones.",
  },
  {
    question: "Can you engrave my own items?",
    answer:
      "Yes! Bring us your own items — laptops, phones, water bottles, leather goods, wooden gifts, and more. We'll assess the material and provide a quote for custom engraving.",
  },
  {
    question: "Do you ship outside Nigeria?",
    answer:
      "Yes! We ship across West Africa including Ghana, Togo, Benin, and Cameroon. Delivery times vary by location.",
  },
];

export const COUNTRIES = [
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
    slug: "togo",
    name: "Togo",
    cities: ["Lome"],
    currency: "XOF",
    phone: "+228",
  },
  {
    slug: "benin",
    name: "Benin",
    cities: ["Cotonou", "Porto-Novo"],
    currency: "XOF",
    phone: "+229",
  },
];
