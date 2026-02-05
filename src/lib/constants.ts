// Laser Yard - Brand Constants

export const SITE_CONFIG = {
  name: "Laser Yard",
  tagline: "Precision Laser Engraving",
  description:
    "West Africa's premier laser engraving studio. From metal business cards to custom signage, we bring your vision to life with micron-level precision.",
  url: "https://laseryard.com",
};

export const WHATSAPP_NUMBER = "2348012345678"; // Update with actual number

export const WHATSAPP_MESSAGES = {
  hero: "Hi! I'm interested in your laser engraving services. Can we discuss my project?",
  product: (quantity: number, thickness: string) =>
    `Hello! I'd like to order ${quantity} metal business cards (${thickness}mm thickness). Can you help me with the process?`,
  pricing: (quantity: number) =>
    `Hi! I'm looking for a quote on bulk metal business cards. Please share pricing for ${quantity} cards.`,
  general:
    "Hi! I'm interested in your laser engraving services.",
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products/metal-business-cards", label: "Products" },
  { href: "/process", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const FEATURES = [
  {
    title: "Precision Equipment",
    description: "Industrial-grade laser systems for micron-level accuracy",
    icon: "Crosshair",
  },
  {
    title: "Any Material",
    description: "Metal, wood, acrylic, leather, glass — we engrave it all",
    icon: "Layers",
  },
  {
    title: "Custom Designs",
    description: "From your file or created by our design team",
    icon: "Sparkles",
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
    description: "Serving Nigeria, Ghana, Togo, Benin & beyond",
    icon: "Truck",
  },
];

export const PROCESS_STEPS = [
  {
    step: 1,
    title: "Design",
    description: "Upload your design or work with our team to create one",
  },
  {
    step: 2,
    title: "Approve",
    description: "Review your digital proof and request any adjustments",
  },
  {
    step: 3,
    title: "Engrave",
    description: "Your cards are laser-engraved with precision equipment",
  },
  {
    step: 4,
    title: "Deliver",
    description: "Receive your premium cards, beautifully packaged",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "These cards changed how people perceive my brand. Every meeting starts with compliments.",
    author: "Adaeze Okonkwo",
    title: "CEO, Fintech Solutions Ltd",
    location: "Lagos, Nigeria",
  },
  {
    quote:
      "The quality is exceptional. I've had clients keep my card for months just because of how it feels.",
    author: "Kwame Asante",
    title: "Managing Director, Asante Holdings",
    location: "Accra, Ghana",
  },
  {
    quote:
      "Worth every kobo. These aren't just business cards — they're conversation starters.",
    author: "Emeka Nwosu",
    title: "Founder, NexGen Consulting",
    location: "Abuja, Nigeria",
  },
];

export const TRUST_LOGOS = [
  { name: "First Bank", logo: "/images/clients/firstbank.svg" },
  { name: "MTN", logo: "/images/clients/mtn.svg" },
  { name: "Dangote Group", logo: "/images/clients/dangote.svg" },
  { name: "Zenith Bank", logo: "/images/clients/zenith.svg" },
  { name: "Access Bank", logo: "/images/clients/access.svg" },
];

export const FAQ_ITEMS = [
  {
    question: "What is the minimum order quantity?",
    answer:
      "Our minimum order is 25 cards. This allows us to maintain quality while making premium metal cards accessible to individuals and small businesses.",
  },
  {
    question: "How long does production take?",
    answer:
      "Standard production is 5-7 business days after design approval. Rush orders (2-3 days) are available for an additional fee.",
  },
  {
    question: "What file formats do you accept for designs?",
    answer:
      "We accept AI, EPS, PDF (vector), and high-resolution PNG files (minimum 300 DPI). Our team can also help convert your existing designs.",
  },
  {
    question: "Do you ship outside Nigeria?",
    answer:
      "Yes! We ship across West Africa including Ghana, Togo, Benin, and Cameroon. Delivery times vary by location.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept bank transfers, mobile money (Nigeria & Ghana), and can discuss other payment options via WhatsApp.",
  },
  {
    question: "Can I see a sample before ordering?",
    answer:
      "We offer sample packs for serious inquiries. Contact us on WhatsApp to discuss sample options.",
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
