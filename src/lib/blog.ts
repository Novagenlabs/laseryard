export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string[];
  sections: { heading: string; body: string }[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "metal-vs-paper-business-cards",
    title: "Metal vs Paper Business Cards: Which Makes a Better First Impression?",
    description:
      "A practical comparison of metal and paper business cards covering durability, cost, weight, and the impression each makes on clients and prospects.",
    date: "2026-03-10",
    readTime: "5 min read",
    tags: ["metal business cards", "networking", "branding"],
    sections: [
      {
        heading: "The problem with paper cards",
        body: "Most paper business cards end up in a drawer, a pocket, or the trash within a week. They bend, they tear, and they look exactly like every other card someone received that day. When your goal is to be remembered, a paper card is working against you.",
      },
      {
        heading: "What makes metal cards different",
        body: "A metal business card is heavier than expected. It's cold to the touch. When you hand one to someone, they pause. They flip it over, feel the weight, run their thumb across the engraving. That moment of surprise is the entire point. You've just created a memory tied to your name before you've even started talking about what you do.",
      },
      {
        heading: "Durability and lifespan",
        body: "Paper cards degrade. They get water damage, ink fades, corners curl. Metal cards don't. An aluminum or stainless steel card will look the same in five years as it did the day it was engraved. There's no ink to fade because the design is cut directly into the metal with a laser. Your card becomes something people keep in their wallet instead of recycling.",
      },
      {
        heading: "Cost per impression",
        body: "Yes, metal cards cost more per unit than paper. A pack of 30 metal cards costs significantly more than 500 paper cards from an online printer. But consider the math differently. If 90% of paper cards get thrown away, your effective cost per lasting impression is high. Metal cards get kept. They get shown to other people. They start conversations when someone pulls one out of their wallet months later. The cost per actual impression is often lower.",
      },
      {
        heading: "When paper still makes sense",
        body: "Paper cards work fine if you're handing out hundreds at a trade show and just need contact info distributed. They're disposable by design, and that's okay for certain situations. But if you're meeting clients one-on-one, pitching investors, or building a premium brand, the card should match the message.",
      },
      {
        heading: "The bottom line",
        body: "A metal business card doesn't just carry your contact information. It makes a statement about how you do business. It tells someone you care about details, quality, and making an impression. For professionals who rely on relationships and reputation, that first moment of contact matters more than most people realize.",
      },
    ],
  },
  {
    slug: "nfc-business-cards-guide",
    title: "NFC Business Cards: The Complete Guide for 2026",
    description:
      "Everything you need to know about NFC-enabled business cards. How they work, what you can link to, and why metal NFC cards outperform plastic ones.",
    date: "2026-03-08",
    readTime: "6 min read",
    tags: ["NFC", "metal business cards", "digital networking"],
    sections: [
      {
        heading: "What is an NFC business card?",
        body: "NFC stands for Near Field Communication. It's the same technology that powers contactless payments. An NFC business card has a tiny chip embedded inside it. When someone taps the card against their phone, it opens a link instantly. No app required, no QR code to scan. The phone just knows what to do.",
      },
      {
        heading: "What can you link to?",
        body: "The most common setup is a digital business card (like a Linktree or HiHello profile) that shows your photo, contact details, social links, and a button to save your info directly to the phone's contacts. But you can link to anything: your website, a portfolio, a booking page, a WhatsApp chat, or even a PDF menu if you run a restaurant.",
      },
      {
        heading: "Why metal NFC cards work better",
        body: "Plastic NFC cards exist, and they're cheaper. But they feel like hotel key cards. A metal NFC card combines the tech with something people actually want to hold onto. The NFC chip is embedded between layers or mounted on the back of an aluminum card. The result is a card that feels premium and does something useful when tapped.",
      },
      {
        heading: "Compatibility",
        body: "Every modern smartphone supports NFC. iPhones from the XS onward, and virtually all Android phones from 2018 onward. The person receiving your card doesn't need to install anything. They tap, a notification pops up, they tap the notification, and your link opens. It takes about two seconds.",
      },
      {
        heading: "Reprogrammable vs fixed",
        body: "Most NFC business cards are reprogrammable. That means if you change jobs, update your phone number, or redesign your digital profile, you don't need new cards. You just update the link the chip points to. The physical card stays the same. This is especially useful for people whose contact details change frequently.",
      },
      {
        heading: "Getting started",
        body: "At Laser Yard, we offer NFC-enabled metal business cards with your custom design laser-engraved on the front. You choose what the chip links to, and we handle the rest. The NFC chip is invisible from the outside. Your card looks like a standard metal business card until someone taps it.",
      },
    ],
  },
  {
    slug: "how-to-design-metal-business-card",
    title: "How to Design a Metal Business Card That Actually Works",
    description:
      "Practical design tips for metal business cards. What to include, what to leave out, file formats, and common mistakes that waste your money.",
    date: "2026-03-05",
    readTime: "5 min read",
    tags: ["design", "metal business cards", "tips"],
    sections: [
      {
        heading: "Less is more on metal",
        body: "The biggest mistake people make with metal business cards is trying to fit everything on them. Metal cards are smaller than you think when you're holding one, and laser engraving doesn't do well with tiny text. Keep it to your name, title, company, and one or two contact methods. That's it. The card itself is already doing the heavy lifting by being metal.",
      },
      {
        heading: "Choose the right elements",
        body: "Your logo is non-negotiable. After that, pick the contact details that matter most for how people actually reach you. If all your business comes through WhatsApp, put your WhatsApp number. If it's email, put your email. You don't need your fax number, your P.O. box, and three social media handles. Pick two contact methods maximum.",
      },
      {
        heading: "File formats that work",
        body: "Vector files (AI, EPS, SVG, PDF) give the best results because they scale without losing quality. If you only have a PNG, make sure it's at least 300 DPI. Low-resolution logos come out blurry when engraved. If you're unsure about your file quality, send it to us and we'll check it for free before you commit to an order.",
      },
      {
        heading: "Think about contrast",
        body: "On a matte black card, the engraving shows up as exposed metal underneath. On brushed steel, the engraving is a subtle texture change. Both look great, but they suit different design styles. Bold, simple logos work best on matte black. Detailed or intricate designs can work well on brushed steel where the contrast is softer.",
      },
      {
        heading: "Use both sides",
        body: "Front: logo and name. Back: contact details. This gives each side room to breathe and keeps the card clean. Cramming everything on one side wastes the back and makes the front look cluttered. Two-sided engraving costs a bit more but the result is significantly better.",
      },
      {
        heading: "Preview before you commit",
        body: "Use our free Design Studio at laseryard.com/unforgettable/design-studio to upload your logo and see how it looks on a metal card in 3D. No account needed. You can rotate the card, zoom in on the engraving, and decide if the design works before placing an order.",
      },
    ],
  },
  {
    slug: "metal-business-card-materials-aluminum-vs-steel",
    title: "Aluminum vs Stainless Steel Business Cards: Which Should You Choose?",
    description:
      "A comparison of aluminum and stainless steel for metal business cards. Weight, feel, durability, and which material suits your brand best.",
    date: "2026-03-01",
    readTime: "4 min read",
    tags: ["materials", "metal business cards", "aluminum", "stainless steel"],
    sections: [
      {
        heading: "Two materials, different impressions",
        body: "Both aluminum and stainless steel make excellent business cards, but they feel different in your hand. Aluminum is lighter and has a slightly warm tone. Stainless steel is heavier and cooler to the touch. Neither is objectively better. The right choice depends on the impression you want to make.",
      },
      {
        heading: "Aluminum: light and versatile",
        body: "Aluminum cards are available in 0.4mm and 0.8mm thickness. The 0.4mm option is similar in thickness to a credit card. It's light enough to carry a stack of them without noticing. Aluminum takes matte black coating well, which is our most popular finish. The laser cuts through the black coating to reveal bright silver metal underneath, creating high contrast.",
      },
      {
        heading: "Stainless steel: heavy and bold",
        body: "Stainless steel cards are noticeably heavier. When you hand one to someone, the weight is the first thing they notice. It feels expensive because it is. Steel cards work well with a brushed finish where the natural grain of the metal shows through. They're also more rigid, which gives them a substantial, executive feel.",
      },
      {
        heading: "Durability",
        body: "Both materials are built to last. Aluminum won't rust but can scratch if you're rough with it. Stainless steel is harder and more scratch-resistant. In practice, both will outlast any paper card by years. The engraving on either material is permanent because it's physically cut into the surface, not printed on top.",
      },
      {
        heading: "Cost difference",
        body: "Stainless steel cards cost more than aluminum due to material and engraving time. Steel is harder, so the laser needs more passes to achieve the same depth. For most people, aluminum in 0.4mm or 0.8mm thickness hits the sweet spot of quality, weight, and price.",
      },
      {
        heading: "Our recommendation",
        body: "If you want a matte black card with high-contrast engraving, go with aluminum. If you want maximum weight and a raw metal look, go with stainless steel. Not sure? Message us on WhatsApp with your logo and we'll mock up both options so you can compare.",
      },
    ],
  },
  {
    slug: "why-metal-business-cards-are-worth-it",
    title: "Are Metal Business Cards Worth It? Here's the Honest Answer",
    description:
      "A straightforward look at whether metal business cards justify their price. Real numbers, real scenarios, and who benefits most.",
    date: "2026-02-25",
    readTime: "4 min read",
    tags: ["metal business cards", "ROI", "networking"],
    sections: [
      {
        heading: "The real question",
        body: "Metal business cards cost more than paper. Nobody disputes that. The real question is whether that extra cost translates into something measurable: more remembered meetings, more follow-ups, more closed deals. For certain professionals, the answer is clearly yes.",
      },
      {
        heading: "Who benefits most",
        body: "Real estate agents, consultants, startup founders, luxury brand owners, and anyone in a client-facing role where trust and credibility matter. If your income depends on people remembering you after a brief meeting, a metal card pays for itself quickly. If you're handing out 500 cards at a college job fair, paper is fine.",
      },
      {
        heading: "The conversation starter effect",
        body: "The most valuable thing a metal card does isn't carry your phone number. It starts a conversation. People comment on it. They ask about it. They show it to whoever they're with. That 30-second interaction gives you more face time and a stronger memory anchor than a paper card that disappears into a pocket.",
      },
      {
        heading: "The wallet test",
        body: "Here's a simple test: how many paper business cards are in your wallet right now? Probably zero. People don't keep paper cards. But metal cards stay. They sit in wallets, on desks, in card holders. Every time someone sees it, they remember you. That's passive marketing that lasts for years.",
      },
      {
        heading: "The math",
        body: "Say a metal card order of 30 cards costs $150 (numbers vary by design). If even one of those cards leads to a single new client, the card paid for itself many times over. Compare that to $30 for 500 paper cards where maybe 5% get kept. The effective reach is similar, but the impression quality is on a completely different level.",
      },
      {
        heading: "The honest answer",
        body: "Metal business cards aren't for everyone. They're for people who meet clients face-to-face and need to be remembered. If that describes your work, yes, they're worth it. The cost per lasting impression is lower than paper, and the quality of those impressions is significantly higher.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
