export function GET() {
  const content = `# Laser Yard
> Precision laser engraving studio serving clients worldwide.

## Products

### Metal Business Cards
Premium laser-engraved aluminum business cards. Available in 0.4mm and 0.8mm thickness. Finishes include matte black, glossy, and brushed aluminum. Minimum order: 30 cards. NFC-enabled options available.

### Crystal Awards
3D laser-engraved crystal trophies and awards for corporate recognition, team events, and milestones. Multiple shapes available with custom text and logos.

### Wood Boards & Coasters
Laser-engraved wooden boards and coasters for restaurants, corporate gifting, and home decor. Natural wood with detailed custom engraving.

## Services

### Custom Engraving
Bring your own items for laser engraving. Supported materials: metal (stainless steel, aluminum, brass, copper), wood (hardwood, plywood, bamboo, MDF), acrylic (clear, colored, frosted), leather (genuine, faux), glass (bottles, awards, drinkware), and fabric (denim, canvas, patches).

## Key Information

- **Serving**: United Kingdom, United States, EU, UAE, Nigeria, Ghana, and 20+ countries worldwide
- **Production time**: 10-14 business days standard, 5-7 days rush
- **Minimum order**: 30 cards for metal business cards
- **Payment**: 50% deposit to start, 50% before shipping
- **Payment methods**: Bank transfer, mobile money (MTN MoMo, Airtel Money), international wire
- **Shipping**: Tracked worldwide delivery, 7-14 business days after design approval
- **Design formats accepted**: AI, EPS, PDF (vector), SVG, PNG (300+ DPI)
- **Contact**: WhatsApp (fastest), email hello@laseryard.com
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
- BE UNFORGETTABLE (Metal Cards Landing): https://laseryard.com/unforgettable
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
