import { HeroSection } from "@/components/sections/HeroSection";
import { TrustSignals } from "@/components/sections/TrustSignals";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { FeaturesGrid } from "@/components/sections/FeaturesGrid";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { TestimonialsSlider } from "@/components/sections/TestimonialsSlider";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTABanner } from "@/components/sections/CTABanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustSignals />
      <ProductShowcase />
      <FeaturesGrid />
      <ProcessSteps />
      <TestimonialsSlider />
      <FAQAccordion />
      <CTABanner />
    </>
  );
}
