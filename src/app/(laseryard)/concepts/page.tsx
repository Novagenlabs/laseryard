import { Suspense } from "react";
import { Metadata } from "next";
import { ConceptPicker } from "@/components/concepts/ConceptPicker";

export const metadata: Metadata = {
  title: "Your Card Designs | Laser Yard",
  description: "Pick the card designs that look good to you.",
  robots: { index: false, follow: false },
};

export default function ConceptsPage() {
  return (
    <section className="pt-40 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Which of these look good to you?
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tap every design you like, five to ten picks give us the best read
            on your taste. We build your final card from what you choose.
          </p>
        </div>

        <Suspense
          fallback={
            <p className="text-center text-muted-foreground py-16">
              Loading your designs...
            </p>
          }
        >
          <ConceptPicker />
        </Suspense>
      </div>
    </section>
  );
}
