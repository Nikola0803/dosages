import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { peptides } from "@/mocks/peptides";
import VialIcon from "@/components/feature/VialIcon";
import {
  dosesPerVial,
  suggestWaterMl,
  unitsForDose,
} from "@/utils/dosage";
import { createProtocol, saveProtocol, getProtocols, type Protocol } from "@/lib/protocol";

// ── Constants ─────────────────────────────────────────────────────────────

const GOALS = [
  { key: "recovery",  icon: "ri-heart-pulse-line",  label: "Recovery",      sub: "BPC-157, TB-500, KPV"          },
  { key: "muscle",    icon: "ri-boxing-line",        label: "Build Muscle",  sub: "Ipamorelin, CJC-1295, TB-500"  },
  { key: "fat",       icon: "ri-fire-line",          label: "Lose Fat",      sub: "Semaglutide, AOD-9604"         },
  { key: "longevity", icon: "ri-hourglass-line",     label: "Longevity",     sub: "Epitalon, MOTS-c"              },
  { key: "cognitive", icon: "ri-brain-line",         label: "Cognitive",     sub: "Semax, Selank"                 },
  { key: "immune",    icon: "ri-shield-cross-line",  label: "Immune",        sub: "Thymosin α-1, LL-37"           },
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
  { key: "daily",   label: "Every day",       sub: "No rest days"             },
  { key: "eod",     label: "Every other day", sub: "Alternate days on / off"  },
  { key: "5on2off", label: "5 on / 2 off",    sub: "5 days on, 2 days rest"   },
  { key: "custom",  label: "Custom",          sub: "Pick specific rest days"  },
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
  goal:     "Goal",
  compound: "Compound",
  vial:     "Vial",
  water:    "Water",
  schedule: "Schedule",
  review:   "Review",
};

