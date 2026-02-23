import { HeroSection } from "@/components/sections/HeroSection";
import { TwoPathSection } from "@/components/sections/TwoPathSection";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { CustomEngravingSection } from "@/components/sections/CustomEngravingSection";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { TestimonialsSlider } from "@/components/sections/TestimonialsSlider";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTABanner } from "@/components/sections/CTABanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TwoPathSection />
      <ProductShowcase />
      <CustomEngravingSection />
      <ProcessSteps />
      <TestimonialsSlider />
      <FAQAccordion />
      <CTABanner />
    </>
  );
}
