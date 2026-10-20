import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { peptides } from "@/mocks/peptides";
import { peptideCategories } from "@/mocks/categories";
import SyringeGauge from "@/components/feature/SyringeGauge";
import VialIcon from "@/components/feature/VialIcon";
import {
  doseLevels,
  dosesPerVial,
  formatDose,
  formatUnits,
  suggestWaterMl,
  unitsForDose,
} from "@/utils/dosage";

const VIAL_CHIPS = [2, 5, 10, 20];
const STEP_LABELS = ["Compound", "Vial", "Water", "Result"];

const GOALS = [
  { key: "fat",       icon: "ri-fire-line",        label: "Lose Fat",      sub: "GLP-1s & metabolics"         },
  { key: "muscle",    icon: "ri-boxing-line",       label: "Build Muscle",  sub: "GH peptides & growth factors" },
  { key: "recovery",  icon: "ri-heart-pulse-line",  label: "Recovery",      sub: "BPC-157, TB-500 & more"      },
  { key: "longevity", icon: "ri-hourglass-line",    label: "Longevity",     sub: "Bioregulators & longevity"   },
  { key: "cognitive", icon: "ri-brain-line",        label: "Cognitive",     sub: "Nootropic peptides"          },
  { key: "immune",    icon: "ri-shield-cross-line", label: "Immune",        sub: "Thymosin, LL-37 & more"      },
];

const GOAL_CATEGORIES: Record<string, string[]> = {
  fat:       ["metabolic"],
  muscle:    ["gh-secretagogue", "growth-factor"],
  recovery:  ["tissue-repair"],
  longevity: ["longevity", "mitochondrial"],
  cognitive: ["cognitive"],
  immune:    ["immune", "endocrine"],
};

const GOAL_TOP_PICKS: Record<string, string[]> = {
  fat:       ["semaglutide", "tirzepatide", "aod-9604"],
  muscle:    ["ipamorelin", "cjc-1295-no-dac", "tb-500"],
  recovery:  ["bpc-157", "tb-500", "kpv"],
  longevity: ["epitalon", "mots-c", "thymosin-alpha-1"],
  cognitive: ["semax", "selank", "cerebrolysin"],
  immune:    ["thymosin-alpha-1", "ll-37", "vip"],
};

const CAT_ICONS: Record<string, string> = {
  "tissue-repair":   "ri-heart-pulse-line",
  "metabolic":       "ri-fire-line",
  "gh-secretagogue": "ri-seedling-line",
  "growth-factor":   "ri-boxing-line",
  "longevity":       "ri-hourglass-line",
  "mitochondrial":   "ri-battery-charge-line",
  "cognitive":       "ri-brain-line",
  "immune":          "ri-shield-cross-line",
  "cosmetic":        "ri-sparkling-line",
  "endocrine":       "ri-dna-line",
  "blends":          "ri-test-tube-line",
};

const CARD_CLASS = "overflow-hidden rounded-xl border border-background-200 bg-background-50";
const NEXT_BTN   = "whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-background-300 disabled:text-foreground-500";
const BACK_BTN   = "whitespace-nowrap rounded-md border border-background-300 px-3.5 py-2 text-sm font-medium text-foreground-700 transition-colors hover:bg-background-100";
const INPUT_CLASS = "w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200";

