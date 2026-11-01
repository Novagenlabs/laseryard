import { WHATSAPP_NUMBER } from "@/lib/constants";

export const WA_QUOTE_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi! I'd like a quote for metal business cards. Finish, quantity and country: "
)}`;
export const WA_FINISH_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi! I'm not sure which finish suits my logo — can I send it over for a suggestion?"
)}`;
export const INSTAGRAM_URL = "https://instagram.com/getmetalbusinesscards";

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden className={className}>
      <path d="M1.5 8.5L8.5 1.5M3 1.5h5.5V7" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="block h-[14px] w-[22px] shrink-0" style={{ background: "var(--g-accent)" }} aria-hidden />
      <span className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.14em] sm:text-[13px]" style={{ color: "var(--g-text)" }}>
        Get Metal Business Cards
      </span>
    </span>
  );
}
