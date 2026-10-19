import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { peptides } from "@/mocks/peptides";
import { peptideCategories } from "@/mocks/categories";
import SyringeGauge from "@/components/feature/SyringeGauge";
import {
  doseLevels,
  dosesPerVial,
  formatDose,
  formatUnits,
  suggestWaterMl,
  unitsForDose,
} from "@/utils/dosage";

const VIAL_CHIPS = [2, 5, 10, 20];
const STEP_LABELS = ["Compound", "Vial", "Water", "Doses"];

const CARD_CLASS =
  "overflow-hidden rounded-xl border border-background-200 bg-background-50";

const NEXT_BTN =
  "whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-background-300 disabled:text-foreground-500";

const BACK_BTN =
  "whitespace-nowrap rounded-md border border-background-300 px-4 py-2 text-sm font-medium text-foreground-700 transition-colors hover:bg-background-100";

const INPUT_CLASS =
  "w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200";

export default function StartHereWizard() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<number>(1);
  const [peptideSlug, setPeptideSlug] = useState(() => searchParams.get("peptide") ?? "");
  const [vialMg, setVialMg] = useState<number>(() => Number(searchParams.get("vial") ?? 0));
  const [waterMl, setWaterMl] = useState<number | null>(null);

  useEffect(() => {
    const slug = searchParams.get("peptide");
    const vial = Number(searchParams.get("vial") ?? 0);
    if (slug) { setPeptideSlug(slug); if (vial) { setVialMg(vial); setStep(3); } else { setStep(2); } }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(
    () => peptides.find((p) => p.slug === peptideSlug),
    [peptideSlug],
  );

  const suggestedWater = selected && vialMg ? suggestWaterMl(vialMg, selected.typicalMcg) : 0;
  const effectiveWater = waterMl ?? suggestedWater;

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
    setStep(1);
    setPeptideSlug("");
    setVialMg(0);
    setWaterMl(null);
  };

  return (
    <div className={CARD_CLASS}>
      <div className="flex items-center justify-between border-b border-background-200 bg-background-100 px-5 py-3">
        <span className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-foreground-950">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-background-50">
            <i className="ri-flask-line text-xs"></i>
          </span>
          Reconstitution Wizard
        </span>
        <span className="font-label text-[11px] uppercase tracking-wide text-foreground-500">
          Three questions
        </span>
      </div>

      <div className="flex items-center px-5 pt-5">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                    active
                      ? "bg-primary-500 text-background-50"
                      : done
                        ? "bg-primary-100 text-primary-800"
                        : "bg-background-200 text-foreground-500"
                  }`}
                >
                  {done ? <i className="ri-check-line text-[11px]"></i> : n}
                </span>
                <span
                  className={`text-[10px] ${
                    active ? "font-semibold text-foreground-900" : "text-foreground-500"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <span
                  className={`mx-1.5 mb-4 h-0.5 flex-1 rounded-full transition-colors ${
                    step > n ? "bg-primary-400" : "bg-background-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="px-5 pb-5 pt-5">
        {step === 1 && (
          <div className="animate-fadeIn">
            <p className="font-heading text-sm font-semibold text-foreground-950">
              Which peptide is it?
            </p>
            <p className="mt-1 text-xs text-foreground-600">
              Choose it from the list — the name is printed on your vial.
            </p>
            <select
              value={peptideSlug}
              onChange={(e) => setPeptideSlug(e.target.value)}
              aria-label="Which peptide do you have"
              className={`mt-3 cursor-pointer ${INPUT_CLASS}`}
            >
              <option value="">— choose your peptide —</option>
              {peptideCategories.map((cat) => (
                <optgroup key={cat.slug} label={cat.name}>
                  {peptides
                    .filter((p) => p.categorySlug === cat.slug)
                    .map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
            <div className="mt-4 flex justify-end">
              <button type="button" disabled={!peptideSlug} onClick={() => setStep(2)} className={NEXT_BTN}>
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeIn">
            <p className="font-heading text-sm font-semibold text-foreground-950">
              How many mg is your vial?
            </p>
            <p className="mt-1 text-xs text-foreground-600">Tap whichever matches your label.</p>
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
            <p className="mt-4 text-center font-label text-[11px] uppercase tracking-wide text-foreground-500">
              or type it
            </p>
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
              <button type="button" onClick={() => setStep(1)} className={BACK_BTN}>
                ← Back
              </button>
              <button type="button" disabled={!vialMg} onClick={goToWater} className={NEXT_BTN}>
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 3 && selected && (
          <div className="animate-fadeIn">
            <p className="font-heading text-sm font-semibold text-foreground-950">
              Add this much bacteriostatic water
            </p>
            <div className="mt-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-5 text-center">
              <span className="font-heading text-4xl font-semibold text-primary-800">
                {effectiveWater} mL
              </span>
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
              <button type="button" onClick={() => setStep(2)} className={BACK_BTN}>
                ← Back
              </button>
              <button
                type="button"
                disabled={!effectiveWater}
                onClick={() => setStep(4)}
                className={NEXT_BTN}
              >
                It's mixed — show my doses →
              </button>
            </div>
          </div>
        )}

        {step === 4 && selected && results && (
          <div className="animate-fadeIn">
            <p className="font-heading text-sm font-semibold text-foreground-950">
              Your doses — {selected.name}
            </p>
            <p className="mt-1 font-label text-xs text-foreground-600">
              {vialMg} mg in {effectiveWater} mL · {Math.round(results.concentrationPerMl).toLocaleString()} mcg/mL ·{" "}
              {selected.frequency}
            </p>

            {(results.typicalUnits > 100 || results.typicalUnits < 2) && (
              <p className="mt-3 rounded-md border border-accent-300 bg-accent-100 px-3 py-2 text-xs text-accent-900">
                {results.typicalUnits > 100
                  ? "That dose won't fit a 1 mL syringe. Add more water, or use a larger vial."
                  : "That draw is tiny and hard to measure accurately. Adding more water would help."}
              </p>
            )}

            <div className="mt-4 rounded-xl border border-background-200 bg-background-100 px-4 pb-5 pt-5">
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
                    <tr
                      key={l.level}
                      className={`border-b border-background-100 ${
                        l.level === "Typical" ? "bg-primary-50/60" : ""
                      }`}
                    >
                      <td className="py-2 pr-2 font-medium text-foreground-900">{l.level}</td>
                      <td className="py-2 pr-2 whitespace-nowrap text-foreground-700">
                        {formatDose(l.mcg)}
                      </td>
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 shrink-0">
                            <SyringeGauge units={l.units} compact />
                          </div>
                          <span className="whitespace-nowrap text-primary-700">
                            {formatUnits(l.units)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 text-right text-foreground-700">{l.doses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={() => setStep(3)} className={BACK_BTN}>
                ← Back
              </button>
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