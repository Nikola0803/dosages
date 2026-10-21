import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { peptides } from "@/mocks/peptides";
import VialIcon, { CATEGORY_CAP } from "@/components/feature/VialIcon";
import SyringeGauge from "@/components/feature/SyringeGauge";
import {
  dosesPerVial,
  suggestWaterMl,
  unitsForDose,
} from "@/utils/dosage";
import { createProtocol, saveProtocol, getProtocols, type Protocol } from "@/lib/protocol";

// ── Constants ─────────────────────────────────────────────────────────────

const GOALS = [
  { key: "recovery",  icon: "ri-heart-pulse-line",  label: "Recovery",     sub: "Healing & repair"        },
  { key: "muscle",    icon: "ri-boxing-line",        label: "Build Muscle", sub: "GH & growth factors"     },
  { key: "fat",       icon: "ri-fire-line",          label: "Lose Fat",     sub: "Metabolic & GLP-1"       },
  { key: "longevity", icon: "ri-hourglass-line",     label: "Longevity",    sub: "Anti-aging & mitochondria" },
  { key: "cognitive", icon: "ri-brain-line",         label: "Cognitive",    sub: "Brain & focus"           },
  { key: "immune",    icon: "ri-shield-cross-line",  label: "Immune",       sub: "Immune & thymic"         },
];

const GOAL_CATS: Record<string, string[]> = {
  fat:       ["metabolic"],
  muscle:    ["gh-secretagogue", "growth-factor"],
  recovery:  ["tissue-repair"],
  longevity: ["longevity", "mitochondrial"],
  cognitive: ["cognitive"],
  immune:    ["immune", "endocrine"],
};

const VIAL_OPTIONS = [5, 10, 15, 20, 30];

/** Recommended cycle length (weeks) by peptide category */
const CYCLE_WEEKS: Record<string, number> = {
  metabolic:         12,
  "gh-secretagogue": 16,
  "growth-factor":   8,
  "tissue-repair":   8,
  longevity:         12,
  cognitive:         8,
  immune:            4,
  mitochondrial:     8,
  endocrine:         8,
};

/** Companion peptides to upsell on the review step, keyed by current compound's categorySlug */
const STACK_COMBOS: Record<string, Array<{ slug: string; reason: string }>> = {
  metabolic: [
    { slug: "bpc-157",          reason: "Protects gut lining from GLP-1 GI side effects" },
    { slug: "5-amino-1mq",      reason: "Boosts mitochondrial fat oxidation between doses" },
    { slug: "mots-c",           reason: "Amplifies metabolic rate and insulin sensitivity" },
  ],
  "gh-secretagogue": [
    { slug: "igf-1-lr3",        reason: "Extends the anabolic window after each GH pulse" },
    { slug: "tb-500",           reason: "Accelerates tissue repair and recovery" },
    { slug: "bpc-157",          reason: "Synergistic healing + gut and tendon support" },
  ],
  "growth-factor": [
    { slug: "ipamorelin",       reason: "Drives clean GH pulses to feed IGF signalling" },
    { slug: "tb-500",           reason: "Amplifies systemic tissue repair and remodelling" },
    { slug: "bpc-157",          reason: "Protects gut integrity and accelerates healing" },
  ],
  "tissue-repair": [
    { slug: "ipamorelin",       reason: "Clean GH secretion supports deeper tissue healing" },
    { slug: "igf-1-lr3",        reason: "Downstream growth factor sustains repair signalling" },
    { slug: "thymosin-alpha-1", reason: "Modulates immune response for faster recovery" },
  ],
  longevity: [
    { slug: "epitalon",         reason: "Extends telomere length and circadian regulation" },
    { slug: "bpc-157",          reason: "Systemic cytoprotection and organ integrity" },
    { slug: "mots-c",           reason: "Mitochondrial rescue and metabolic resilience" },
  ],
  cognitive: [
    { slug: "bpc-157",          reason: "Neuroprotective and gut-brain axis support" },
    { slug: "epitalon",         reason: "Restores circadian rhythm and sleep quality" },
    { slug: "dsip",             reason: "Deep sleep peptide for overnight consolidation" },
  ],
  immune: [
    { slug: "bpc-157",          reason: "Anti-inflammatory and gut-immunity support" },
    { slug: "thymosin-alpha-1", reason: "Broad immune modulation and T-cell activation" },
    { slug: "ll-37",            reason: "Antimicrobial and innate immune defence" },
  ],
  mitochondrial: [
    { slug: "bpc-157",          reason: "Cytoprotection alongside mitochondrial renewal" },
    { slug: "ipamorelin",       reason: "GH pulses support mitochondrial biogenesis" },
    { slug: "mots-c",           reason: "Stacks directly with NAD+ for energy output" },
  ],
  endocrine: [
    { slug: "bpc-157",          reason: "Gut and hormonal-axis protection" },
    { slug: "ipamorelin",       reason: "Clean GH support for endocrine optimisation" },
    { slug: "thymosin-alpha-1", reason: "Immune balance pairs with endocrine function" },
  ],
};

