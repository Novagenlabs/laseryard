import {
  WEBSITE_PACK_PRICES,
  type CardQuantity,
  type CardThickness,
} from "./constants";

/**
 * Full price table, including the packs sold by custom quote (100 and 200).
 *
 * SERVER CODE ONLY: import this from API routes, never from a component. The
 * website shows no price for the 100 and 200 packs, so these numbers must not
 * reach the browser. The WhatsApp agent's checkout tool still uses them.
 */
export const CARD_PRICING: Record<
  CardThickness,
  { label: string; prices: Record<CardQuantity, number> }
> = {
  "0.8mm": {
    label: "Premium",
    prices: { ...WEBSITE_PACK_PRICES, 100: 1350, 200: 2550 },
  },
};
