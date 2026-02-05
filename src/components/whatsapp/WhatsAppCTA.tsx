"use client";

import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface WhatsAppCTAProps {
  message?: string;
  buttonText?: string;
  variant?: "whatsapp" | "gold" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
  trackingLabel?: string;
}

export function WhatsAppCTA({
  message = "Hi! I'm interested in your laser engraving services.",
  buttonText = "Chat on WhatsApp",
  variant = "whatsapp",
  size = "md",
  className,
  trackingLabel = "general",
}: WhatsAppCTAProps) {
  const handleClick = () => {
    // Analytics tracking
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "whatsapp_click", {
        event_category: "CTA",
        event_label: trackingLabel,
      });
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const variants = {
    whatsapp: "btn-apple btn-apple-whatsapp",
    gold: "btn-apple btn-apple-primary",
    secondary: "btn-apple btn-apple-secondary",
  };

  const sizes = {
    sm: "!py-2.5 !px-5 !text-sm",
    md: "!py-3 !px-6 !text-[0.9375rem]",
    lg: "!py-4 !px-8 !text-base",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-[1.125rem] h-[1.125rem]",
    lg: "w-5 h-5",
  };

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        variants[variant],
        sizes[size],
        className
      )}
    >
      <MessageCircle className={cn(iconSizes[size], "flex-shrink-0")} aria-hidden="true" />
      <span>{buttonText}</span>
    </motion.button>
  );
}
