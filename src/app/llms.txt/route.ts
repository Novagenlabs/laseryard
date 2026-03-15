export function GET() {
  const content = `# Laser Yard
> Precision laser engraving studio headquartered in Lagos, Nigeria, serving clients worldwide.

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

### Design Studio
Free online tool to upload your logo and preview how it will look laser-engraved on a metal business card. Interactive 3D preview, no account needed.

## Key Information

- **Headquarters**: Lagos, Nigeria
- **Serving**: Nigeria, Ghana, United Kingdom, United States, UAE, EU, and 20+ countries worldwide
- **Production time**: 10-14 business days standard, 5-7 days rush
- **Minimum order**: 30 cards for metal business cards
- **Payment**: 50% deposit to start, 50% before shipping
- **Payment methods**: Bank transfer, mobile money (MTN MoMo, Airtel Money), international wire
- **Shipping**: Lagos 24-48 hours, Nigeria 3-5 days, International 7-14 days
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
- Design Studio: https://laseryard.com/unforgettable/design-studio
- How It Works: https://laseryard.com/process
- FAQ: https://laseryard.com/faq
- About Us: https://laseryard.com/about
- Contact: https://laseryard.com/contact
- BE UNFORGETTABLE (Metal Cards Landing): https://laseryard.com/unforgettable
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
