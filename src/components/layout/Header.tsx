"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, MessageCircle } from "lucide-react";
import { NAV_LINKS, WHATSAPP_NUMBER, WHATSAPP_MESSAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      WHATSAPP_MESSAGES.general
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-smooth",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border"
            : "bg-transparent"
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="relative z-10 flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/images/laseryard_logo_large.png"
                  alt="Laser Yard"
                  width={2000}
                  height={2000}
                  className="h-28 w-auto"
                  priority
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden lg:flex items-center gap-1"
            >
              {NAV_LINKS.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 group"
                >
                  {link.label}
                  <span className="absolute bottom-1 left-4 right-4 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:flex items-center gap-4"
            >
              <button
                onClick={handleWhatsAppClick}
                className="btn-apple btn-apple-whatsapp !py-2.5 !px-5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Get Quote</span>
              </button>
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative z-10 p-2 -mr-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border"
            >
              <div className="flex flex-col h-full pt-24 px-6 pb-8">
                <div className="flex-1 space-y-1">
                  {NAV_LINKS.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-4 text-2xl font-medium text-foreground hover:text-gold transition-colors border-b border-border"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={handleWhatsAppClick}
                    className="w-full bg-whatsapp hover:bg-whatsapp-dark text-white font-semibold py-6 gap-2 text-lg"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat on WhatsApp
                  </Button>
                </motion.div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
