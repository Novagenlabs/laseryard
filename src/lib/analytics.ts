// Client-side analytics helpers for GA4 (gtag) and Meta Pixel (fbq).
// Every helper is a safe no-op when the pixel scripts aren't loaded —
// missing env IDs, SSR, or ad blockers.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackPageView(path: string) {
  window.gtag?.("event", "page_view", { page_path: path });
  window.fbq?.("track", "PageView");
}

export function trackViewProduct(name: string, valueUsd: number) {
  window.gtag?.("event", "view_item", {
    currency: "USD",
    value: valueUsd,
    items: [{ item_name: name }],
  });
  window.fbq?.("track", "ViewContent", {
    content_name: name,
    currency: "USD",
    value: valueUsd,
  });
}

export function trackBeginCheckout(valueUsd: number) {
  window.gtag?.("event", "begin_checkout", {
    currency: "USD",
    value: valueUsd,
  });
  window.fbq?.("track", "InitiateCheckout", {
    currency: "USD",
    value: valueUsd,
  });
}

export function trackPurchase(valueUsd: number, transactionId?: string) {
  window.gtag?.("event", "purchase", {
    currency: "USD",
    value: valueUsd,
    transaction_id: transactionId,
  });
  window.fbq?.("track", "Purchase", { currency: "USD", value: valueUsd });
}

export function trackWhatsAppClick(label: string) {
  window.gtag?.("event", "whatsapp_click", {
    event_category: "CTA",
    event_label: label,
  });
  window.fbq?.("track", "Contact", { content_name: label });
}
