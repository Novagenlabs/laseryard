"use client";

import Avatar from "boring-avatars";

const NAMES = ["Adaeze O.", "Marcus T.", "Chioma N.", "Jamal B.", "Sophia K."];
const COLORS = ["#1c1c1c", "#d1c8af", "#eeede7", "#32342e", "#8b7355"];

/** Avatars, five stars and the client count, under the hero buttons. */
export function HeroProof() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex -space-x-2" aria-hidden>
        {NAMES.map((name) => (
          <span key={name} className="block rounded-full" style={{ border: "2px solid var(--g-bg)" }}>
            <Avatar size={32} name={name} variant="beam" colors={COLORS} />
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="flex gap-0.5" role="img" aria-label="Rated five stars">
          {[1, 2, 3, 4, 5].map((i) => (
            <svg key={i} viewBox="0 0 20 20" className="h-4 w-4" style={{ fill: "var(--g-accent)" }} aria-hidden>
              <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 15l-5.4 3 1.2-6L1.3 7.8l6.1-.7L10 1.5Z" />
            </svg>
          ))}
        </span>
        <span className="text-[14px] font-medium leading-5">500+ happy clients</span>
      </div>
    </div>
  );
}
