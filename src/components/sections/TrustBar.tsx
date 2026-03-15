"use client";

const TRUST_BRANDS = [
  { name: "Novagen", className: "font-[family-name:var(--font-montserrat)] font-extrabold tracking-[0.2em]" },
  { name: "Yours&Yours", className: "font-serif italic tracking-wide" },
  { name: "LaModa", className: "font-[family-name:var(--font-poppins)] font-light tracking-[0.3em] uppercase" },
  { name: "NovaEdge", className: "font-[family-name:var(--font-montserrat)] font-bold tracking-tight" },
];

export function TrustBar() {
  return (
    <section className="bg-foreground py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-8 sm:gap-12 lg:gap-16 flex-wrap">
          {TRUST_BRANDS.map((brand) => (
            <span
              key={brand.name}
              className={`text-background/40 text-sm sm:text-base select-none ${brand.className}`}
            >
              {brand.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
