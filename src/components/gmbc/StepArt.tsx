export type StepArtKind = "quote" | "proof" | "ship";

/**
 * Line illustrations for the three ordering steps. Drawn in currentColor so
 * the parent decides the tint; the proof badge is filled with the panel
 * surface so it sits on top of the card outline.
 */
export function StepArt({
  kind,
  className,
  style,
}: {
  kind: StepArtKind;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {kind === "quote" && (
        <>
          {/* your message */}
          <path d="M14 18h46a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H34L22 60V50h-8a6 6 0 0 1-6-6V24a6 6 0 0 1 6-6Z" />
          <path d="M22 30h30M22 38h18" />
          {/* our quote comes back */}
          <path d="M46 58h34a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6h-6v8l-10-8H46a6 6 0 0 1-6-6V64a6 6 0 0 1 6-6Z" />
          <path d="M54 69h18" />
        </>
      )}
      {kind === "proof" && (
        <>
          {/* the card */}
          <rect x="10" y="24" width="64" height="40" rx="3" />
          <circle cx="22" cy="36" r="5" />
          <path d="M34 34h22M34 42h30M20 54h26" />
          {/* approved */}
          <circle cx="74" cy="64" r="13" style={{ fill: "var(--g-surface)" }} />
          <path d="M67.5 64l4.5 4.5 9-9" />
        </>
      )}
      {kind === "ship" && (
        <>
          {/* laser head and beam */}
          <path d="M40 8h16l-2 10H42L40 8Z" />
          <path d="M48 18v16" strokeDasharray="2 4" />
          <path d="M41 38l-3-3M55 38l3-3" />
          {/* the parcel */}
          <path d="M16 50l32-12 32 12-32 12-32-12Z" />
          <path d="M16 50v20l32 12 32-12V50" />
          <path d="M48 62v20" />
          <path d="M32 44l32 12" opacity={0.5} />
        </>
      )}
    </svg>
  );
}
