import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getProtocols, getDaysRemaining, getProgressPct,
  isExpiringSoon, getTodaysSlots, getTodaysLogForProtocol, isRestDay,
  saveProtocol,
} from "@/lib/protocol";
import type { Protocol } from "@/lib/protocol";
import AppShell from "@/components/feature/AppShell";
import VialIcon from "@/components/feature/VialIcon";
import SyringeGauge from "@/components/feature/SyringeGauge";
import { suggestWaterMl, unitsForDose, formatDose } from "@/utils/dosage";
import { peptides } from "@/mocks/peptides";

const GOAL_CATS: Record<string, string[]> = {
  fat:       ["metabolic"],
  muscle:    ["gh-secretagogue", "growth-factor"],
  recovery:  ["tissue-repair"],
  longevity: ["longevity", "mitochondrial"],
  cognitive: ["cognitive"],
  immune:    ["immune", "endocrine"],
};

const GOAL_LABELS: Record<string, string> = {
  fat: "Lose Fat", muscle: "Build Muscle", recovery: "Recovery",
  longevity: "Longevity", cognitive: "Cognitive", immune: "Immune",
};

const GOAL_ICONS: Record<string, string> = {
  fat: "ri-fire-line", muscle: "ri-boxing-line", recovery: "ri-heart-pulse-line",
  longevity: "ri-hourglass-line", cognitive: "ri-brain-line", immune: "ri-shield-cross-line",
};

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
          <SyringeGauge units={units} />
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

// ── Supply calculation helpers ────────────────────────────────────────────

function getVialDurationDays(p: Protocol): number {
  const start = new Date(p.startedAt + "T00:00:00").getTime();
  const end   = new Date(p.endsAt   + "T00:00:00").getTime();
  return Math.max(1, Math.round((end - start) / 86_400_000));
}

function getTotalSupplyDays(p: Protocol, vialsOnHand: number): number {
  const currentDaysLeft = getDaysRemaining(p);
  const daysPerVial = getVialDurationDays(p);
  // vialsOnHand includes the current one, so extras = vialsOnHand - 1
  const extra = Math.max(0, (vialsOnHand || 1) - 1);
  return currentDaysLeft + extra * daysPerVial;
}

function getReorderDate(p: Protocol, vialsOnHand: number): Date {
  const totalDays = getTotalSupplyDays(p, vialsOnHand);
  // suggest reorder 14 days before running out
  const reorderIn = Math.max(0, totalDays - 14);
  const d = new Date();
  d.setDate(d.getDate() + reorderIn);
  return d;
}

