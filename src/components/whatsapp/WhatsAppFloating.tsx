"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X } from "lucide-react";
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGES } from "@/lib/constants";

export function WhatsAppFloating() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      WHATSAPP_MESSAGES.general
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl overflow-hidden"
            style={{
              boxShadow: `
                0 0 0 1px rgba(0, 0, 0, 0.04),
                0 4px 16px rgba(0, 0, 0, 0.08),
                0 12px 40px rgba(0, 0, 0, 0.12)
              `,
            }}
          >
            {/* Header */}
            <div
              className="p-5"
              style={{
                background: "linear-gradient(180deg, #25D366 0%, #20BD5A 100%)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-[15px]">Laser Yard</p>
                    <p className="text-[13px] text-white/85">
                      Usually replies instantly
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <p className="text-[15px] text-gray-800 leading-relaxed">
                  Hi there! Interested in laser engraving services?
                </p>
                <p className="text-[15px] text-gray-800 leading-relaxed mt-2">
                  Click below to chat with us on WhatsApp.
                </p>
              </div>

              <button
                onClick={handleWhatsAppClick}
                className="btn-apple btn-apple-whatsapp w-full"
              >
                <MessageCircle className="w-[18px] h-[18px]" />
                <span>Start Conversation</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: "linear-gradient(180deg, #25D366 0%, #20BD5A 100%)",
          boxShadow: `
            0 2px 8px rgba(37, 211, 102, 0.3),
            0 8px 24px rgba(37, 211, 102, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `,
        }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
