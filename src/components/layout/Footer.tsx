import Link from "next/link";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { NAV_LINKS, WHATSAPP_NUMBER, COUNTRIES } from "@/lib/constants";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Process", href: "/process" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  products: [
    { label: "Shop All Products", href: "/shop" },
    { label: "Metal Business Cards", href: "/products/metal-business-cards" },
    { label: "Crystal Awards", href: "/products/crystal-awards" },
    { label: "Wood Engraving", href: "/products/wood-engraving" },
    { label: "Custom Engraving", href: "/custom-engraving" },
  ],
  regions: COUNTRIES.map((c) => ({
    label: c.name,
    href: `/${c.slug}`,
  })),
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <img
                src="/images/laseryard_logos/logo_light.png"
                alt="Laser Yard"
                className="h-24 w-auto dark:hidden"
              />
              <img
                src="/images/laseryard_logos/logo_dark.png"
                alt=""
                aria-hidden="true"
                className="h-24 w-auto hidden dark:block"
              />
            </Link>
            <p className="mt-4 text-muted-foreground max-w-sm leading-relaxed">
              Laser engraving studio based in Lagos, serving all of West Africa.
              We sell ready-made products and engrave items you bring us.
            </p>

            {/* Contact Info */}
            <div className="mt-8 space-y-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-whatsapp transition-colors focus-visible:text-whatsapp focus-visible:outline-none"
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                <span>Talk to us on WhatsApp</span>
              </a>
              <a
                href="mailto:hello@laseryard.com"
                className="flex items-center gap-3 text-muted-foreground hover:text-gold transition-colors focus-visible:text-gold focus-visible:outline-none"
              >
                <Mail className="w-5 h-5" aria-hidden="true" />
                <span>hello@laseryard.com</span>
              </a>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5" aria-hidden="true" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Products & Services</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">We Serve</h4>
            <ul className="space-y-3">
              {footerLinks.regions.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Laser Yard. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-gold transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gold transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
