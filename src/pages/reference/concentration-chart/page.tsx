import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useReveal } from "@/hooks/useReveal";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useJsonLd } from "@/hooks/useJsonLd";
import AgeGate from "@/components/feature/AgeGate";
import SiteHeader from "@/components/feature/SiteHeader";
import SiteFooter from "@/components/feature/SiteFooter";
import EvlvCta from "@/components/feature/EvlvCta";

const SITE = "https://peptideratio.com";

const VIAL_SIZES_MG = [2, 5, 10, 20] as const;
const WATER_VOLUMES_ML = [1, 2, 3] as const;
const DOSES_MCG = [50, 100, 200, 250, 500, 750, 1000, 2000, 5000] as const;

function conc(vialMg: number, waterMl: number) {
  return (vialMg * 1000) / waterMl; // mcg/mL
}

function units(doseMcg: number, concMcgPerMl: number) {
  return (doseMcg / concMcgPerMl) * 100; // U-100 syringe units
}

function vol(doseMcg: number, concMcgPerMl: number) {
  return doseMcg / concMcgPerMl; // mL
}

function fmt2(n: number) {
  if (n < 0.01) return "< 0.01";
  if (n >= 100) return n.toFixed(0);
  if (n >= 10) return n.toFixed(1);
  return n.toFixed(2);
}

