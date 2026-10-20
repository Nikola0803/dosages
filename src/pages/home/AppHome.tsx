import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getActiveProtocol, getProtocols, getDaysRemaining, getProgressPct,
  isExpiringSoon, getTodaysSlots, getTodaysLogForProtocol, isRestDay,
} from "@/lib/protocol";
import type { Protocol } from "@/lib/protocol";
import AppShell from "@/components/feature/AppShell";
import VialIcon from "@/components/feature/VialIcon";
import { suggestWaterMl, unitsForDose, formatDose } from "@/utils/dosage";

// ── Helpers ───────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// ── Syringe draw visualisation ────────────────────────────────────────────

function SyringeViz({ units }: { units: number }) {
  const clamped = Math.min(100, Math.max(0, units));
  const pct = clamped / 100;

  return (
    <div className="mt-3">
      {/* Barrel */}
      <div className="relative h-7 rounded-full bg-background-100 overflow-hidden border border-background-200">
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary-400 transition-all duration-500"
          style={{ width: `${pct * 100}%` }}
        />
        {/* Tick marks at 10, 20, 30 ... 90 */}
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((t) => (
          <div
            key={t}
            className="absolute top-1 bottom-1 w-px bg-white/60"
            style={{ left: `${t}%` }}
          />
        ))}
        {/* Draw line marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary-700 transition-all duration-500"
          style={{ left: `${pct * 100}%` }}
        />
      </div>

      {/* Scale labels */}
      <div className="mt-0.5 flex justify-between px-0.5">
        {[0, 20, 40, 60, 80, 100].map((t) => (
          <span key={t} className="text-[9px] text-foreground-400">{t}</span>
        ))}
      </div>

      <p className="mt-1 text-center text-[10px] font-semibold uppercase tracking-wider text-foreground-400">
        U-100 insulin syringe
      </p>
    </div>
  );
}

// ── Today's dose card ─────────────────────────────────────────────────────

