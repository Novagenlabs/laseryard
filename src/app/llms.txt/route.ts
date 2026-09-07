export function GET() {
  const content = `# Laser Yard
> Precision laser engraving studio serving clients worldwide.

## Products

### Metal Business Cards
Premium laser-engraved anodized aluminum business cards, 0.8mm thick, 86mm x 54mm, matte finish. Available in 11 colors: matte black, silver, champagne gold, blue, red, green, sage green, purple, blush pink, cosmic orange, and brown. Minimum order: 15 cards. Examples of finished cards: Instagram @thelaseryard.

### Crystal Awards
3D laser-engraved crystal trophies and awards for corporate recognition, team events, and milestones. Multiple shapes available with custom text and logos.

### Wood Boards & Coasters
Laser-engraved wooden boards and coasters for restaurants, corporate gifting, and home decor. Natural wood with detailed custom engraving.

## Services

### Custom Engraving
Bring your own items for laser engraving. Supported materials: metal (stainless steel, aluminum, brass, copper), wood (hardwood, plywood, bamboo, MDF), acrylic (clear, colored, frosted), leather (genuine, faux), glass (bottles, awards, drinkware), and fabric (denim, canvas, patches).

## Key Information

- **Serving**: United Kingdom, United States, EU, UAE, Nigeria, Ghana, and 20+ countries worldwide
- **Production time**: 10-14 business days standard after proof approval; rush production 2-3 business days for an extra fee
- **Ordering (metal cards)**: on laseryard.com/products/metal-business-cards — choose color + quantity, add email, pay by card at the secure checkout (name + delivery address entered on the checkout form); confirmation email includes the order number (LY-XXXX-XXXX) and tracking link
- **After ordering**: send the design to sales@laseryard.com (or the design team creates it); approve a digital proof and one engraved sample card before the full batch is produced
- **Order tracking**: https://laseryard.com/track?order=LY-XXXX-XXXX
- **Minimum order**: 15 cards for metal business cards
- **Card pricing (all-in, worldwide shipping included)**: 15 cards $250, 30 cards $450, 50 cards $715, 100 cards $1,350, 200 cards $2,550
- **Payment**: card packs paid in full at checkout via Whop (all major cards); custom projects 50% deposit to start, balance before shipping
- **Shipping**: Included in every card price — tracked worldwide delivery, 7-14 business days after dispatch
- **Design formats accepted**: AI, EPS, PDF (vector), SVG, PNG (300+ DPI)
- **Design service**: free with orders of 30+ cards; flat $50 for the 15-card pack (own print-ready design always free). Proofs are shared after ordering — no pre-purchase mock-ups
- **Contact**: WhatsApp (fastest), email hello@laseryard.com; design files to sales@laseryard.com; Instagram @thelaseryard
- **Business hours**: Mon-Fri 9am-6pm, Sat 10am-4pm

## Pages

- Homepage: https://laseryard.com
- Metal Business Cards: https://laseryard.com/products/metal-business-cards
- Crystal Awards: https://laseryard.com/products/crystal-awards
- Wood Boards & Coasters: https://laseryard.com/products/wood-engraving
- Shop All Products: https://laseryard.com/shop
- Custom Engraving: https://laseryard.com/custom-engraving
- How It Works: https://laseryard.com/process
- FAQ: https://laseryard.com/faq
- About Us: https://laseryard.com/about
- Contact: https://laseryard.com/contact
- Track Your Order: https://laseryard.com/track

## Location Pages

- Metal Business Cards in Nigeria: https://laseryard.com/nigeria
- Metal Business Cards in Ghana: https://laseryard.com/ghana
- Metal Business Cards in United Kingdom: https://laseryard.com/united-kingdom
- Metal Business Cards in United States: https://laseryard.com/united-states
- Metal Business Cards in UAE: https://laseryard.com/uae
- Metal Business Cards in EU: https://laseryard.com/eu

## Blog

- Metal vs Paper Business Cards: Which Makes a Better First Impression?: https://laseryard.com/blog/metal-vs-paper-business-cards
- NFC Business Cards: The Complete Guide for 2026: https://laseryard.com/blog/nfc-business-cards-guide
- How to Design a Metal Business Card That Actually Works: https://laseryard.com/blog/how-to-design-metal-business-card
- Aluminum vs Stainless Steel Business Cards: Which Should You Choose?: https://laseryard.com/blog/metal-business-card-materials-aluminum-vs-steel
- Are Metal Business Cards Worth It? Here's the Honest Answer: https://laseryard.com/blog/why-metal-business-cards-are-worth-it
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