export default function StartHereWizard() {
  const [searchParams] = useSearchParams();
  const [step, setStep]               = useState<number>(0);
  const [catSlug, setCatSlug]         = useState<string | null>(null);
  const [goal, setGoal]               = useState<string | null>(null);
  const [decideForMe, setDecideForMe] = useState(false);
  const [query, setQuery]             = useState("");
  const [peptideSlug, setPeptideSlug] = useState(() => searchParams.get("peptide") ?? "");
  const [vialMg, setVialMg]           = useState<number>(() => Number(searchParams.get("vial") ?? 0));
  const [waterMl, setWaterMl]         = useState<number | null>(null);

  useEffect(() => {
    const slug = searchParams.get("peptide");
    const vial = Number(searchParams.get("vial") ?? 0);
    if (slug) {
      setPeptideSlug(slug);
      if (vial) { setVialMg(vial); setStep(3); }
      else { setStep(2); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected       = useMemo(() => peptides.find((p) => p.slug === peptideSlug), [peptideSlug]);
  const suggestedWater = selected && vialMg ? suggestWaterMl(vialMg, selected.typicalMcg) : 0;
  const effectiveWater = waterMl ?? suggestedWater;

  const goalCatSlugs = goal ? GOAL_CATEGORIES[goal] : null;
  const topPicks     = goal ? (GOAL_TOP_PICKS[goal] ?? []) : [];

  const filteredPeptides = useMemo(() => {
    if (decideForMe && topPicks.length) return peptides.filter((p) => topPicks.includes(p.slug));
    let list = peptides;
    if (catSlug) list = list.filter((p) => p.categorySlug === catSlug);
    else if (goalCatSlugs) list = list.filter((p) => goalCatSlugs.includes(p.categorySlug));
    if (query) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catSlug, goalCatSlugs, query, decideForMe]);

  const goToWater = () => {
    if (!selected || !vialMg) return;
    if (waterMl === null) setWaterMl(suggestedWater);
    setStep(3);
  };

  const results = useMemo(() => {
    if (!selected || !vialMg || !effectiveWater) return null;
    const levels = doseLevels(selected.typicalMcg).map((l) => ({
      ...l,
      units: unitsForDose(vialMg, effectiveWater, l.mcg),
      doses: dosesPerVial(vialMg, l.mcg),
    }));
    return {
      typicalUnits: unitsForDose(vialMg, effectiveWater, selected.typicalMcg),
      doses: dosesPerVial(vialMg, selected.typicalMcg),
      concentrationPerMl: (vialMg * 1000) / effectiveWater,
      levels,
    };
  }, [selected, vialMg, effectiveWater]);

  const reset = () => {
    setStep(0);
    setCatSlug(null);
    setGoal(null);
    setDecideForMe(false);
    setQuery("");
    setPeptideSlug("");
    setVialMg(0);
    setWaterMl(null);
  };

  const pickCat = (slug: string) => {
    setCatSlug(slug);
    setGoal(null);
    setDecideForMe(false);
    setQuery("");
    setPeptideSlug("");
    setStep(1);
  };

  const pickGoal = (key: string) => {
    setGoal(key);
    setCatSlug(null);
    setDecideForMe(false);
    setQuery("");
    setPeptideSlug("");
    setStep(1);
  };

  return (
    <div className={CARD_CLASS}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-background-200 bg-background-100 px-5 py-3">
        <span className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-foreground-950">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-background-50">
            <i className="ri-flask-line text-xs" />
          </span>
          Reconstitution Wizard
        </span>
        {step > 0 && (
          <span className="font-label text-[11px] uppercase tracking-wide text-foreground-500">
            Step {step} of 4
          </span>
        )}
      </div>

      {/* ── Step progress (steps 1–4 only) ── */}
      {step > 0 && (
        <div className="flex items-center px-5 pt-4">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done   = step > n;
            return (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                    active ? "bg-primary-500 text-background-50"
                    : done  ? "bg-primary-100 text-primary-800"
                    :         "bg-background-200 text-foreground-500"
                  }`}>
                    {done ? <i className="ri-check-line text-[11px]" /> : n}
                  </span>
                  <span className={`text-[10px] ${active ? "font-semibold text-foreground-900" : "text-foreground-500"}`}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <span className={`mx-1.5 mb-4 h-0.5 flex-1 rounded-full transition-colors ${step > n ? "bg-primary-400" : "bg-background-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="px-5 pb-5 pt-4">

        {/* ════════════════════════════════════
            STEP 0 — Category picker (primary) + goal shortcut (secondary)
        ════════════════════════════════════ */}
        {step === 0 && (
          <div className="animate-fadeIn">
            <p className="font-heading text-sm font-semibold text-foreground-950">Pick a compound type</p>
            <p className="mt-0.5 text-xs text-foreground-600">Or filter by goal below — either way we'll narrow it down.</p>

            {/* Category grid — primary path */}
            <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
              {peptideCategories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => pickCat(cat.slug)}
                  className="group flex flex-col items-center gap-1.5 rounded-xl border border-background-200 bg-background-50 px-1 py-3 text-center transition-all hover:border-primary-300 hover:bg-primary-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700 transition-all duration-200 group-hover:from-primary-500 group-hover:to-primary-600 group-hover:text-white">
                    <i className={`${CAT_ICONS[cat.slug] ?? "ri-test-tube-line"} text-base`} />
                  </span>
                  <span className="line-clamp-2 text-[10px] font-medium leading-tight text-foreground-800">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Goal shortcut — secondary path */}
            <div className="mt-4 border-t border-background-200 pt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-foreground-400">Or filter by goal</p>
              <div className="flex flex-wrap gap-1.5">
                {GOALS.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => pickGoal(g.key)}
                    className="flex items-center gap-1.5 rounded-full border border-background-200 bg-background-50 px-3 py-1.5 text-[11px] font-medium text-foreground-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                  >
                    <i className={`${g.icon} text-xs`} />
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => { setCatSlug(null); setGoal(null); setStep(1); }}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                I know what I want — show everything →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            STEP 1 — Compound picker (vial grid)
        ════════════════════════════════════ */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-heading text-sm font-semibold text-foreground-950">Which peptide is it?</p>
                <p className="mt-0.5 text-xs text-foreground-600">The name is printed on your vial label.</p>
              </div>
              {(goal || catSlug) && !decideForMe && goal && (
                <button
                  type="button"
                  onClick={() => { setDecideForMe(true); setPeptideSlug(""); }}
                  className="shrink-0 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-[10px] font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                >
                  ✦ Decide for me
                </button>
              )}
              {decideForMe && (
                <button
                  type="button"
                  onClick={() => setDecideForMe(false)}
                  className="shrink-0 rounded-full border border-background-300 px-2.5 py-1 text-[10px] text-foreground-600 hover:bg-background-100"
                >
                  Show all
                </button>
              )}
            </div>

            {!decideForMe && (
              <div className="relative mt-3">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400">
                  <i className="ri-search-line text-sm" />
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    catSlug
                      ? `Search ${peptideCategories.find(c => c.slug === catSlug)?.name ?? ""} peptides…`
                      : goal
                      ? `Search ${GOALS.find(g => g.key === goal)?.label.toLowerCase()} peptides…`
                      : "Search all peptides…"
                  }
                  aria-label="Search peptides"
                  className="w-full rounded-md border border-background-300 bg-background-50 py-2 pl-8 pr-3 text-xs text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
            )}

            {decideForMe && (
              <p className="mt-2 rounded-md bg-primary-50 px-3 py-2 text-xs text-primary-700">
                ✦ Top picks for your goal — tap one to select it.
              </p>
            )}

            {/* Vial grid */}
            <div className="mt-3 max-h-56 overflow-y-auto">
              {filteredPeptides.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 pr-0.5">
                  {filteredPeptides.map((p) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => setPeptideSlug(p.slug)}
                      className={`group relative flex flex-col items-center rounded-xl border px-1.5 py-2.5 text-center transition-all ${
                        peptideSlug === p.slug
                          ? "border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-200"
                          : decideForMe
                          ? "border-primary-200 bg-primary-50/30 hover:border-primary-400 hover:bg-primary-50"
                          : "border-background-200 bg-background-50 hover:border-primary-200 hover:bg-primary-50/30"
                      }`}
                    >
                      {decideForMe && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[8px] font-bold text-white shadow-sm">
                          ✦
                        </span>
                      )}
                      <VialIcon categorySlug={p.categorySlug} size={34} />
                      <span className="mt-1.5 line-clamp-2 text-[10px] font-medium leading-tight text-foreground-800">
                        {p.name}
                      </span>
                      <span className={`mt-1.5 h-3.5 w-3.5 rounded-full border-2 transition-colors ${
                        peptideSlug === p.slug ? "border-primary-500 bg-primary-500" : "border-background-300 group-hover:border-primary-300"
                      }`} />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-xs text-foreground-500">
                  {query ? "No peptides match that search." : "No peptides in this category."}
                </p>
              )}
            </div>

            {/* Fallback to dropdown for "no goal + no query" (shows all 72) */}
            {!catSlug && !goal && !query && !decideForMe && filteredPeptides.length > 12 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium text-primary-600 hover:text-primary-700">
                  Prefer a dropdown list? ↓
                </summary>
                <select
                  value={peptideSlug}
                  onChange={(e) => setPeptideSlug(e.target.value)}
                  aria-label="Choose a peptide"
                  className={`mt-2 cursor-pointer ${INPUT_CLASS}`}
                >
                  <option value="">— choose your peptide —</option>
                  {peptideCategories.map((cat) => (
                    <optgroup key={cat.slug} label={cat.name}>
                      {peptides.filter((p) => p.categorySlug === cat.slug).map((p) => (
                        <option key={p.slug} value={p.slug}>{p.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </details>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={() => setStep(0)} className={BACK_BTN}>← Back</button>
              <button type="button" disabled={!peptideSlug} onClick={() => setStep(2)} className={NEXT_BTN}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            STEP 2 — Vial size
        ════════════════════════════════════ */}
        {step === 2 && (
          <div className="animate-fadeIn">
            {selected && (
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-background-200 bg-background-100 px-3 py-2.5">
                <VialIcon categorySlug={selected.categorySlug} size={28} />
                <div>
                  <p className="text-xs font-semibold text-foreground-950">{selected.name}</p>
                  <p className="text-[10px] text-foreground-500">{selected.frequency} · typical {formatDose(selected.typicalMcg)}</p>
                </div>
              </div>
            )}
            <p className="font-heading text-sm font-semibold text-foreground-950">How many mg is your vial?</p>
            <p className="mt-0.5 text-xs text-foreground-600">Tap whichever matches your label.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {VIAL_CHIPS.map((mg) => (
                <button
                  key={mg}
                  type="button"
                  onClick={() => setVialMg(mg)}
                  className={`whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    vialMg === mg
                      ? "border-primary-500 bg-primary-100 text-primary-800"
                      : "border-background-300 bg-background-50 text-foreground-700 hover:border-primary-300"
                  }`}
                >
                  {mg} mg
                </button>
              ))}
            </div>
            <p className="mt-3 text-center font-label text-[11px] uppercase tracking-wide text-foreground-500">or type it</p>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min={0}
                step="any"
                value={vialMg || ""}
                onChange={(e) => setVialMg(Number(e.target.value) || 0)}
                placeholder="e.g. 10"
                aria-label="Milligrams in your vial"
                className={INPUT_CLASS}
              />
              <span className="flex items-center rounded-md border border-background-300 bg-background-100 px-3 font-label text-sm text-foreground-600">
                mg
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={() => setStep(1)} className={BACK_BTN}>← Back</button>
              <button type="button" disabled={!vialMg} onClick={goToWater} className={NEXT_BTN}>Next →</button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            STEP 3 — Water volume
        ════════════════════════════════════ */}
        {step === 3 && selected && (
          <div className="animate-fadeIn">
            {selected && (
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-background-200 bg-background-100 px-3 py-2.5">
                <VialIcon categorySlug={selected.categorySlug} size={28} />
                <div>
                  <p className="text-xs font-semibold text-foreground-950">{selected.name} · {vialMg} mg</p>
                  <p className="text-[10px] text-foreground-500">{selected.frequency}</p>
                </div>
              </div>
            )}
            <p className="font-heading text-sm font-semibold text-foreground-950">Add this much bacteriostatic water</p>
            <div className="mt-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-5 text-center">
              <span className="font-heading text-4xl font-semibold text-primary-800">{effectiveWater} mL</span>
            </div>
            <p className="mt-2 text-xs text-foreground-600">
              Picked so a typical {formatDose(selected.typicalMcg)} dose lands mid-barrel.
            </p>

            <ol className="mt-4 space-y-2">
              {[
                "Swab the rubber top of both vials with an alcohol pad.",
                "Draw the water, then inject it slowly into the peptide vial.",
                "Let it run down the inside wall — never straight onto the powder.",
                "Don't shake it. Roll it gently, or just leave it to dissolve.",
                "Once the solution is clear, keep it in the fridge.",
              ].map((text, i) => (
                <li key={text} className="flex gap-2.5 text-xs text-foreground-700">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary-100 font-label text-[10px] font-semibold text-secondary-800">
                    {i + 1}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>

            <details className="mt-4 rounded-md border border-background-200 bg-background-100 px-3 py-2">
              <summary className="cursor-pointer text-xs font-medium text-foreground-700">
                I want to use a different amount of water
              </summary>
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  min={0.1}
                  step="any"
                  value={effectiveWater || ""}
                  onChange={(e) => setWaterMl(Number(e.target.value) || 0)}
                  aria-label="Millilitres of water"
                  className={INPUT_CLASS}
                />
                <span className="flex items-center rounded-md border border-background-300 bg-background-50 px-3 font-label text-sm text-foreground-600">
                  mL
                </span>
              </div>
            </details>

            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={() => setStep(2)} className={BACK_BTN}>← Back</button>
              <button type="button" disabled={!effectiveWater} onClick={() => setStep(4)} className={NEXT_BTN}>
                It's mixed — show my doses →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            STEP 4 — Results (celebration)
        ════════════════════════════════════ */}
        {step === 4 && selected && results && (
          <div className="animate-fadeIn">
            {/* Celebration header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <i className="ri-check-line text-lg text-primary-600" />
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-foreground-950">
                  Your vial is ready — {selected.name}
                </p>
                <p className="font-label text-[10px] text-foreground-500">
                  {vialMg} mg · {effectiveWater} mL · {Math.round(results.concentrationPerMl).toLocaleString()} mcg/mL · {selected.frequency}
                </p>
              </div>
            </div>

            {(results.typicalUnits > 100 || results.typicalUnits < 2) && (
              <p className="mb-3 rounded-md border border-accent-300 bg-accent-100 px-3 py-2 text-xs text-accent-900">
                {results.typicalUnits > 100
                  ? "That dose won't fit a 1 mL syringe. Add more water, or use a larger vial."
                  : "That draw is tiny and hard to measure accurately. Adding more water would help."}
              </p>
            )}

            <div className="rounded-xl border border-background-200 bg-background-100 px-4 pb-5 pt-5">
              <p className="text-center font-label text-[11px] uppercase tracking-wide text-foreground-500">
                Your first dose — draw to this line
              </p>
              <div className="mt-9">
                <SyringeGauge units={results.typicalUnits} />
              </div>
              <p className="mt-4 text-center font-heading text-3xl font-semibold text-primary-700">
                {formatUnits(results.typicalUnits)}
              </p>
              <p className="mt-1 text-center text-xs text-foreground-600">
                {results.doses} doses in this vial at {formatDose(selected.typicalMcg)}
              </p>
            </div>

            <div className="mt-4 overflow-x-auto tbl-scroll">
              <table className="w-full min-w-[420px] text-left text-xs">
                <thead>
                  <tr className="border-b border-background-200 font-label uppercase tracking-wide text-foreground-500">
                    <th className="py-2 pr-2">Level</th>
                    <th className="py-2 pr-2">Dose</th>
                    <th className="py-2 pr-2">Draw to</th>
                    <th className="py-2 text-right">Doses / vial</th>
                  </tr>
                </thead>
                <tbody>
                  {results.levels.map((l) => (
                    <tr key={l.level} className={`border-b border-background-100 ${l.level === "Typical" ? "bg-primary-50/60" : ""}`}>
                      <td className="py-2 pr-2 font-medium text-foreground-900">{l.level}</td>
                      <td className="py-2 pr-2 whitespace-nowrap text-foreground-700">{formatDose(l.mcg)}</td>
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 shrink-0"><SyringeGauge units={l.units} compact /></div>
                          <span className="whitespace-nowrap text-primary-700">{formatUnits(l.units)}</span>
                        </div>
                      </td>
                      <td className="py-2 text-right text-foreground-700">{l.doses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={() => setStep(3)} className={BACK_BTN}>← Back</button>
              <button
                type="button"
                onClick={reset}
                className="whitespace-nowrap rounded-md bg-secondary-500 px-4 py-2 text-sm font-semibold text-background-50 transition-colors hover:bg-secondary-600"
              >
                Start over
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