function parseDosesPerWeek(frequency: string): number {
  const f = frequency.toLowerCase();
  if (f.includes("2-3x")) return 17;
  if (f.includes("1-2x daily")) return 10;
  if (f.includes("2x daily")) return 14;
  if (f.includes("1x daily")) return 7;
  if (f.includes("3x weekly")) return 3;
  if (f.includes("2x weekly")) return 2;
  if (f.includes("1x weekly")) return 1;
  return 7;
}

const REST_OPTIONS = [
  { key: "daily",   label: "Every day",       sub: "No rest days"            },
  { key: "eod",     label: "Every other day", sub: "Alternate days on / off" },
  { key: "5on2off", label: "5 on / 2 off",    sub: "5 days on, 2 days rest"  },
  { key: "custom",  label: "Custom",          sub: "Pick specific rest days" },
] as const;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PRESET_TIMES = [
  "06:00","07:00","08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00","19:00",
  "20:00","21:00","22:00","23:00",
];

type Step = "goal" | "compound" | "vial" | "water" | "schedule" | "review";
const STEPS: Step[] = ["goal", "compound", "vial", "water", "schedule", "review"];
const STEP_LABELS: Record<Step, string> = {
  goal: "Goal", compound: "Compound", vial: "Vial",
  water: "Water", schedule: "Schedule", review: "Review",
};