function formatReorderDate(d: Date): string {
  const now = new Date();
  const diffDays = Math.round((d.getTime() - now.getTime()) / 86_400_000);
  if (diffDays <= 0) return "Order now";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Cycle notes ──────────────────────────────────────────────────────────

function CycleNotes({ p, onSave }: { p: Protocol; onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(p.cycleNotes ?? "");

  function save() {
    saveProtocol({ ...p, cycleNotes: text.trim() || undefined });
    onSave();
    setOpen(false);
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left px-1 py-1"
      >
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground-500">
          <i className="ri-sticky-note-line text-sm text-foreground-400" />
          {p.cycleNotes ? "Cycle notes" : "Add notes"}
        </span>
        <i className={`ri-arrow-${open ? "up" : "down"}-s-line text-foreground-300 text-sm`} />
      </button>
      {!open && p.cycleNotes && (
        <p className="mt-0.5 pl-1 text-xs text-foreground-500 leading-relaxed line-clamp-2">{p.cycleNotes}</p>
      )}
      {open && (
        <div className="mt-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Side effects, observations, how you feel…"
            rows={3}
            className="w-full rounded-2xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-800 placeholder:text-foreground-300 focus:border-primary-400 focus:outline-none resize-none"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={save}
              className="flex-1 rounded-full bg-primary-500 py-2 text-xs font-bold text-white active:scale-[0.97]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setText(p.cycleNotes ?? ""); setOpen(false); }}
              className="flex-1 rounded-full border border-background-200 py-2 text-xs font-semibold text-foreground-500 active:scale-[0.97]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Cycle progress card ───────────────────────────────────────────────────

function CycleProgress({ p, onProtocolChange }: { p: Protocol; onProtocolChange: () => void }) {
  const navigate = useNavigate();
  const pct  = getProgressPct(p);
  const days = getDaysRemaining(p);
  const soon = isExpiringSoon(p);
  const r = 28;
  const circ = 2 * Math.PI * r;

  const vialsOnHand = p.vialsOnHand ?? 1;
  const totalDays = getTotalSupplyDays(p, vialsOnHand);
  const isRunningLow = totalDays <= 21;
  const reorderDate = getReorderDate(p, vialsOnHand);
  const dosesUsed = Math.round((pct / 100) * p.dosesPerVial);

  function adjustVials(delta: number) {
    const next = Math.max(1, vialsOnHand + delta);
    saveProtocol({ ...p, vialsOnHand: next });
    onProtocolChange();
  }

  return (
    <div
      className={`w-full rounded-3xl border-2 p-4 bg-white ${
        isRunningLow ? "border-accent-200" : "border-background-100"
      }`}
    >
      <button
        type="button"
        onClick={() => navigate("/tracker")}
        className="w-full text-left active:scale-[0.98] transition-transform"
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
              ~{Math.max(0, p.dosesPerVial - dosesUsed)} doses remaining
            </div>
          </div>
        </div>
      </button>

      {/* Cycle notes */}
      <CycleNotes p={p} onSave={onProtocolChange} />

      {/* Vials on hand counter */}
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-background-50 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-400">Vials on hand</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground-900">
            {totalDays} days total supply
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => adjustVials(-1)}
            disabled={vialsOnHand <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-background-100 text-lg font-semibold text-foreground-600 disabled:opacity-30 active:scale-[0.9] transition-transform"
          >−</button>
          <span className="w-5 text-center font-heading text-xl font-bold text-foreground-950">{vialsOnHand}</span>
          <button
            type="button"
            onClick={() => adjustVials(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-background-100 text-lg font-semibold text-foreground-600 active:scale-[0.9] transition-transform"
          >+</button>
        </div>
      </div>

      {/* Running low + reorder */}
      {isRunningLow && (
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-accent-50 border border-accent-100 px-4 py-3">
          <div>
            <p className="text-xs font-bold text-accent-700">
              <i className="ri-error-warning-line mr-1" />Running low — time to reorder
            </p>
            <p className="mt-0.5 text-[11px] text-accent-600">
              Reorder by {formatReorderDate(reorderDate)} to avoid a gap
            </p>
          </div>
          <a
            href="https://www.evlvpeptides.com/shop"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ml-3 flex-shrink-0 rounded-full bg-accent-500 px-3 py-1.5 text-[11px] font-bold text-white active:scale-[0.97]"
          >
            Shop →
          </a>
        </div>
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────

function EmptyHome() {
  const navigate = useNavigate();
  const goalKey = (() => { try { return localStorage.getItem("vc-goal"); } catch { return null; } })();
  const peptideSlug = (() => { try { return localStorage.getItem("vc-peptide"); } catch { return null; } })();

  const suggested = goalKey
    ? peptides.filter(p => GOAL_CATS[goalKey]?.includes(p.categorySlug)).slice(0, 3)
    : [];

  return (
    <div className="flex flex-col pb-6 space-y-4">
      {/* Hero CTA card */}
      <div className="rounded-3xl bg-primary-500 p-5">
        {goalKey && (
          <div className="mb-2 flex items-center gap-1.5">
            <i className={`${GOAL_ICONS[goalKey] ?? "ri-flask-line"} text-white/70 text-sm`} />
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              {GOAL_LABELS[goalKey] ?? goalKey} protocol
            </span>
          </div>
        )}
        <h2 className="font-heading text-2xl font-bold text-white leading-tight">
          {peptideSlug ? "One step left —" : "Build your"}<br />
          {peptideSlug ? "enter your vial size" : "first protocol"}
        </h2>
        <p className="mt-1.5 text-sm text-white/75">
          {peptideSlug
            ? "We'll calculate your exact draw line and track your cycle."
            : "Tell us your vial size and we'll calculate your exact draw line."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/start")}
          className="mt-4 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary-700 active:scale-[0.98] transition-transform shadow-sm"
        >
          {peptideSlug ? "Complete setup →" : "Build a protocol →"}
        </button>
      </div>

      {/* Suggested compounds */}
      {suggested.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground-400">
            Compounds for your goal
          </p>
          <div className="space-y-2">
            {suggested.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => navigate("/start")}
                className="flex w-full items-center gap-3 rounded-2xl border border-background-100 bg-white px-4 py-3 text-left active:scale-[0.98] transition-transform shadow-sm"
              >
                <VialIcon categorySlug={p.categorySlug} size={38} label={p.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground-950">{p.name}</p>
                  <p className="text-xs text-foreground-500">{p.frequency} · {p.typicalMcg >= 1000 ? `${p.typicalMcg / 1000}mg` : `${p.typicalMcg}mcg`}</p>
                </div>
                <i className="ri-arrow-right-s-line flex-shrink-0 text-foreground-300 text-lg" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function AppHome() {
  const navigate = useNavigate();
  const [actives, setActives] = useState<Protocol[]>([]);

  function reload() {
    setActives(getProtocols().filter((p) => p.status === "active"));
  }

  useEffect(() => { reload(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppShell>
      {/* Header */}
      <div className="pt-2 pb-4">
        <p className="text-xs font-semibold text-foreground-400">{todayLabel()}</p>
        <h1 className="font-heading text-2xl font-bold text-foreground-950 leading-tight mt-0.5">
          {greeting()}
        </h1>
      </div>

      {actives.length > 0 ? (
        <div className="space-y-3 pb-4">
          {actives.map((p) => (
            <div key={p.id} className="space-y-2">
              <TodayCard p={p} />
              <CycleProgress p={p} onProtocolChange={reload} />
            </div>
          ))}

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Active",    value: String(actives.length),             icon: "ri-list-check-2"         },
              { label: "Per dose",  value: formatDose(actives[0].doseMcg),     icon: "ri-syringe-line"         },
              { label: "Vial size", value: `${actives[0].vialMg}mg`,           icon: "ri-medicine-bottle-line" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white border border-background-100 px-3 py-3 text-center">
                <i className={`${s.icon} text-lg text-primary-400`} />
                <p className="mt-1 font-heading text-base font-bold text-foreground-950">{s.value}</p>
                <p className="text-[10px] text-foreground-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Add to stack */}
          <button
            type="button"
            onClick={() => navigate("/start")}
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-background-200 py-3.5 text-sm font-semibold text-foreground-500 active:bg-background-50 transition-colors"
          >
            <i className="ri-add-line text-base" /> Add compound to stack
          </button>
        </div>
      ) : (
        <EmptyHome />
      )}
    </AppShell>
  );
}
