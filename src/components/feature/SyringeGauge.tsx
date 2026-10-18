import { useEffect, useRef, useState } from "react";

type SyringeGaugeProps = {
  units: number;
  max?: number;
  compact?: boolean;
};

function fmt(v: number) {
  const r = Math.round(v * 10) / 10;
  return Number.isInteger(r) ? `${r}` : r.toFixed(1);
}

// ─── Full syringe layout (matches OptimalDosages SVG structure) ───────────────
const F_VBW = 560, F_VBH = 78;
const F_BX = 74, F_BY = 31, F_BW = 412, F_BH = 26; // barrel
const F_BX2 = F_BX + F_BW; // 486 (right edge of barrel)
const F_CY = F_BY + F_BH / 2; // 44 (vertical centre)

// ─── Compact syringe layout ───────────────────────────────────────────────────
const C_VBW = 200, C_VBH = 22;
const C_BX = 18, C_BY = 4, C_BW = 148, C_BH = 14;
const C_CY = C_BY + C_BH / 2;

// ─── Color tokens (CSS vars so they respect the theme) ────────────────────────
const CLR = {
  needle:   "#94A3B8",
  accent:   "oklch(var(--accent-600))",
  barrelBg: "oklch(var(--background-50))",
  barrelBd: "oklch(var(--background-200))",
  liquid:   "#38BDF8",     // sky blue — looks like water
  tickMaj:  "#94A3B8",
  tickMin:  "#CBD5E1",
  label:    "oklch(var(--foreground-500))",
  plunger:  "oklch(var(--primary-600))",
  rod:      "oklch(var(--background-200))",
};

