import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { peptides } from "@/mocks/peptides";
import VialIcon, { CATEGORY_CAP } from "@/components/feature/VialIcon";
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

const VIAL_OPTIONS = [2, 5, 10, 20];

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

  const [step, setStep]               = useState<Step>("goal");
  const [goalKey, setGoalKey]         = useState<string | null>(null);
  const [query, setQuery]             = useState("");
  const [peptideSlug, setPeptideSlug] = useState("");
  const [vialMg, setVialMg]           = useState<number | null>(null);
  const [waterMl, setWaterMl]         = useState<number | null>(null);
  const [doseTimes, setDoseTimes]     = useState<string[]>(["08:00"]);
  const [restPattern, setRestPattern] = useState<Protocol["restPattern"]>("daily");
  const [restWeekdays, setRestWeekdays] = useState<number[]>([]);

  const stepIdx  = STEPS.indexOf(step);
  const progress = (stepIdx / (STEPS.length - 1)) * 100;

  const selected = useMemo(
    () => peptides.find((p) => p.slug === peptideSlug),
    [peptideSlug],
  );
  const suggestedWater = selected && vialMg ? suggestWaterMl(vialMg, selected.typicalMcg) : 0;
  const effectiveWater = waterMl ?? suggestedWater;

  const results = useMemo(() => {
    if (!selected || !vialMg || !effectiveWater) return null;
    const dpv = dosesPerVial(vialMg, selected.typicalMcg);
    const rawUnits = unitsForDose(vialMg, effectiveWater, selected.typicalMcg);
    return {
      doses: dpv,
      units: Math.round(rawUnits * 10) / 10,
      mcg:   selected.typicalMcg,
    };
  }, [selected, vialMg, effectiveWater]);

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

  function handleStart() {
    if (!selected || !vialMg || !results) return;
    const existing = getProtocols().find(
      (p) => p.peptideSlug === selected.slug && p.status === "active",
    );
    const protocol = existing ?? createProtocol(
      selected.slug, selected.name, selected.categorySlug,
      vialMg, selected.typicalMcg, results.doses,
    );
    saveProtocol({
      ...protocol,
      waterMl: effectiveWater || undefined,
      doseTimes: doseTimes.slice().sort(),
      restPattern,
      restWeekdays: restPattern === "custom" ? restWeekdays : undefined,
    });
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

            <div className="flex items-center gap-4 mb-6">
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

            <p className="text-xs font-semibold uppercase tracking-wider text-foreground-400 mb-2">Common sizes</p>
            <div className="grid grid-cols-4 gap-2">
              {VIAL_OPTIONS.map((mg) => (
                <button
                  key={mg}
                  type="button"
                  onClick={() => setVialMg(mg)}
                  className={`rounded-2xl border-2 py-3.5 text-sm font-bold transition-all active:scale-[0.97] ${
                    vialMg === mg
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-background-100 bg-white text-foreground-900"
                  }`}
                >
                  {mg}mg
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-foreground-400 mb-2">Custom</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                inputMode="decimal"
                min={0.5}
                max={50}
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
              disabled={!vialMg}
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
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-background-50 px-4 py-3 text-sm">
                <i className="ri-syringe-line text-xl text-primary-500" />
                <span className="text-foreground-600">
                  Draw <strong className="text-foreground-950">{results.units} units</strong> ·{" "}
                  <strong className="text-foreground-950">{results.doses} doses</strong> per vial
                </span>
              </div>
            )}

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

            {/* Draw line callout */}
            <div className="mt-3 flex items-center gap-4 rounded-2xl bg-primary-50 px-4 py-3.5">
              <i className="ri-syringe-line text-2xl text-primary-500" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-600">Draw line</p>
                <p className="text-2xl font-bold text-primary-900">
                  {results.units} <span className="text-sm font-semibold text-primary-700">units on U-100 syringe</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="mt-5 w-full rounded-full bg-primary-500 py-4 text-base font-bold text-white shadow-sm active:scale-[0.98]"
            >
              Start Protocol
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