function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
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

  const filteredPeptides = useMemo(() => {
    let list = peptides;
    if (goalKey) list = list.filter((p) => GOAL_CATS[goalKey]?.includes(p.categorySlug));
    if (query)   list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
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

  // ── Schedule helpers ─────────────────────────────────────────────────
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

  // ── Save ─────────────────────────────────────────────────────────────
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
      doseTimes: doseTimes.slice().sort(),
      restPattern,
      restWeekdays: restPattern === "custom" ? restWeekdays : undefined,
    });
    navigate("/tracker");
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-full flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-background-200">
        <div
          className="h-1 bg-primary-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={goBack}
          className={`flex items-center gap-1 text-sm font-medium text-primary-600 active:opacity-60 ${step === "goal" ? "invisible" : ""}`}
        >
          <i className="ri-arrow-left-s-line text-lg" /> Back
        </button>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground-400">
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
              We'll suggest the right compounds for you.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {GOALS.map((g) => {
                const sel = goalKey === g.key;
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => { setGoalKey(g.key); }}
                    className={`flex flex-col rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.97] ${
                      sel
                        ? "border-primary-500 bg-primary-50"
                        : "border-background-200 bg-white"
                    }`}
                  >
                    <i className={`${g.icon} text-2xl ${sel ? "text-primary-600" : "text-foreground-400"}`} />
                    <span className={`mt-2 text-sm font-bold ${sel ? "text-primary-700" : "text-foreground-900"}`}>
                      {g.label}
                    </span>
                    <span className="mt-0.5 text-[11px] leading-tight text-foreground-400">{g.sub}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={goNext}
              disabled={!goalKey}
              className="mt-6 w-full rounded-full bg-primary-500 py-4 text-base font-bold text-white shadow-sm active:scale-[0.98] disabled:bg-background-200 disabled:text-foreground-400"
            >
              Continue →
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP: compound
        ══════════════════════════════════════════ */}
        {step === "compound" && (
          <div className="animate-fadeIn">
            <h2 className="font-heading text-2xl font-bold text-foreground-950">
              {goalKey ? `Top picks for ${GOALS.find(g => g.key === goalKey)?.label}` : "Choose your compound"}
            </h2>
            <p className="mt-1 text-sm text-foreground-500">Select the peptide printed on your vial.</p>

            <div className="relative mt-4">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search all peptides..."
                className="w-full rounded-2xl border border-background-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-primary-400 focus:outline-none"
              />
            </div>

            {goalKey && !query && (
              <button
                type="button"
                onClick={() => setGoalKey(null)}
                className="mt-2 text-xs font-medium text-foreground-400 underline"
              >
                Show all peptides
              </button>
            )}

            <div className="mt-3 grid grid-cols-3 gap-2 max-h-[52vh] overflow-y-auto pb-2">
              {filteredPeptides.map((p) => {
                const sel = peptideSlug === p.slug;
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => setPeptideSlug(p.slug)}
                    className={`flex flex-col items-center rounded-2xl border-2 px-1.5 py-3 text-center transition-all active:scale-[0.97] ${
                      sel
                        ? "border-primary-500 bg-primary-50"
                        : "border-background-200 bg-white"
                    }`}
                  >
                    <VialIcon
                      categorySlug={p.categorySlug}
                      size={36}
                      label={p.name.split(" ")[0]}
                    />
                    <span className="mt-2 text-[10px] font-semibold leading-tight text-foreground-800 line-clamp-2">
                      {p.name}
                    </span>
                    {sel && <i className="ri-check-line mt-1 text-xs text-primary-500" />}
                  </button>
                );
              })}
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
            <div className="flex items-center gap-4">
              <VialIcon categorySlug={selected.categorySlug} size={52} label={selected.name} sublabel={vialMg ? `${vialMg}mg` : undefined} />
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground-950">{selected.name}</h2>
                <p className="mt-0.5 text-sm text-foreground-500">How big is your vial?</p>
              </div>
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-foreground-400">Common sizes</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {VIAL_OPTIONS.map((mg) => (
                <button
                  key={mg}
                  type="button"
                  onClick={() => setVialMg(mg)}
                  className={`rounded-2xl border-2 py-3 text-sm font-bold transition-all active:scale-[0.97] ${
                    vialMg === mg
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-background-200 bg-white text-foreground-900"
                  }`}
                >
                  {mg}mg
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-foreground-400">Or enter custom</p>
            <div className="mt-2 flex items-center gap-3">
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
            <div className="flex items-center gap-4">
              <VialIcon categorySlug={selected.categorySlug} size={52} label={selected.name} sublabel={`${vialMg}mg`} />
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground-950">Add bac water</h2>
                <p className="mt-0.5 text-sm text-foreground-500">How much bacteriostatic water?</p>
              </div>
            </div>

            {suggestedWater > 0 && (
              <div className="mt-5 rounded-2xl border border-primary-200 bg-primary-50 p-4">
                <p className="text-xs font-semibold text-primary-700">Recommended for {selected.name}</p>
                <p className="mt-0.5 text-2xl font-bold text-primary-900">{suggestedWater} mL</p>
                <button
                  type="button"
                  onClick={() => setWaterMl(suggestedWater)}
                  className="mt-2 text-xs font-semibold text-primary-600 underline active:opacity-70"
                >
                  Use this →
                </button>
              </div>
            )}

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-foreground-400">Custom amount</p>
            <div className="mt-2 flex items-center gap-3">
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
              <div className="mt-4 rounded-2xl bg-background-50 p-4 text-sm text-foreground-600">
                Draw <strong className="text-foreground-950">{results.units} units</strong> for {results.mcg} mcg ·{" "}
                <strong className="text-foreground-950">{results.doses} doses</strong> per vial
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
            <h2 className="font-heading text-2xl font-bold text-foreground-950">Set your schedule</h2>
            <p className="mt-1 text-sm text-foreground-500">
              We'll remind you at these times. You can always change this later.
            </p>

            {/* Dose times */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-400">
                Dose times ({doseTimes.length}/day)
              </p>
              <div className="space-y-2">
                {doseTimes.map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                      {i + 1}
                    </div>
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
                        className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-400 active:bg-background-100">
                        <i className="ri-close-line" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {doseTimes.length < 4 && (
                <button type="button" onClick={addSlot}
                  className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary-600 active:opacity-70">
                  <i className="ri-add-line" /> Add another dose time
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
                        sel ? "border-primary-500 bg-primary-50" : "border-background-200 bg-white"
                      }`}>
                      <span className={`text-sm font-semibold ${sel ? "text-primary-700" : "text-foreground-900"}`}>{opt.label}</span>
                      <span className="mt-0.5 text-[11px] text-foreground-400">{opt.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom weekday picker */}
            {restPattern === "custom" && (
              <div className="mt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-400">Rest on these days</p>
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
              Review protocol →
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP: review
        ══════════════════════════════════════════ */}
        {step === "review" && selected && vialMg && results && (
          <div className="animate-fadeIn">
            <h2 className="font-heading text-2xl font-bold text-foreground-950">Your protocol</h2>
            <p className="mt-1 text-sm text-foreground-500">Everything looks good? Let's start.</p>

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
                <p className="mt-0.5 text-sm text-foreground-500">{vialMg} mg vial</p>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-syringe-line text-primary-500 text-base" />
                    <span className="text-foreground-700">
                      <strong>{results.units} units</strong> · {results.mcg} mcg/dose
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-medicine-bottle-line text-primary-500 text-base" />
                    <span className="text-foreground-700">
                      <strong>{results.doses} doses</strong> per vial
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-alarm-line text-primary-500 text-base" />
                    <span className="text-foreground-700">
                      {doseTimes.map(formatTime).join(", ")}
                      {restPattern !== "daily" && (
                        <span className="ml-1 text-foreground-400 text-xs">
                          · {restPattern === "eod" ? "every other day" : restPattern === "5on2off" ? "5-on/2-off" : "custom days"}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-calendar-line text-primary-500 text-base" />
                    <span className="text-foreground-700">
                      ~<strong>{results.doses} days</strong> of supply
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Draw line callout */}
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-primary-50 px-4 py-3">
              <i className="ri-syringe-line text-2xl text-primary-500" />
              <div>
                <p className="text-xs font-semibold text-primary-800">Syringe draw line</p>
                <p className="text-xl font-bold text-primary-900">
                  {results.units} <span className="text-sm font-normal text-primary-700">units on your U-100 syringe</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="mt-6 w-full rounded-full bg-primary-500 py-4 text-base font-bold text-white shadow-sm active:scale-[0.98]"
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
