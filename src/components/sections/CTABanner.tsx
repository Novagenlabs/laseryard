"use client";

import { motion } from "motion/react";
import { Phone } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WhatsAppCTA } from "@/components/whatsapp/WhatsAppCTA";

export function CTABanner() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-gold/10 to-transparent" />
            <div className="absolute inset-0 bg-card" />

            {/* Animated Orbs */}
            <motion.div
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{
                x: [0, -20, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px]"
            />

            {/* Content */}
            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
              >
                Ready to Elevate Your{" "}
                <span className="text-gradient-gold">Networking?</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10"
              >
                From metal business cards to custom signage — bring your vision
                to life with precision laser engraving. Get your quote in minutes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <WhatsAppCTA
                  buttonText="Start Your Order"
                  size="lg"
                  variant="gold"
                  message="Hi! I'm ready to order premium metal business cards. Can we get started?"
                  trackingLabel="cta-banner"
                />

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>+234 801 234 5678</span>
                </div>
              </motion.div>

              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-10 pt-8 border-t border-border/50"
              >
                <p className="text-sm text-muted-foreground">
                  <span className="text-gold font-semibold">500+</span>{" "}
                  executives trust Laser Yard for premium business cards
                </p>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
