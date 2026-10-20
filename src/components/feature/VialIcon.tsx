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

export const CATEGORY_LIQUID = CATEGORY_CAP;

export interface VialIconProps {
  categorySlug?: string;
  color?: string;
  size?: number;
  /** @deprecated no-op */
  fillRatio?: number;
  /** @deprecated no-op */
  blank?: boolean;
  label?: string;
  sublabel?: string;
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
  const accentColor = color ?? (categorySlug ? CATEGORY_CAP[categorySlug] : undefined) ?? "#94a3b8";
  const w = size;
  const h = Math.round(size * 1.65);
  const showText = label && size >= 32;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 52 86"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={!label}
      aria-label={label ? `${label}${sublabel ? ` ${sublabel}` : ""} vial` : undefined}
      style={{ flexShrink: 0, display: "block" }}
      className={className}
    >
      <defs>
        {/* Clip path for glass body */}
        <clipPath id={`body-${uid}`}>
          <rect x="7" y="19" width="38" height="64" rx="9" />
        </clipPath>

        {/* Glass horizontal gradient — bright left highlight, clear body */}
        <linearGradient id={`glass-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#b8d4ea" stopOpacity="0.85" />
          <stop offset="9%"   stopColor="white"   stopOpacity="0.98" />
          <stop offset="22%"  stopColor="white"   stopOpacity="0.65" />
          <stop offset="58%"  stopColor="white"   stopOpacity="0.48" />
          <stop offset="82%"  stopColor="#dce8f0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="white"   stopOpacity="0.38" />
        </linearGradient>

        {/* Brushed aluminum crimp — vertical */}
        <linearGradient id={`crimp-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#f2f4f6" />
          <stop offset="28%"  stopColor="#cdd5dc" />
          <stop offset="68%"  stopColor="#a8b4be" />
          <stop offset="100%" stopColor="#8a98a4" />
        </linearGradient>

        {/* Stopper — dark matte black */}
        <linearGradient id={`stopper-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#2a2a2e" />
          <stop offset="35%"  stopColor="#1a1a1e" />
          <stop offset="100%" stopColor="#121214" />
        </linearGradient>
      </defs>

      {/* ── Rubber stopper (dark, sits in neck) ── */}
      <rect x="17" y="7" width="18" height="11" rx="3"
        fill={`url(#stopper-${uid})`} />
      {/* Stopper groove lines */}
      <rect x="17" y="10"  width="18" height="1"   fill="black"  fillOpacity="0.35" />
      <rect x="17" y="13"  width="18" height="1"   fill="black"  fillOpacity="0.25" />
      {/* Stopper left shine */}
      <rect x="19" y="8"   width="4"  height="6"   rx="1.5"
        fill="white"  fillOpacity="0.09" />

      {/* ── Matte black flip-off cap ── */}
      <rect x="14" y="1" width="24" height="13" rx="4.5" fill="#1c1c20" />
      {/* Very subtle texture highlight at top */}
      <ellipse cx="26" cy="3.5" rx="7" ry="1.8"
        fill="white" fillOpacity="0.07" />
      {/* Subtle side sheen */}
      <rect x="16" y="2" width="5" height="9" rx="2"
        fill="white" fillOpacity="0.05" />
      {/* Bottom rim shadow */}
      <rect x="14" y="11" width="24" height="3" rx="1.5"
        fill="black" fillOpacity="0.3" />
      {/* Cap outline */}
      <rect x="14" y="1" width="24" height="13" rx="4.5"
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />

      {/* ── Aluminum crimp ring ── */}
      <rect x="9" y="14" width="34" height="7" rx="2.5"
        fill={`url(#crimp-${uid})`} />
      {/* Score lines (horizontal brushed lines) */}
      <rect x="9" y="15.2" width="34" height="0.7" fill="white"  fillOpacity="0.5" />
      <rect x="9" y="17.0" width="34" height="0.7" fill="white"  fillOpacity="0.35" />
      <rect x="9" y="18.8" width="34" height="0.7" fill="black"  fillOpacity="0.12" />
      {/* Category color accent stripe at bottom of crimp */}
      <rect x="9" y="19.5" width="34" height="1.5" rx="0"
        fill={accentColor} fillOpacity="0.7" />
      {/* Crimp outline */}
      <rect x="9" y="14" width="34" height="7" rx="2.5"
        fill="none" stroke="#8090a0" strokeWidth="0.45" />

      {/* ── Glass body ── */}
      <rect x="7" y="19" width="38" height="64" rx="9"
        fill={`url(#glass-${uid})`} />

      {/* Left bright highlight streak (key realism element) */}
      <rect x="9.5" y="22" width="4.5" height="56" rx="2.25"
        fill="white" fillOpacity="0.78"
        clipPath={`url(#body-${uid})`} />

      {/* Secondary left inner highlight */}
      <rect x="15" y="24" width="2" height="48" rx="1"
        fill="white" fillOpacity="0.28"
        clipPath={`url(#body-${uid})`} />

      {/* Right edge tint */}
      <rect x="40" y="22" width="4" height="56"
        fill="#c8dcea" fillOpacity="0.3"
        clipPath={`url(#body-${uid})`} />

      {/* Top shoulder inner reflection (curved bright area below crimp) */}
      <ellipse cx="20" cy="26" rx="5" ry="3"
        fill="white" fillOpacity="0.22"
        clipPath={`url(#body-${uid})`} />

      {/* ── Minimal text (no label band — text floats on clear glass) ── */}
      {showText && (
        <>
          {/* Subtle frosted backdrop for readability (no visible rectangle) */}
          <rect x="13" y="35" width="26" height={sublabel ? 22 : 14} rx="3"
            fill="white" fillOpacity="0.38"
            clipPath={`url(#body-${uid})`} />

          {/* Peptide name */}
          <text
            x="26" y="46"
            textAnchor="middle"
            fontSize="5.8"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontWeight="800"
            fill="#0f172a"
            letterSpacing="0.3"
            clipPath={`url(#body-${uid})`}
          >
            {label!.length > 9 ? label!.slice(0, 8) + "…" : label}
          </text>

          {/* Sublabel */}
          {sublabel && (
            <text
              x="26" y="55"
              textAnchor="middle"
              fontSize="4.8"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontWeight="600"
              fill="#334155"
              clipPath={`url(#body-${uid})`}
            >
              {sublabel}
            </text>
          )}

          {/* COA badge */}
          {coaUrl && (
            <text
              x="26" y="65"
              textAnchor="middle"
              fontSize="3.6"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontWeight="700"
              fill={accentColor}
              letterSpacing="0.6"
              clipPath={`url(#body-${uid})`}
            >
              COA ✓
            </text>
          )}
        </>
      )}

      {/* ── Glass body outline ── */}
      <rect x="7" y="19" width="38" height="64" rx="9"
        fill="none" stroke="#aabbc8" strokeWidth="0.8" />

      {/* ── Bottom dome reflection ── */}
      <ellipse cx="26" cy="80" rx="15" ry="3"
        fill="white" fillOpacity="0.42"
        clipPath={`url(#body-${uid})`} />

      {/* ── Outer ambient shadow under vial ── */}
      <ellipse cx="26" cy="84" rx="13" ry="1.8"
        fill="black" fillOpacity="0.08" />
    </svg>
  );
}
