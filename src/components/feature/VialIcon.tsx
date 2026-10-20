import React from "react";

export const CATEGORY_CAP: Record<string, string> = {
  "tissue-repair":   "#2dd4bf",
  "metabolic":       "#fb923c",
  "gh-secretagogue": "#60a5fa",
  "growth-factor":   "#a78bfa",
  "longevity":       "#34d399",
  "mitochondrial":   "#fbbf24",
  "cognitive":       "#818cf8",
  "immune":          "#f87171",
  "cosmetic":        "#f9a8d4",
  "endocrine":       "#86efac",
  "blends":          "#94a3b8",
};

// Keep old export name so other files that imported it still compile
export const CATEGORY_LIQUID = CATEGORY_CAP;

export interface VialIconProps {
  categorySlug?: string;
  color?: string;
  size?: number;
  /** @deprecated no-op — vials are always clean glass now */
  fillRatio?: number;
  /** @deprecated no-op — vials are always clean glass now */
  blank?: boolean;
  /** Peptide name shown on the label */
  label?: string;
  /** Size / concentration shown below the name */
  sublabel?: string;
  /** When set, renders a COA badge on the label */
  coaUrl?: string;
  className?: string;
}

export default function VialIcon({
  categorySlug, color, size = 40,
  label, sublabel, coaUrl, className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fillRatio: _fr, blank: _bl,
}: VialIconProps) {
  const uid = React.useId().replace(/:/g, "-");
  const capColor = color ?? (categorySlug ? CATEGORY_CAP[categorySlug] : undefined) ?? "#94a3b8";
  const w = size;
  const h = Math.round(size * 1.73);
  const showText = label && size >= 32;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 52 90"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={!label}
      aria-label={label ? `${label}${sublabel ? ` ${sublabel}` : ""} vial` : undefined}
      style={{ flexShrink: 0, display: "block" }}
      className={className}
    >
      <defs>
        <clipPath id={`body-${uid}`}>
          <rect x="10" y="18" width="32" height="68" rx="7" />
        </clipPath>
        <linearGradient id={`glass-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#dbeafe" stopOpacity="0.55" />
          <stop offset="18%"  stopColor="white"   stopOpacity="0.92" />
          <stop offset="72%"  stopColor="white" />
          <stop offset="100%" stopColor="#eff6ff"  stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={`ring-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#f1f5f9" />
          <stop offset="45%"  stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* ── Rubber stopper ── */}
      <rect x="17" y="4"  width="18" height="13" rx="3"   fill="#1e293b" />
      <rect x="17" y="8"  width="18" height="1.2"          fill="black"  fillOpacity="0.18" />
      <rect x="17" y="11" width="18" height="1.2"          fill="black"  fillOpacity="0.18" />
      {/* Stopper highlight */}
      <rect x="19" y="5"  width="5"  height="6"   rx="1.5" fill="white"  fillOpacity="0.12" />

      {/* ── Flip-off cap ── */}
      <rect x="14" y="1" width="24" height="15" rx="4.5" fill={capColor} />
      {/* Cap shine */}
      <rect x="17" y="3" width="9"  height="5"   rx="2"   fill="white"  fillOpacity="0.28" />
      {/* Cap bottom rim */}
      <rect x="14" y="13" width="24" height="3" rx="1.5"  fill="black"  fillOpacity="0.12" />
      {/* Cap outline */}
      <rect x="14" y="1" width="24" height="15" rx="4.5"  fill="none"   stroke="rgba(0,0,0,0.1)" strokeWidth="0.7" />

      {/* ── Aluminum crimp ring ── */}
      <rect x="10" y="14" width="32" height="6" rx="2"    fill={`url(#ring-${uid})`} />
      <rect x="10" y="15.5" width="32" height="1"         fill="white"  fillOpacity="0.5" />
      <rect x="10" y="14" width="32" height="6" rx="2"    fill="none"   stroke="#94a3b8" strokeWidth="0.5" />

      {/* ── Glass body ── */}
      <rect x="10" y="18" width="32" height="68" rx="7"   fill={`url(#glass-${uid})`} />

      {/* Left highlight streak */}
      <rect x="13" y="21" width="5" height="62" rx="2.5"
        fill="white" fillOpacity="0.6"
        clipPath={`url(#body-${uid})`}
      />
      {/* Right edge */}
      <rect x="39" y="21" width="3" height="62" rx="0"
        fill="#bfdbfe" fillOpacity="0.35"
        clipPath={`url(#body-${uid})`}
      />

      {/* ── Label ── */}
      <rect x="12" y="28" width="28" height="40" rx="2.5" fill="white" />

      {/* Label top colour band */}
      <rect x="12" y="28" width="28" height="7"   rx="2.5" fill={capColor} fillOpacity="0.7" />
      <rect x="12" y="32" width="28" height="3"            fill={capColor} fillOpacity="0.7" />

      {/* Label bottom accent line */}
      <rect x="12" y="64" width="28" height="3.5" rx="0"   fill={capColor} fillOpacity="0.25" />
      <rect x="12" y="65" width="28" height="2.5" rx="0"   fill={capColor} fillOpacity="0.15" />

      {/* Label border */}
      <rect x="12" y="28" width="28" height="40" rx="2.5"  fill="none" stroke="#e2e8f0" strokeWidth="0.6" />

      {/* Name */}
      {showText && (
        <text
          x="26" y="44"
          textAnchor="middle"
          fontSize="5.8"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontWeight="800"
          fill="#0f172a"
          letterSpacing="0.25"
        >
          {label!.length > 9 ? label!.slice(0, 8) + "…" : label}
        </text>
      )}

      {/* Sub-label */}
      {showText && sublabel && (
        <text
          x="26" y="54"
          textAnchor="middle"
          fontSize="4.8"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontWeight="600"
          fill="#475569"
        >
          {sublabel}
        </text>
      )}

      {/* COA badge */}
      {showText && coaUrl && (
        <text
          x="26" y="63"
          textAnchor="middle"
          fontSize="3.6"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontWeight="700"
          fill={capColor}
          letterSpacing="0.6"
        >
          COA ✓
        </text>
      )}

      {/* Glass body outline */}
      <rect x="10" y="18" width="32" height="68" rx="7" fill="none" stroke="#c8d5e0" strokeWidth="1" />

      {/* Bottom dome */}
      <ellipse cx="26" cy="84" rx="13" ry="3"
        fill="white" fillOpacity="0.45"
        clipPath={`url(#body-${uid})`}
      />
    </svg>
  );
}
