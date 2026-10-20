import React from "react";

export const CATEGORY_LIQUID: Record<string, string> = {
  "tissue-repair":   "#5eead4",
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

interface VialIconProps {
  categorySlug?: string;
  color?: string;
  size?: number;
  fillRatio?: number;
}

export default function VialIcon({ categorySlug, color, size = 40, fillRatio = 0.65 }: VialIconProps) {
  const id = React.useId().replace(/:/g, "-");
  const fill = color ?? (categorySlug ? CATEGORY_LIQUID[categorySlug] : undefined) ?? "#94a3b8";
  const h = Math.round(size * 1.7);
  const liquidTopPct = 1 - fillRatio;
  const bodyH = 52;
  const liquidY = 10 + bodyH * liquidTopPct;

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 40 68"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0, display: "block" }}
    >
      <defs>
        <clipPath id={`vc-${id}`}>
          <rect x="7" y="10" width="26" height="52" rx="6" />
        </clipPath>
      </defs>

      {/* Glass background */}
      <rect x="7" y="10" width="26" height="52" rx="6" fill="white" />

      {/* Liquid fill */}
      <rect
        x="7"
        y={liquidY}
        width="26"
        height={10 + 52 - liquidY}
        fill={fill}
        fillOpacity="0.84"
        clipPath={`url(#vc-${id})`}
      />

      {/* Label sticker */}
      <rect x="11" y="30" width="18" height="16" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="0.8" />

      {/* Glass body outline */}
      <rect x="7" y="10" width="26" height="52" rx="6" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

      {/* Glass highlight */}
      <rect x="10" y="12" width="4" height="48" rx="2" fill="white" fillOpacity="0.45" clipPath={`url(#vc-${id})`} />

      {/* Rubber cap */}
      <rect x="13" y="1" width="14" height="11" rx="3" fill="#1e293b" />
      {/* Cap grooves */}
      <rect x="13" y="5"  width="14" height="1.5" fill="black" fillOpacity="0.18" />
      <rect x="13" y="8"  width="14" height="1.5" fill="black" fillOpacity="0.18" />
    </svg>
  );
}
