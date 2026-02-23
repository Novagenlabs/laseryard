interface ProductIllustrationProps {
  type: "metal-business-cards" | "crystal-awards" | "wood-engraving";
  className?: string;
}

function MetalBusinessCards({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Metal business cards illustration"
    >
      {/* Back card */}
      <rect
        x="50"
        y="30"
        width="150"
        height="90"
        rx="8"
        fill="url(#metal-card-3)"
        stroke="oklch(0.87 0.19 95 / 30%)"
        strokeWidth="1"
        transform="rotate(-6 125 75)"
      />
      {/* Middle card */}
      <rect
        x="45"
        y="35"
        width="150"
        height="90"
        rx="8"
        fill="url(#metal-card-2)"
        stroke="oklch(0.87 0.19 95 / 40%)"
        strokeWidth="1"
        transform="rotate(-2 120 80)"
      />
      {/* Front card */}
      <rect
        x="40"
        y="40"
        width="150"
        height="90"
        rx="8"
        fill="url(#metal-card-1)"
        stroke="oklch(0.87 0.19 95 / 60%)"
        strokeWidth="1.5"
      />
      {/* Card content lines */}
      <rect x="56" y="58" width="60" height="4" rx="2" fill="oklch(0.87 0.19 95 / 50%)" />
      <rect x="56" y="68" width="40" height="3" rx="1.5" fill="oklch(1 0 0 / 20%)" />
      <rect x="56" y="76" width="50" height="3" rx="1.5" fill="oklch(1 0 0 / 15%)" />
      {/* Logo placeholder */}
      <rect x="148" y="56" width="28" height="28" rx="6" fill="oklch(0.87 0.19 95 / 20%)" />
      <text x="162" y="74" textAnchor="middle" fill="oklch(0.87 0.19 95 / 60%)" fontSize="8" fontWeight="bold">LY</text>
      {/* Gold bottom edge line */}
      <line x1="56" y1="112" x2="174" y2="112" stroke="oklch(0.87 0.19 95 / 40%)" strokeWidth="1" />

      <defs>
        <linearGradient id="metal-card-1" x1="40" y1="40" x2="190" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2a2a2a" />
          <stop offset="0.5" stopColor="#1a1a1a" />
          <stop offset="1" stopColor="#111111" />
        </linearGradient>
        <linearGradient id="metal-card-2" x1="45" y1="35" x2="195" y2="125" gradientUnits="userSpaceOnUse">
          <stop stopColor="#222222" />
          <stop offset="1" stopColor="#151515" />
        </linearGradient>
        <linearGradient id="metal-card-3" x1="50" y1="30" x2="200" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e1e1e" />
          <stop offset="1" stopColor="#121212" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function CrystalAwards({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Crystal awards illustration"
    >
      {/* Gold radial glow */}
      <circle cx="120" cy="70" r="50" fill="url(#crystal-glow)" opacity="0.3" />

      {/* Crystal body - obelisk shape */}
      <polygon
        points="120,15 155,100 145,110 95,110 85,100"
        fill="url(#crystal-fill)"
        stroke="oklch(0.87 0.19 95 / 50%)"
        strokeWidth="1.5"
      />
      {/* Crystal highlight facet */}
      <polygon
        points="120,15 140,85 120,95 100,85"
        fill="oklch(1 0 0 / 8%)"
      />
      {/* Crystal inner edge */}
      <line x1="120" y1="15" x2="120" y2="95" stroke="oklch(1 0 0 / 12%)" strokeWidth="0.5" />

      {/* Base */}
      <rect x="75" y="110" width="90" height="14" rx="3" fill="url(#base-gradient)" stroke="oklch(0.87 0.19 95 / 40%)" strokeWidth="1" />
      {/* Base gold accent */}
      <rect x="85" y="115" width="70" height="4" rx="2" fill="oklch(0.87 0.19 95 / 30%)" />

      {/* Light rays */}
      <line x1="120" y1="30" x2="170" y2="20" stroke="oklch(0.87 0.19 95 / 15%)" strokeWidth="0.5" />
      <line x1="120" y1="30" x2="70" y2="20" stroke="oklch(0.87 0.19 95 / 15%)" strokeWidth="0.5" />
      <line x1="120" y1="30" x2="180" y2="40" stroke="oklch(0.87 0.19 95 / 10%)" strokeWidth="0.5" />
      <line x1="120" y1="30" x2="60" y2="40" stroke="oklch(0.87 0.19 95 / 10%)" strokeWidth="0.5" />

      {/* Star/sparkle on crystal */}
      <g transform="translate(130, 55)">
        <line x1="-5" y1="0" x2="5" y2="0" stroke="oklch(0.87 0.19 95 / 60%)" strokeWidth="1" />
        <line x1="0" y1="-5" x2="0" y2="5" stroke="oklch(0.87 0.19 95 / 60%)" strokeWidth="1" />
        <line x1="-3" y1="-3" x2="3" y2="3" stroke="oklch(0.87 0.19 95 / 30%)" strokeWidth="0.5" />
        <line x1="3" y1="-3" x2="-3" y2="3" stroke="oklch(0.87 0.19 95 / 30%)" strokeWidth="0.5" />
      </g>

      <defs>
        <radialGradient id="crystal-glow" cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="oklch(0.87 0.19 95)" stopOpacity="0.4" />
          <stop offset="1" stopColor="oklch(0.87 0.19 95)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="crystal-fill" x1="120" y1="15" x2="120" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.25 0.01 240)" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="oklch(0.20 0.01 240)" stopOpacity="0.7" />
          <stop offset="1" stopColor="oklch(0.15 0.01 240)" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="base-gradient" x1="75" y1="110" x2="75" y2="124" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2a2a2a" />
          <stop offset="1" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function WoodEngraving({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Wood engraving illustration"
    >
      {/* Wood board */}
      <rect
        x="30"
        y="25"
        width="180"
        height="110"
        rx="12"
        fill="url(#wood-fill)"
        stroke="oklch(0.45 0.08 60 / 50%)"
        strokeWidth="1.5"
      />

      {/* Wood grain lines */}
      <path d="M30 55 Q80 50 130 58 Q180 65 210 55" stroke="oklch(0.35 0.06 50 / 30%)" strokeWidth="0.8" fill="none" />
      <path d="M30 75 Q90 70 140 78 Q190 85 210 72" stroke="oklch(0.35 0.06 50 / 25%)" strokeWidth="0.8" fill="none" />
      <path d="M30 95 Q70 90 120 96 Q170 102 210 92" stroke="oklch(0.35 0.06 50 / 20%)" strokeWidth="0.8" fill="none" />
      <path d="M30 115 Q85 110 135 116 Q185 122 210 112" stroke="oklch(0.35 0.06 50 / 15%)" strokeWidth="0.8" fill="none" />

      {/* Laser-engraved circular emblem */}
      <circle
        cx="120"
        cy="80"
        r="32"
        fill="none"
        stroke="oklch(0.87 0.19 95 / 50%)"
        strokeWidth="1.5"
      />
      <circle
        cx="120"
        cy="80"
        r="26"
        fill="none"
        stroke="oklch(0.87 0.19 95 / 30%)"
        strokeWidth="0.8"
      />

      {/* Engraved text placeholder inside circle */}
      <rect x="106" y="73" width="28" height="3" rx="1.5" fill="oklch(0.87 0.19 95 / 45%)" />
      <rect x="110" y="80" width="20" height="2" rx="1" fill="oklch(0.87 0.19 95 / 30%)" />
      <rect x="112" y="86" width="16" height="2" rx="1" fill="oklch(0.87 0.19 95 / 25%)" />

      {/* Small decorative dots around circle */}
      <circle cx="120" cy="48" r="1.5" fill="oklch(0.87 0.19 95 / 40%)" />
      <circle cx="120" cy="112" r="1.5" fill="oklch(0.87 0.19 95 / 40%)" />
      <circle cx="88" cy="80" r="1.5" fill="oklch(0.87 0.19 95 / 40%)" />
      <circle cx="152" cy="80" r="1.5" fill="oklch(0.87 0.19 95 / 40%)" />

      <defs>
        <linearGradient id="wood-fill" x1="30" y1="25" x2="210" y2="135" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.35 0.08 55)" />
          <stop offset="0.5" stopColor="oklch(0.30 0.07 50)" />
          <stop offset="1" stopColor="oklch(0.25 0.06 45)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ProductIllustration({ type, className }: ProductIllustrationProps) {
  switch (type) {
    case "metal-business-cards":
      return <MetalBusinessCards className={className} />;
    case "crystal-awards":
      return <CrystalAwards className={className} />;
    case "wood-engraving":
      return <WoodEngraving className={className} />;
  }
}