// ─── Smooth rAF animation hook ────────────────────────────────────────────────
function useAnimatedValue(target: number, skip: boolean) {
  const [val, setVal] = useState(skip ? target : 0);
  const rafRef = useRef<number>(0);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (skip) { setVal(target); return; }
    const from = prevTarget.current === target ? val : val;
    prevTarget.current = target;
    const start = performance.now();
    const startVal = val;
    const dur = 700;

    const tick = (now: number) => {
      const raw = Math.min(1, (now - start) / dur);
      // ease-out cubic
      const t = 1 - Math.pow(1 - raw, 3);
      setVal(startVal + (target - startVal) * t);
      if (raw < 1) rafRef.current = requestAnimationFrame(tick);
    };

    // Small delay so React finishes the first paint before animating
    const id = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, 80);

    return () => {
      clearTimeout(id);
      cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return val;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SyringeGauge({ units, max = 100, compact = false }: SyringeGaugeProps) {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.max(0, Math.min(safeMax, units));
  const target = clamped / safeMax; // 0–1

  const fillRatio = useAnimatedValue(target, compact);

  if (compact) return <CompactSyringe fillRatio={fillRatio} units={clamped} max={safeMax} />;
  return <FullSyringe fillRatio={fillRatio} units={clamped} max={safeMax} />;
}

// ─── Full syringe ─────────────────────────────────────────────────────────────
function FullSyringe({ fillRatio, units, max }: { fillRatio: number; units: number; max: number }) {
  const liquidW  = fillRatio * F_BW;
  const plungerX = F_BX + liquidW;
  // keep dot label within barrel bounds
  const dotX = Math.min(F_BX2 - 8, Math.max(F_BX + 8, plungerX));

  // ticks: every 5 units, label every 10
  const ticks: Array<{ v: number; x: number; major: boolean }> = [];
  for (let v = 0; v <= max; v += 5) {
    ticks.push({ v, x: F_BX + (v / max) * F_BW, major: v % 10 === 0 });
  }

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${F_VBW} ${F_VBH}`}
        role="img"
        aria-label={`Syringe — draw to ${fmt(units)} units`}
        className="w-full overflow-visible"
      >
        {/* ── needle ── */}
        <line
          x1="8" y1={F_CY} x2="58" y2={F_CY}
          stroke={CLR.needle} strokeWidth="1.6" strokeLinecap="round"
        />

        {/* ── hub (orange trapezoid, same path as OptimalDosages) ── */}
        <path d="M58 37 L74 34 L74 54 L58 51 Z" style={{ fill: CLR.accent }} />

        {/* ── barrel body ── */}
        <rect
          x={F_BX} y={F_BY} width={F_BW} height={F_BH} rx="3"
          style={{ fill: CLR.barrelBg, stroke: CLR.barrelBd }}
        />

        {/* ── liquid fill ── */}
        {liquidW > 0 && (
          <rect
            x={F_BX} y={F_BY} width={liquidW} height={F_BH} rx="3"
            fill={CLR.liquid} fillOpacity="0.65"
          />
        )}

        {/* ── graduation ticks ── */}
        {ticks.map(({ v, x, major }) => (
          <g key={v}>
            <line
              x1={x} y1={F_BY}
              x2={x} y2={major ? F_BY + F_BH : F_BY + 12}
              stroke={major ? CLR.tickMaj : CLR.tickMin}
              strokeWidth="1"
            />
            {major && (
              <text
                x={x} y={F_VBH - 8}
                fontSize="8.5"
                textAnchor="middle"
                style={{ fill: CLR.label }}
              >
                {v}
              </text>
            )}
          </g>
        ))}

        {/* ── plunger head (blue vertical line) ── */}
        <line
          x1={plungerX} y1={F_BY - 2}
          x2={plungerX} y2={F_BY + F_BH + 2}
          strokeWidth="2.4"
          style={{ stroke: CLR.plunger }}
        />

        {/* ── empty chamber rod inside barrel ── */}
        {liquidW < F_BW && (
          <rect
            x={plungerX} y={F_CY - 4}
            width={F_BX2 - plungerX} height="8"
            style={{ fill: CLR.rod }}
          />
        )}

        {/* ── barrel end cap (orange, same as original) ── */}
        <rect
          x={F_BX2 - 2} y={F_BY - 4}
          width="5" height={F_BH + 8} rx="1.5"
          style={{ fill: CLR.accent }}
        />

        {/* ── external plunger rod ── */}
        <line
          x1={F_BX2} y1={F_CY} x2={F_BX2 + 44} y2={F_CY}
          strokeWidth="6"
          style={{ stroke: CLR.accent }}
        />

        {/* ── thumb rest ── */}
        <rect
          x={F_BX2 + 42} y={F_BY - 3}
          width="7" height={F_BH + 6} rx="2"
          style={{ fill: CLR.accent }}
        />

        {/* ── draw-to dot above plunger ── */}
        <circle cx={dotX} cy={F_BY - 8} r="3.2" style={{ fill: CLR.plunger }} />

        {/* ── top-left info ── */}
        <text x={F_BX} y="13" fontSize="9.5" style={{ fill: CLR.label }}>
          U-100 syringe · 1 mL · 100 units
        </text>

        {/* ── top-right "draw to X" ── */}
        <text
          x={F_BX2} y="13"
          fontSize="9.5"
          textAnchor="end"
          fontWeight="600"
          style={{ fill: CLR.plunger }}
        >
          draw to {fmt(units)}
        </text>
      </svg>
    </div>
  );
}

// ─── Compact syringe (table rows) ─────────────────────────────────────────────
function CompactSyringe({ fillRatio, units, max }: { fillRatio: number; units: number; max: number }) {
  const liquidW  = fillRatio * C_BW;
  const plungerX = C_BX + liquidW;

  const ticks = [0, 25, 50, 75, 100].map(v => C_BX + (v / max) * C_BW).filter(x => x <= C_BX + C_BW);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${C_VBW} ${C_VBH}`}
        role="img"
        aria-label={`${fmt(units)} units`}
        className="w-full"
      >
        {/* needle */}
        <line
          x1="2" y1={C_CY} x2={C_BX - 3} y2={C_CY}
          stroke={CLR.needle} strokeWidth="0.9" strokeLinecap="round"
        />

        {/* hub */}
        <path
          d={`M${C_BX - 3} ${C_BY + 3} L${C_BX} ${C_BY + 1} L${C_BX} ${C_BY + C_BH - 1} L${C_BX - 3} ${C_BY + C_BH - 3} Z`}
          style={{ fill: CLR.accent }}
        />

        {/* barrel */}
        <rect
          x={C_BX} y={C_BY} width={C_BW} height={C_BH} rx="2"
          style={{ fill: CLR.barrelBg, stroke: CLR.barrelBd }}
        />

        {/* liquid fill */}
        {liquidW > 0 && (
          <rect
            x={C_BX} y={C_BY} width={liquidW} height={C_BH} rx="2"
            fill={CLR.liquid} fillOpacity="0.65"
          />
        )}

        {/* major ticks */}
        {ticks.map(x => (
          <line key={x} x1={x} y1={C_BY} x2={x} y2={C_BY + C_BH} stroke={CLR.tickMaj} strokeWidth="0.8" />
        ))}

        {/* plunger head */}
        <line
          x1={plungerX} y1={C_BY - 1}
          x2={plungerX} y2={C_BY + C_BH + 1}
          strokeWidth="1.5"
          style={{ stroke: CLR.plunger }}
        />

        {/* end cap */}
        <rect
          x={C_BX + C_BW - 1} y={C_BY - 2}
          width="3" height={C_BH + 4} rx="1"
          style={{ fill: CLR.accent }}
        />

        {/* rod */}
        <line
          x1={C_BX + C_BW} y1={C_CY} x2={C_BX + C_BW + 16} y2={C_CY}
          strokeWidth="3"
          style={{ stroke: CLR.accent }}
        />

        {/* thumb */}
        <rect
          x={C_BX + C_BW + 14} y={C_BY} width="4" height={C_BH} rx="1"
          style={{ fill: CLR.accent }}
        />
      </svg>
    </div>
  );
}
