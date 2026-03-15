import { HeroSection } from "@/components/sections/HeroSection";
import { TrustBar } from "@/components/sections/TrustBar";
import { ValueProps } from "@/components/sections/ValueProps";
import { MetalCardFeatures } from "@/components/sections/MetalCardFeatures";
import { OrderProcess } from "@/components/sections/OrderProcess";
import { TestimonialsSlider } from "@/components/sections/TestimonialsSlider";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/JsonLd";
import { faqSchema } from "@/lib/schema";
import { FAQ_ITEMS } from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={faqSchema(
          FAQ_ITEMS.map((item) => ({
            question: item.question,
            answer: item.answer,
          }))
        )}
      />
      <HeroSection />
      <TrustBar />
      <ValueProps />
      <MetalCardFeatures />
      <OrderProcess />
      <TestimonialsSlider />
      <FAQAccordion />
      <FinalCTA />
    </>
  );
}