function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ── Context breadcrumb (goal + compound strip) ────────────────────────────
function ContextStrip({ goalKey, compoundName }: { goalKey: string | null; compoundName?: string }) {
  if (!goalKey || !compoundName) return null;
  const goal = GOALS.find(g => g.key === goalKey);
  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl bg-background-50 px-3 py-2.5">
      <i className={`${goal?.icon} text-base text-primary-500`} />
      <span className="text-xs font-semibold text-primary-700">{goal?.label}</span>
      <i className="ri-arrow-right-s-line text-[13px] text-foreground-300" />
      <span className="text-xs font-semibold text-foreground-800">{compoundName}</span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────

export default function ProtocolBuilder() {
  const navigate = useNavigate();

  // Seed from onboarding localStorage — skip steps already answered
  const [step, setStep] = useState<Step>(() => {
    try {
      const g = localStorage.getItem("vc-goal");
      const p = localStorage.getItem("vc-peptide");
      if (g && p) return "vial";
      if (g)      return "compound";
    } catch { /* ignore */ }
    return "goal";
  });
  const [goalKey, setGoalKey] = useState<string | null>(() => {
    try { return localStorage.getItem("vc-goal"); } catch { return null; }
  });
  const [query, setQuery]             = useState("");
  const [peptideSlug, setPeptideSlug] = useState(() => {
    try { return localStorage.getItem("vc-peptide") ?? ""; } catch { return ""; }
  });
  const [vialMg, setVialMg]           = useState<number | null>(null);
  const [waterMl, setWaterMl]         = useState<number | null>(null);
  const [doseTimes, setDoseTimes]     = useState<string[]>(["08:00"]);
  const [restPattern, setRestPattern] = useState<Protocol["restPattern"]>("daily");
  const [restWeekdays, setRestWeekdays] = useState<number[]>([]);
  const [showSyringe, setShowSyringe] = useState(false);
  const [showReconTips, setShowReconTips] = useState(false);

  const stepIdx  = STEPS.indexOf(step);
  const progress = (stepIdx / (STEPS.length - 1)) * 100;

  // Weight-based dose personalisation
  const weightKg = useMemo(() => {
    try { return Number(localStorage.getItem("vc-weight-kg")) || 0; } catch { return 0; }
  }, []);

  const selected = useMemo(
    () => peptides.find((p) => p.slug === peptideSlug),
    [peptideSlug],
  );

  // If user weight is known and peptide uses per-kg dosing, compute personalised dose
  const personalisedMcg = weightKg && selected?.perKgMcg
    ? Math.round(weightKg * selected.perKgMcg)
    : null;
  // Use personalised dose if available, else fall back to the peptide's typical dose
  const effectiveMcg = personalisedMcg ?? selected?.typicalMcg ?? 0;

  const suggestedWater = selected && vialMg ? suggestWaterMl(vialMg, effectiveMcg) : 0;
  const effectiveWater = waterMl ?? suggestedWater;

  const results = useMemo(() => {
    if (!selected || !vialMg || !effectiveWater) return null;
    const dpv = dosesPerVial(vialMg, effectiveMcg);
    const rawUnits = unitsForDose(vialMg, effectiveWater, effectiveMcg);
    return {
      doses: dpv,
      units: Math.round(rawUnits * 10) / 10,
      mcg:   effectiveMcg,
    };
  }, [selected, vialMg, effectiveWater, effectiveMcg]);

  // Compound list: filtered by goal first, then search query
  const filteredPeptides = useMemo(() => {
    let list = peptides;
    // When a goal is set and no search query, show only goal-relevant compounds
    if (goalKey && !query) list = list.filter((p) => GOAL_CATS[goalKey]?.includes(p.categorySlug));
    // When searching, search all
    if (query) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [goalKey, query]);

  function go(s: Step) { setStep(s); }
  function goNext() {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }
  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  function setTime(i: number, val: string) {
    setDoseTimes((prev) => prev.map((t, idx) => (idx === i ? val : t)));
  }
  function addSlot() {
    if (doseTimes.length >= 4) return;
    const last = doseTimes[doseTimes.length - 1] ?? "08:00";
    const [h] = last.split(":").map(Number);
    const next = String(Math.min(h + 4, 23)).padStart(2, "0") + ":00";
    setDoseTimes((prev) => [...prev, next]);
  }
  function removeSlot(i: number) {
    if (doseTimes.length <= 1) return;
    setDoseTimes((prev) => prev.filter((_, idx) => idx !== i));
  }
  function toggleWeekday(d: number) {
    setRestWeekdays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  const otherActives = useMemo(
    () => getProtocols().filter((p) => p.status === "active" && p.peptideSlug !== peptideSlug),
    [peptideSlug],
  );

  function handleStart() {
    if (!selected || !vialMg || !results) return;
    const existing = getProtocols().find(
      (p) => p.peptideSlug === selected.slug && p.status === "active",
    );
    const protocol = existing ?? createProtocol(
      selected.slug, selected.name, selected.categorySlug,
      vialMg, effectiveMcg, results.doses,
    );
    saveProtocol({
      ...protocol,
      waterMl: effectiveWater || undefined,
      doseTimes: doseTimes.slice().sort(),
      restPattern,
      restWeekdays: restPattern === "custom" ? restWeekdays : undefined,
    });
    try { localStorage.removeItem("vc-peptide"); } catch { /* ignore */ }
    navigate("/tracker");
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Progress bar */}
      <div className="h-0.5 bg-background-100">
        <div
          className="h-0.5 bg-primary-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step nav row */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={goBack}
          className={`flex items-center gap-0.5 text-sm font-semibold text-primary-600 active:opacity-60 ${step === "goal" ? "invisible" : ""}`}
        >
          <i className="ri-arrow-left-s-line text-lg" /> Back
        </button>
        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground-400">
          {STEP_LABELS[step]}
        </p>
        {step === "goal" ? (
          <button
            type="button"
            onClick={() => go("compound")}
            className="text-sm font-medium text-foreground-400 active:opacity-60"
          >
            Skip
          </button>
        ) : (
          <span className="w-10" />
        )}
      </div>

      <div className="flex-1 px-4 pb-6">

        {/* ══════════════════════════════════════════
            STEP: goal
        ══════════════════════════════════════════ */}
        {step === "goal" && (
          <div className="animate-fadeIn">
            <h2 className="font-heading text-2xl font-bold text-foreground-950">
              What's your goal?
            </h2>
            <p className="mt-1 text-sm text-foreground-500">
              We'll show you the right compounds.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {GOALS.map((g) => {
                const sel = goalKey === g.key;
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => {
                      setGoalKey(g.key);
                      // Auto-advance after brief selection flash
                      setTimeout(() => go("compound"), 160);
                    }}
                    className={`flex flex-col rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.97] ${
                      sel
                        ? "border-primary-500 bg-primary-50"
                        : "border-background-100 bg-white"
                    }`}
                  >
                    <i className={`${g.icon} text-2xl ${sel ? "text-primary-500" : "text-foreground-400"}`} />
                    <span className={`mt-2 text-sm font-bold ${sel ? "text-primary-700" : "text-foreground-900"}`}>
                      {g.label}
                    </span>
                    <span className="mt-0.5 text-[11px] leading-tight text-foreground-400">{g.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP: compound
        ══════════════════════════════════════════ */}
        {step === "compound" && (
          <div className="animate-fadeIn">
            <h2 className="font-heading text-2xl font-bold text-foreground-950">
              {goalKey
                ? `${GOALS.find(g => g.key === goalKey)?.label} compounds`
                : "Choose your compound"}
            </h2>
            <p className="mt-1 text-sm text-foreground-500">
              Select the peptide printed on your vial.
            </p>

            {/* Search — typing expands to all peptides */}
            <div className="relative mt-4">
              <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={goalKey ? "Search all peptides…" : "Search…"}
                className="w-full rounded-2xl border border-background-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-primary-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-300"
                >
                  <i className="ri-close-line text-lg" />
                </button>
              )}
            </div>

            {/* Compound list — clean 2-col card grid, NO vial icons */}
            <div className="mt-3 grid grid-cols-2 gap-2 max-h-[54vh] overflow-y-auto pb-2">
              {filteredPeptides.map((p) => {
                const sel = peptideSlug === p.slug;
                const accent = CATEGORY_CAP[p.categorySlug] ?? "#94a3b8";
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => setPeptideSlug(p.slug)}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left transition-all active:scale-[0.97] ${
                      sel
                        ? "border-primary-500 bg-primary-50"
                        : "border-background-100 bg-white"
                    }`}
                  >
                    {/* Category color dot */}
                    <span
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: accent + "28" }}
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[13px] font-bold leading-tight ${sel ? "text-primary-800" : "text-foreground-900"}`}>
                        {p.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-foreground-400 leading-tight">{p.frequency}</p>
                    </div>
                    {sel && <i className="ri-check-line flex-shrink-0 text-primary-500 text-base" />}
                  </button>
                );
              })}

              {filteredPeptides.length === 0 && (
                <div className="col-span-2 py-8 text-center text-sm text-foreground-400">
                  No compounds found.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={!peptideSlug}
              className="mt-4 w-full rounded-full bg-primary-500 py-4 text-base font-bold text-white shadow-sm active:scale-[0.98] disabled:bg-background-200 disabled:text-foreground-400"
            >
              {selected ? `Continue with ${selected.name} →` : "Select a compound first"}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP: vial
        ══════════════════════════════════════════ */}
        {step === "vial" && selected && (
          <div className="animate-fadeIn">
            <ContextStrip goalKey={goalKey} compoundName={selected.name} />

            <div className="flex items-center gap-4 mb-4">
              <VialIcon
                categorySlug={selected.categorySlug}
                size={52}
                label={selected.name}
                sublabel={vialMg ? `${vialMg}mg` : undefined}
              />
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground-950">{selected.name}</h2>
                <p className="mt-0.5 text-sm text-foreground-500">What size is your vial?</p>
              </div>
            </div>

            {/* Weight-personalised dose callout */}
            {personalisedMcg ? (
              <div className="mb-4 flex items-center gap-2.5 rounded-2xl bg-primary-50 border border-primary-100 px-4 py-3">
                <i className="ri-user-heart-line text-lg text-primary-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-primary-700">
                    Your dose — {weightKg} kg × {selected.perKgMcg} µg/kg
                  </p>
                  <p className="text-sm font-bold text-primary-900">
                    {personalisedMcg >= 1000 ? `${(personalisedMcg / 1000).toFixed(1).replace(/\.0$/, "")} mg` : `${personalisedMcg} µg`} per dose
                  </p>
                </div>
              </div>
            ) : weightKg > 0 ? null : null}

            <p className="text-xs font-semibold uppercase tracking-wider text-foreground-400 mb-2">Common sizes</p>
            <div className="grid grid-cols-2 gap-2.5">
              {(selected.vialSizesMg ?? VIAL_OPTIONS).map((mg) => {
                const dpv   = dosesPerVial(mg, effectiveMcg);
                const small = dpv === 0;
                const sel   = vialMg === mg;
                const dpw   = selected ? parseDosesPerWeek(selected.frequency) : 7;
                const wks   = dpv > 0 ? dpv / dpw : 0;
                const supplyLabel = wks >= 1
                  ? `~${wks < 1.5 ? "1" : wks < 2.5 ? "2" : wks < 4 ? Math.round(wks) : Math.round(wks)} wk supply`
                  : `${dpv} dose${dpv !== 1 ? "s" : ""}`;
                return (
                  <button
                    key={mg}
                    type="button"
                    onClick={() => !small && setVialMg(mg)}
                    disabled={small}
                    className={`flex flex-col gap-0.5 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.97] ${
                      small
                        ? "border-background-50 bg-background-50 opacity-50 cursor-not-allowed"
                        : sel
                        ? "border-primary-500 bg-primary-50"
                        : "border-background-100 bg-white"
                    }`}
                  >
                    <span className={`text-lg font-bold ${sel ? "text-primary-700" : small ? "text-foreground-300" : "text-foreground-900"}`}>
                      {mg} mg
                    </span>
                    {small ? (
                      <span className="text-[11px] text-foreground-300">Too small</span>
                    ) : (
                      <>
                        <span className={`text-[11px] font-semibold ${sel ? "text-primary-600" : "text-foreground-400"}`}>
                          {dpv} dose{dpv !== 1 ? "s" : ""}
                        </span>
                        <span className={`text-[11px] ${sel ? "text-primary-500" : "text-foreground-300"}`}>
                          {supplyLabel}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {vialMg !== null && dosesPerVial(vialMg, effectiveMcg) === 0 && (
              <p className="mt-2 text-xs text-red-500 font-medium">
                One dose of {effectiveMcg >= 1000 ? `${(effectiveMcg/1000).toFixed(1).replace(/\.0$/,"")}mg` : `${effectiveMcg}mcg`} needs a larger vial — pick a bigger size or enter a custom value above.
              </p>
            )}

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-foreground-400 mb-2">Custom</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                inputMode="decimal"
                min={0.5}
                max={1000}
                step={0.5}
                value={vialMg ?? ""}
                onChange={(e) => setVialMg(e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g. 2"
                className="w-28 rounded-2xl border border-background-200 bg-white px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none"
              />
              <span className="text-sm text-foreground-500">mg</span>
            </div>

            <button
              type="button"
              onClick={() => { if (!waterMl && selected && vialMg) setWaterMl(suggestedWater); goNext(); }}
              disabled={!vialMg || (!!vialMg && dosesPerVial(vialMg, effectiveMcg) === 0)}
              className="mt-6 w-full rounded-full bg-primary-500 py-4 text-base font-bold text-white shadow-sm active:scale-[0.98] disabled:bg-background-200 disabled:text-foreground-400"
            >
              Continue →
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP: water
        ══════════════════════════════════════════ */}
        {step === "water" && selected && vialMg && (
          <div className="animate-fadeIn">
            <ContextStrip goalKey={goalKey} compoundName={selected.name} />

            <h2 className="font-heading text-2xl font-bold text-foreground-950 mb-1">Bac water</h2>
            <p className="text-sm text-foreground-500">How much bacteriostatic water to add?</p>

            {suggestedWater > 0 && (
              <button
                type="button"
                onClick={() => setWaterMl(suggestedWater)}
                className="mt-5 w-full rounded-2xl border-2 border-primary-200 bg-primary-50 p-4 text-left active:scale-[0.98]"
              >
                <p className="text-xs font-semibold text-primary-600">Recommended for {selected.name}</p>
                <p className="mt-0.5 text-3xl font-bold text-primary-900">{suggestedWater} <span className="text-lg font-semibold">mL</span></p>
                <p className="mt-1 text-xs text-primary-600">Tap to use →</p>
              </button>
            )}

            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-foreground-400 mb-2">Custom amount</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                inputMode="decimal"
                min={0.5}
                max={10}
                step={0.5}
                value={waterMl ?? ""}
                onChange={(e) => setWaterMl(e.target.value ? Number(e.target.value) : null)}
                placeholder={String(suggestedWater || "2")}
                className="w-28 rounded-2xl border border-background-200 bg-white px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none"
              />
              <span className="text-sm text-foreground-500">mL</span>
            </div>

            {effectiveWater > 0 && results && (
              <div className="mt-4 rounded-2xl bg-primary-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <i className="ri-syringe-line text-xl text-primary-500" />
                    <span className="text-foreground-600">
                      Draw <strong className="text-foreground-950">{results.units} units</strong> ·{" "}
                      <strong className="text-foreground-950">{results.doses} doses</strong> per vial
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSyringe(v => !v)}
                    className="text-[11px] font-semibold text-primary-600 active:opacity-60"
                  >
                    {showSyringe ? "Hide" : "Show syringe"}
                  </button>
                </div>
                {showSyringe && (
                  <div className="mt-3">
                    <SyringeGauge units={results.units} />
                  </div>
                )}
              </div>
            )}

            {/* Reconstitution guide */}
            <div className="mt-4 rounded-2xl border border-background-100 bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setShowReconTips(v => !v)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left active:bg-background-50"
              >
                <div className="flex items-center gap-2.5">
                  <i className="ri-flask-line text-base text-primary-500" />
                  <span className="text-sm font-semibold text-foreground-900">How to reconstitute</span>
                </div>
                <i className={`ri-arrow-${showReconTips ? "up" : "down"}-s-line text-foreground-400`} />
              </button>
              {showReconTips && (
                <div className="border-t border-background-100 px-4 pb-4 pt-3 space-y-3">
                  {[
                    { icon: "ri-spray-line",        title: "Swab first", body: "Wipe both vial caps with 70% isopropyl alcohol. Let dry 30 seconds before inserting the needle." },
                    { icon: "ri-arrow-down-line",   title: "Aim at the wall", body: "Insert the needle at an angle and direct the stream down the inside glass wall — never squirt directly onto the powder cake." },
                    { icon: "ri-speed-mini-line",   title: "Push slowly", body: "Depress the plunger gently and steadily. Fast injection creates turbulence that degrades the peptide." },
                    { icon: "ri-forbid-line",       title: "No shaking or swirling", body: "Shaking creates foam and breaks fragile peptide bonds. Never vortex or agitate the vial." },
                    { icon: "ri-hand-line",         title: "Gentle rolling only", body: "Roll the vial slowly between your palms until the solution is clear. Allow 30–60 seconds." },
                    { icon: "ri-search-eye-line",   title: "Inspect before use", body: "The solution should be clear and colourless (a slight tint is normal for some peptides). Discard if cloudy or particles are visible." },
                    { icon: "ri-temp-cold-line",    title: "Refrigerate & use within 30 days", body: "Store at 2–8 °C, away from light. Reconstituted peptides degrade faster than lyophilised powder — use within 28–30 days." },
                  ].map(({ icon, title, body }) => (
                    <div key={title} className="flex gap-3">
                      <i className={`${icon} mt-0.5 flex-shrink-0 text-base text-primary-400`} />
                      <div>
                        <p className="text-xs font-bold text-foreground-900">{title}</p>
                        <p className="text-xs text-foreground-500 leading-relaxed">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={!effectiveWater}
              className="mt-6 w-full rounded-full bg-primary-500 py-4 text-base font-bold text-white shadow-sm active:scale-[0.98] disabled:bg-background-200 disabled:text-foreground-400"
            >
              Continue →
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP: schedule
        ══════════════════════════════════════════ */}
        {step === "schedule" && (
          <div className="animate-fadeIn">
            <ContextStrip goalKey={goalKey} compoundName={selected?.name} />

            <h2 className="font-heading text-2xl font-bold text-foreground-950">Your schedule</h2>
            <p className="mt-1 text-sm text-foreground-500">
              Set your dose times and rest days.
            </p>

            {selected && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-primary-50 border border-primary-100 px-3 py-2.5">
                <i className="ri-information-line text-primary-500 shrink-0" />
                <p className="text-xs text-primary-700">
                  <strong>{selected.name}</strong> is typically taken <strong>{selected.frequency}</strong>
                </p>
              </div>
            )}

            {/* Dose times */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-400">
                Dose times · {doseTimes.length}×/day
              </p>
              <div className="space-y-2">
                {doseTimes.map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                      {i + 1}
                    </span>
                    <select
                      value={t}
                      onChange={(e) => setTime(i, e.target.value)}
                      className="flex-1 rounded-xl border border-background-200 bg-white px-3 py-2.5 text-sm focus:border-primary-400 focus:outline-none"
                    >
                      {PRESET_TIMES.map((pt) => (
                        <option key={pt} value={pt}>{pt}</option>
                      ))}
                    </select>
                    {doseTimes.length > 1 && (
                      <button type="button" onClick={() => removeSlot(i)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-foreground-300 active:bg-background-100">
                        <i className="ri-close-line" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {doseTimes.length < 4 && (
                <button type="button" onClick={addSlot}
                  className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary-600 active:opacity-70">
                  <i className="ri-add-line" /> Add time
                </button>
              )}
            </div>

            {/* Rest pattern */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-400">Rest day pattern</p>
              <div className="grid grid-cols-2 gap-2">
                {REST_OPTIONS.map((opt) => {
                  const sel = restPattern === opt.key;
                  return (
                    <button key={opt.key} type="button" onClick={() => setRestPattern(opt.key)}
                      className={`flex flex-col rounded-2xl border-2 p-3 text-left transition-all active:scale-[0.97] ${
                        sel ? "border-primary-500 bg-primary-50" : "border-background-100 bg-white"
                      }`}>
                      <span className={`text-sm font-bold ${sel ? "text-primary-700" : "text-foreground-900"}`}>{opt.label}</span>
                      <span className="mt-0.5 text-[11px] text-foreground-400">{opt.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {restPattern === "custom" && (
              <div className="mt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-400">Rest days</p>
                <div className="flex gap-1.5">
                  {WEEKDAYS.map((day, d) => {
                    const active = restWeekdays.includes(d);
                    return (
                      <button key={d} type="button" onClick={() => toggleWeekday(d)}
                        className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all active:scale-95 ${
                          active ? "bg-accent-500 text-white" : "bg-background-100 text-foreground-600"
                        }`}>
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={goNext}
              className="mt-6 w-full rounded-full bg-primary-500 py-4 text-base font-bold text-white shadow-sm active:scale-[0.98]"
            >
              Review →
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP: review
        ══════════════════════════════════════════ */}
        {step === "review" && selected && vialMg && results && (
          <div className="animate-fadeIn">
            <h2 className="font-heading text-2xl font-bold text-foreground-950">Your protocol</h2>
            <p className="mt-1 text-sm text-foreground-500">Everything look right?</p>

            {/* Big vial card */}
            <div className="mt-5 flex items-center gap-5 rounded-3xl border border-background-100 bg-white p-5 shadow-sm">
              <VialIcon
                categorySlug={selected.categorySlug}
                size={68}
                label={selected.name}
                sublabel={`${vialMg}mg`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-heading text-xl font-bold text-foreground-950">{selected.name}</p>
                {goalKey && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                    <i className={`${GOALS.find(g => g.key === goalKey)?.icon} text-xs`} />
                    {GOALS.find(g => g.key === goalKey)?.label}
                  </span>
                )}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-syringe-line text-primary-500" />
                    <span className="text-foreground-700">
                      <strong className="text-foreground-950">{results.units} units</strong> · {results.mcg} mcg/dose
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-medicine-bottle-line text-primary-500" />
                    <span className="text-foreground-700">
                      <strong className="text-foreground-950">{results.doses} doses</strong> per vial
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-alarm-line text-primary-500" />
                    <span className="text-foreground-700">
                      {doseTimes.map(formatTime).join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-calendar-line text-primary-500" />
                    <span className="text-foreground-700">
                      ~<strong className="text-foreground-950">{results.doses} days</strong> of supply
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vials needed for a standard cycle */}
            {(() => {
              const recWeeks = CYCLE_WEEKS[selected.categorySlug] ?? 12;
              const dpw      = parseDosesPerWeek(selected.frequency);
              const totalDoses = recWeeks * dpw;
              const vialsNeeded = Math.ceil(totalDoses / Math.max(1, results.doses));
              return (
                <div className="mt-3 rounded-2xl bg-background-50 border border-background-100 px-4 py-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-foreground-400">
                    Typical {recWeeks}-week cycle
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-foreground-950">
                        {vialsNeeded} vial{vialsNeeded !== 1 ? "s" : ""} needed
                      </p>
                      <p className="text-xs text-foreground-500 mt-0.5">
                        {totalDoses} doses total · {results.doses} doses/vial
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/shop")}
                      className="flex items-center gap-1.5 rounded-full bg-accent-500 px-3.5 py-2 text-xs font-bold text-white active:scale-[0.97]"
                    >
                      <i className="ri-price-tag-3-line" />
                      30% off
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-foreground-400">
                    App members get 30% off all vials in our shop.
                  </p>
                </div>
              );
            })()}

            {/* Best stacked with */}
            {(() => {
              const rawCombos = STACK_COMBOS[selected.categorySlug] ?? [];
              const activeSlugs = new Set([selected.slug, ...otherActives.map(p => p.peptideSlug)]);
              const combos = rawCombos
                .filter(c => !activeSlugs.has(c.slug))
                .slice(0, 2)
                .map(c => ({ ...c, peptide: peptides.find(p => p.slug === c.slug) }))
                .filter((c): c is { slug: string; reason: string; peptide: NonNullable<typeof c["peptide"]> } => c.peptide !== undefined);

              if (combos.length === 0) return null;

              return (
                <div className="mt-3 rounded-2xl border border-background-100 bg-white px-4 py-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-500">
                      <i className="ri-add-line text-[10px] text-white" />
                    </span>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-foreground-400">
                      Best stacked with {selected.name}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {combos.map(({ slug, reason, peptide }) => (
                      <div key={slug} className="flex items-center gap-3">
                        <VialIcon categorySlug={peptide.categorySlug} size={36} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground-900">{peptide.name}</p>
                          <p className="text-[11px] leading-relaxed text-foreground-500">{reason}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            try { localStorage.setItem("vc-peptide", slug); } catch { /* ignore */ }
                            navigate("/start");
                          }}
                          className="flex-shrink-0 rounded-full border border-background-200 bg-background-50 px-3 py-1.5 text-[11px] font-semibold text-foreground-700 active:scale-[0.97]"
                        >
                          Build →
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/shop")}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 py-3 text-sm font-bold text-white active:scale-[0.97]"
                  >
                    <i className="ri-shopping-bag-line" />
                    Buy the stack — 30% off
                  </button>
                </div>
              );
            })()}

            {/* Draw line callout */}
            <div className="mt-3 rounded-2xl bg-primary-50 px-4 py-3.5">
              <div className="flex items-center gap-4">
                <i className="ri-syringe-line text-2xl text-primary-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-600">Draw line</p>
                  <p className="text-2xl font-bold text-primary-900">
                    {results.units} <span className="text-sm font-semibold text-primary-700">units on U-100 syringe</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSyringe(v => !v)}
                  className="flex-shrink-0 rounded-full border border-primary-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-primary-600 active:bg-primary-100"
                >
                  {showSyringe ? "Hide" : "Visualise"}
                </button>
              </div>
              {showSyringe && (
                <div className="mt-3 pb-1">
                  <SyringeGauge units={results.units} />
                </div>
              )}
            </div>

            {otherActives.length > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-background-50 px-4 py-3 text-xs text-foreground-500">
                <i className="ri-stack-line text-sm text-primary-400" />
                <span>
                  Adds to your stack —{" "}
                  <strong className="text-foreground-900">
                    {otherActives.map((p) => p.peptideName).join(", ")}
                  </strong>{" "}
                  {otherActives.length === 1 ? "is" : "are"} already active
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleStart}
              className="mt-4 w-full rounded-full bg-primary-500 py-4 text-base font-bold text-white shadow-sm active:scale-[0.98]"
            >
              {otherActives.length > 0 ? `Add to stack (${otherActives.length + 1} active)` : "Start Protocol"}
            </button>
            <button
              type="button"
              onClick={() => go("schedule")}
              className="mt-2 w-full rounded-full border border-background-200 py-3 text-sm font-medium text-foreground-500 active:scale-[0.98]"
            >
              Edit schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