function TodayCard({ p }: { p: Protocol }) {
  const navigate = useNavigate();
  const today = todayStr();
  const slots  = getTodaysSlots(p, today);
  const logs   = getTodaysLogForProtocol(p.id);
  const rest   = isRestDay(p, today);

  const waterMl = p.waterMl ?? suggestWaterMl(p.vialMg, p.doseMcg);
  const units   = Math.round(unitsForDose(p.vialMg, waterMl, p.doseMcg) * 10) / 10;

  const doneCount    = logs.length;
  const totalSlots   = slots.length;
  const allDone      = !rest && totalSlots > 0 && doneCount >= totalSlots;

  return (
    <button
      type="button"
      onClick={() => navigate("/tracker")}
      className="w-full text-left rounded-3xl bg-white border border-background-100 shadow-sm p-5 active:scale-[0.98] transition-transform"
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        <VialIcon categorySlug={p.categorySlug} size={44} label={p.peptideName} sublabel={`${p.vialMg}mg`} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-400">Today's dose</p>
          <p className="font-heading text-lg font-bold text-foreground-950 leading-tight truncate">{p.peptideName}</p>
          <p className="text-sm text-foreground-500">{formatDose(p.doseMcg)} · {p.vialMg}mg vial</p>
        </div>
        {allDone && (
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
            <i className="ri-check-line text-primary-600 text-base" />
          </span>
        )}
      </div>

      {/* Draw line callout */}
      {units > 0 && !rest && (
        <div className="mt-4 rounded-2xl bg-primary-50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary-600">Draw to</p>
          <p className="font-heading text-4xl font-bold text-primary-900 leading-none mt-0.5">
            {units} <span className="text-lg font-semibold text-primary-600">units</span>
          </p>
          <SyringeViz units={units} />
        </div>
      )}

      {/* Rest day */}
      {rest && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-background-50 px-4 py-3">
          <i className="ri-rest-time-line text-xl text-foreground-400" />
          <span className="text-sm font-semibold text-foreground-500">Rest day — no injection today</span>
        </div>
      )}

      {/* Dose time chips */}
      {!rest && slots.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {slots.map((t, i) => {
            const done = i < doneCount;
            return (
              <span
                key={t}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  done
                    ? "bg-primary-100 text-primary-700"
                    : "bg-background-100 text-foreground-600"
                }`}
              >
                {done && <i className="ri-check-line text-xs" />}
                {formatTime(t)}
              </span>
            );
          })}
        </div>
      )}

      {/* No schedule set */}
      {!rest && slots.length === 0 && (
        <p className="mt-3 text-xs text-foreground-400 italic">No dose times set — tap to update schedule</p>
      )}

      <p className="mt-3 text-xs font-semibold text-primary-600">
        Open tracker → <i className="ri-arrow-right-s-line" />
      </p>
    </button>
  );
}

// ── Cycle progress card ───────────────────────────────────────────────────

function CycleProgress({ p }: { p: Protocol }) {
  const navigate = useNavigate();
  const pct  = getProgressPct(p);
  const days = getDaysRemaining(p);
  const soon = isExpiringSoon(p);
  const r = 28;
  const circ = 2 * Math.PI * r;

  const dosesLeft = Math.round((days / p.dosesPerVial) * p.dosesPerVial);

  return (
    <button
      type="button"
      onClick={() => navigate("/tracker")}
      className={`w-full text-left rounded-3xl border-2 p-4 bg-white active:scale-[0.98] transition-transform ${
        soon ? "border-accent-200" : "border-background-100"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Progress ring */}
        <div className="relative flex-shrink-0">
          <svg width="68" height="68" viewBox="0 0 68 68" className="-rotate-90">
            <circle cx="34" cy="34" r={r} fill="none" strokeWidth="6" className="stroke-background-100" />
            <circle
              cx="34" cy="34" r={r} fill="none" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ - (pct / 100) * circ}
              className={soon ? "stroke-accent-500" : "stroke-primary-500"}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${soon ? "text-accent-600" : "text-primary-600"}`}>
              {pct}%
            </span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-400">Vial progress</p>
          <p className={`mt-0.5 font-heading text-2xl font-bold ${soon ? "text-accent-700" : "text-foreground-950"}`}>
            {days} <span className="text-base font-semibold text-foreground-500">days left</span>
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-foreground-500">
            <i className="ri-medicine-bottle-line text-sm text-primary-400" />
            ~{Math.max(0, p.dosesPerVial - Math.round(pct / 100 * p.dosesPerVial))} doses remaining
          </div>
          {soon && (
            <p className="mt-1 text-xs font-semibold text-accent-600">
              <i className="ri-error-warning-line" /> Running low — reorder soon
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────

function EmptyHome() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center pt-8 pb-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-50">
        <i className="ri-flask-line text-4xl text-primary-400" />
      </div>
      <h2 className="mt-4 font-heading text-xl font-bold text-foreground-950">No active protocol</h2>
      <p className="mt-1.5 text-center text-sm text-foreground-500 max-w-[220px]">
        Build your first protocol to see your dose and progress here.
      </p>
      <button
        type="button"
        onClick={() => navigate("/start")}
        className="mt-5 rounded-full bg-primary-500 px-8 py-3.5 text-base font-bold text-white active:scale-[0.98] shadow-sm"
      >
        Build a protocol →
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function AppHome() {
  const [active, setActive] = useState<Protocol | null>(null);
  const [totalProtocols, setTotalProtocols] = useState(0);

  useEffect(() => {
    setActive(getActiveProtocol());
    setTotalProtocols(getProtocols().length);
  }, []);

  return (
    <AppShell>
      {/* Header */}
      <div className="pt-2 pb-4">
        <p className="text-xs font-semibold text-foreground-400">{todayLabel()}</p>
        <h1 className="font-heading text-2xl font-bold text-foreground-950 leading-tight mt-0.5">
          {greeting()}
        </h1>
      </div>

      {active ? (
        <div className="space-y-3">
          {/* Today's dose — the star of the screen */}
          <TodayCard p={active} />

          {/* Cycle progress */}
          <CycleProgress p={active} />

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Vial size",  value: `${active.vialMg}mg`,        icon: "ri-medicine-bottle-line" },
              { label: "Per dose",   value: formatDose(active.doseMcg),   icon: "ri-syringe-line"         },
              { label: "Protocols",  value: String(totalProtocols),       icon: "ri-list-check-2"         },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white border border-background-100 px-3 py-3 text-center">
                <i className={`${s.icon} text-lg text-primary-400`} />
                <p className="mt-1 font-heading text-base font-bold text-foreground-950">{s.value}</p>
                <p className="text-[10px] text-foreground-400">{s.label}</p>
              </div>
            ))}
          </div>

        </div>
      ) : (
        <EmptyHome />
      )}
    </AppShell>
  );
}
