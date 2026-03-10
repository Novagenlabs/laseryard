import { Metadata } from "next";
import { ProductPage } from "./ProductPage";

export const metadata: Metadata = {
  title: "Premium Metal Business Cards",
  description:
    "Precision-cut aluminum business cards with custom laser engraving. Available in 0.4mm and 0.8mm thickness. Get a personalized quote today.",
};

export default function MetalBusinessCardsPage() {
  return <ProductPage />;
}