export default function ConcentrationChart() {
  useReveal();

  const [vialMg, setVialMg] = useState<number>(5);
  const [waterMl, setWaterMl] = useState<number>(2);

  const concentration = useMemo(() => conc(vialMg, waterMl), [vialMg, waterMl]);

  usePageMeta({
    title: "Peptide Concentration & Syringe Draw Chart — U-100 Reference | PeptideRatio",
    description:
      "Reference table: vial size × bacteriostatic water volume → mcg/mL concentration → U-100 syringe units per dose. Every common peptide vial and dose combination.",
    canonical: `${SITE}/reference/concentration-chart`,
  });

  const tableSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "Peptide Concentration & U-100 Syringe Draw Reference",
      description:
        "Concentration values and U-100 syringe draw units for common lyophilised peptide vial sizes reconstituted with bacteriostatic water.",
      url: `${SITE}/reference/concentration-chart`,
      keywords: [
        "peptide reconstitution calculator",
        "U-100 syringe units",
        "bacteriostatic water volume",
        "peptide concentration mcg/mL",
      ],
    }),
    []
  );

  const breadcrumbSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "Reference", item: `${SITE}/reference` },
        {
          "@type": "ListItem",
          position: 3,
          name: "Concentration Chart",
          item: `${SITE}/reference/concentration-chart`,
        },
      ],
    }),
    []
  );

  useJsonLd(tableSchema, "jsonld-dataset");
  useJsonLd(breadcrumbSchema, "jsonld-breadcrumb");

  return (
    <div className="min-h-screen bg-background-50">
      <AgeGate />
      <SiteHeader />

      <main>
        {/* Breadcrumb */}
        <div className="border-b border-background-200 bg-background-100 px-4 py-3 md:px-8">
          <div className="mx-auto flex max-w-[1440px] items-center gap-2 text-xs text-foreground-500">
            <Link to="/" className="hover:text-foreground-800">Home</Link>
            <span>/</span>
            <span className="text-foreground-800 font-medium">Concentration Chart</span>
          </div>
        </div>

        {/* Hero */}
        <section className="border-b border-background-200 bg-background-100 px-4 pb-12 pt-10 md:px-8 md:pb-14 md:pt-14">
          <div className="mx-auto max-w-[1440px]">
            <span className="inline-flex items-center rounded-full bg-secondary-100 px-2.5 py-1 font-label text-[10px] uppercase tracking-wide text-secondary-900">
              Reference table
            </span>
            <h1 className="mt-4 max-w-3xl font-heading text-3xl font-semibold tracking-tight text-foreground-950 md:text-5xl">
              Peptide Concentration & Syringe Draw Chart
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground-600 md:text-lg">
              Select your vial size and bacteriostatic water volume to see the resulting
              concentration, then read off the U-100 syringe units for any dose. A master reference
              grid for all common combinations follows below.
            </p>
          </div>
        </section>

        {/* Interactive calculator */}
        <section className="border-b border-background-200 px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-[1440px]">
            <h2 className="reveal font-heading text-xl font-semibold text-foreground-950 md:text-2xl">
              Quick lookup
            </h2>

            <div className="reveal mt-6 grid gap-5 lg:grid-cols-3">
              {/* Controls */}
              <div className="rounded-lg border border-background-200 bg-background-50 p-5">
                <p className="font-label text-[11px] uppercase tracking-wide text-foreground-400">
                  Vial size
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {VIAL_SIZES_MG.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVialMg(v)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                        vialMg === v
                          ? "border-primary-500 bg-primary-500 text-white"
                          : "border-background-200 bg-background-100 text-foreground-600 hover:border-primary-300"
                      }`}
                    >
                      {v} mg
                    </button>
                  ))}
                </div>

                <p className="mt-5 font-label text-[11px] uppercase tracking-wide text-foreground-400">
                  Water volume (BAC water)
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {WATER_VOLUMES_ML.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWaterMl(w)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                        waterMl === w
                          ? "border-primary-500 bg-primary-500 text-white"
                          : "border-background-200 bg-background-100 text-foreground-600 hover:border-primary-300"
                      }`}
                    >
                      {w} mL
                    </button>
                  ))}
                </div>
              </div>

              {/* Result */}
              <div className="flex flex-col justify-center rounded-lg border border-primary-200 bg-primary-50 p-5">
                <p className="font-label text-[11px] uppercase tracking-wide text-primary-600">
                  Resulting concentration
                </p>
                <p className="mt-2 font-heading text-4xl font-semibold text-foreground-950">
                  {concentration.toLocaleString()} mcg/mL
                </p>
                <p className="mt-1 text-sm text-foreground-500">
                  {vialMg} mg vial · {waterMl} mL BAC water
                </p>
                <div className="mt-4 rounded border border-primary-200 bg-primary-100 px-4 py-3 font-mono text-xs text-primary-900">
                  ({vialMg} × 1,000) ÷ {waterMl} = {concentration.toLocaleString()} mcg/mL
                </div>
              </div>

              {/* Dose table for this combo */}
              <div className="rounded-lg border border-background-200 bg-background-50 p-4">
                <p className="font-label text-[11px] uppercase tracking-wide text-foreground-400">
                  U-100 units per dose
                </p>
                <table className="mt-3 w-full text-sm">
                  <thead>
                    <tr className="border-b border-background-200">
                      <th className="pb-2 text-left text-xs font-medium text-foreground-500">Dose</th>
                      <th className="pb-2 text-right text-xs font-medium text-foreground-500">Units</th>
                      <th className="pb-2 text-right text-xs font-medium text-foreground-500">mL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DOSES_MCG.map((d) => {
                      const u = units(d, concentration);
                      const v = vol(d, concentration);
                      return (
                        <tr key={d} className="border-b border-background-100 last:border-0">
                          <td className="py-1.5 text-foreground-700">
                            {d >= 1000 ? `${d / 1000} mg` : `${d} mcg`}
                          </td>
                          <td className="py-1.5 text-right font-semibold text-foreground-900">
                            {fmt2(u)}
                          </td>
                          <td className="py-1.5 text-right text-foreground-500">{fmt2(v)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Master reference grid */}
        <section className="border-b border-background-200 bg-background-100 px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-[1440px]">
            <h2 className="reveal font-heading text-xl font-semibold text-foreground-950 md:text-2xl">
              Full reference grid — concentration by vial & water volume
            </h2>
            <p className="reveal mt-2 text-sm text-foreground-500">
              mcg/mL · all common vial sizes × water volumes
            </p>

            <div className="reveal mt-6 overflow-x-auto rounded-lg border border-background-200">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-background-100">
                  <tr>
                    <th className="border-b border-background-200 px-4 py-3 text-left text-xs font-medium text-foreground-500">
                      Vial size
                    </th>
                    {WATER_VOLUMES_ML.map((w) => (
                      <th
                        key={w}
                        className="border-b border-background-200 px-4 py-3 text-right text-xs font-medium text-foreground-500"
                      >
                        {w} mL water
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-100 bg-background-50">
                  {VIAL_SIZES_MG.map((v) => (
                    <tr key={v} className="hover:bg-background-100">
                      <td className="px-4 py-3 font-semibold text-foreground-900">{v} mg</td>
                      {WATER_VOLUMES_ML.map((w) => (
                        <td key={w} className="px-4 py-3 text-right text-foreground-700">
                          {conc(v, w).toLocaleString()} mcg/mL
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 250 mcg dose reference (very common) */}
            <h3 className="reveal mt-10 font-heading text-lg font-semibold text-foreground-950">
              U-100 syringe units for a 250 mcg dose
            </h3>
            <p className="reveal mt-1 text-sm text-foreground-500">
              250 mcg is the typical starting dose for BPC-157, CJC-1295 (no DAC), and many GH secretagogues.
            </p>
            <div className="reveal mt-4 overflow-x-auto rounded-lg border border-background-200">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-background-100">
                  <tr>
                    <th className="border-b border-background-200 px-4 py-3 text-left text-xs font-medium text-foreground-500">
                      Vial size
                    </th>
                    {WATER_VOLUMES_ML.map((w) => (
                      <th
                        key={w}
                        className="border-b border-background-200 px-4 py-3 text-right text-xs font-medium text-foreground-500"
                      >
                        {w} mL water
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-100 bg-background-50">
                  {VIAL_SIZES_MG.map((v) => (
                    <tr key={v} className="hover:bg-background-100">
                      <td className="px-4 py-3 font-semibold text-foreground-900">{v} mg</td>
                      {WATER_VOLUMES_ML.map((w) => (
                        <td key={w} className="px-4 py-3 text-right">
                          <span className="font-semibold text-foreground-900">
                            {fmt2(units(250, conc(v, w)))} units
                          </span>
                          <span className="ml-2 text-xs text-foreground-400">
                            ({fmt2(vol(250, conc(v, w)))} mL)
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 500 mcg */}
            <h3 className="reveal mt-10 font-heading text-lg font-semibold text-foreground-950">
              U-100 syringe units for a 500 mcg dose
            </h3>
            <p className="reveal mt-1 text-sm text-foreground-500">
              500 mcg is common for TB-500 sub-cutaneous administration and higher-range BPC-157 protocols.
            </p>
            <div className="reveal mt-4 overflow-x-auto rounded-lg border border-background-200">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-background-100">
                  <tr>
                    <th className="border-b border-background-200 px-4 py-3 text-left text-xs font-medium text-foreground-500">
                      Vial size
                    </th>
                    {WATER_VOLUMES_ML.map((w) => (
                      <th
                        key={w}
                        className="border-b border-background-200 px-4 py-3 text-right text-xs font-medium text-foreground-500"
                      >
                        {w} mL water
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-100 bg-background-50">
                  {VIAL_SIZES_MG.map((v) => (
                    <tr key={v} className="hover:bg-background-100">
                      <td className="px-4 py-3 font-semibold text-foreground-900">{v} mg</td>
                      {WATER_VOLUMES_ML.map((w) => (
                        <td key={w} className="px-4 py-3 text-right">
                          <span className="font-semibold text-foreground-900">
                            {fmt2(units(500, conc(v, w)))} units
                          </span>
                          <span className="ml-2 text-xs text-foreground-400">
                            ({fmt2(vol(500, conc(v, w)))} mL)
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* How to read this table */}
        <section className="border-b border-background-200 px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-[1440px]">
            <div className="reveal grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground-950">
                  How to read this chart
                </h2>
                <div className="mt-5 space-y-4 text-sm leading-relaxed text-foreground-600">
                  <p>
                    <strong className="text-foreground-900">Step 1 — find your row:</strong> match
                    the vial size your supplier ships (2 mg, 5 mg, 10 mg, or 20 mg).
                  </p>
                  <p>
                    <strong className="text-foreground-900">Step 2 — find your column:</strong>{" "}
                    match the volume of bacteriostatic water you injected into the vial (1, 2, or
                    3 mL). The cell gives your concentration in mcg/mL.
                  </p>
                  <p>
                    <strong className="text-foreground-900">Step 3 — read your dose:</strong> in
                    the dose-specific tables, the same row/column intersection gives the U-100
                    syringe units to draw and the mL volume they represent.
                  </p>
                  <p>
                    <strong className="text-foreground-900">U-100 units explained:</strong> a
                    standard 1 mL insulin syringe is marked 0–100 units. At a concentration of
                    1,000 mcg/mL, drawing to the 25-unit mark gives you 250 mcg. The units shown
                    in this chart are the marks on that syringe barrel.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-primary-200 bg-primary-50 p-6 md:p-8">
                <i className="ri-calculator-line text-3xl text-primary-500" />
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground-950">
                  Want it done for you?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-600">
                  Enter your vial size, water volume, and target dose in the reconstitution
                  wizard. PeptideRatio draws the syringe for you and shows the exact unit line.
                </p>
                <Link
                  to="/start"
                  className="mt-5 inline-flex w-fit items-center gap-2 rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  Open Calculator <i className="ri-arrow-right-line" />
                </Link>
                <Link
                  to="/guides/reconstitution"
                  className="mt-3 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800"
                >
                  Step-by-step reconstitution guide <i className="ri-arrow-right-line" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <EvlvCta />
      </main>

      <SiteFooter />
    </div>
  );
}
