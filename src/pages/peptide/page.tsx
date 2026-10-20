import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useJsonLd } from "@/hooks/useJsonLd";
import { peptides } from "@/mocks/peptides";
import { peptideCategories } from "@/mocks/categories";
import { getPeptideDetail } from "@/mocks/peptideDetails";
import { evidenceTierMeta } from "@/mocks/peptides";
import SiteHeader from "@/components/feature/SiteHeader";
import SiteFooter from "@/components/feature/SiteFooter";
import AgeGate from "@/components/feature/AgeGate";
import SyringeGauge from "@/components/feature/SyringeGauge";
import VialIcon from "@/components/feature/VialIcon";
import { useReveal } from "@/hooks/useReveal";

function fmt(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)} mg`;
  return `${v} mcg`;
}

const EVIDENCE_COLORS: Record<string, string> = {
  clinical:   "bg-primary-100 text-primary-800 border-primary-200",
  preclinical: "bg-accent-100 text-accent-800 border-accent-200",
  limited:    "bg-background-100 text-foreground-600 border-background-200",
};

type ExpandedDose = { label: string; dose: number; color: string } | null;

export default function PeptidePage() {
  useReveal();
  const { slug } = useParams<{ slug: string }>();
  const [expanded, setExpanded] = useState<ExpandedDose>(null);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const peptide = peptides.find(p => p.slug === slug);

  const detail = getPeptideDetail(slug ?? "");
  const category = peptideCategories.find(c => c.slug === peptide?.categorySlug);

  const pageTitle = peptide
    ? `${peptide.name} Dosing Reference — Reconstitution Guide | VialCalc`
    : "Peptide | VialCalc";
  const pageDesc = peptide
    ? (detail?.tagline ?? `Dose range, reconstitution guide and syringe draw line for ${peptide?.name}. Free calculator.`)
    : "";

  usePageMeta({
    title: pageTitle,
    description: pageDesc,
    canonical: `https://peptidedosingcalculator.co/peptide/${slug}`,
  });

  const peptideSchema = useMemo(() => (!peptide ? {} : {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: pageTitle,
    url: `https://peptidedosingcalculator.co/peptide/${slug}`,
    description: pageDesc,
    about: {
      "@type": "Drug",
      name: peptide.name,
      description: detail?.mechanism ?? `${peptide.name} research peptide`,
      administrationRoute: detail?.route?.join(", ") ?? "subcutaneous",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home",                    item: "https://peptidedosingcalculator.co" },
        { "@type": "ListItem", position: 2, name: category?.name ?? "Peptides", item: "https://peptidedosingcalculator.co/#peptides" },
        { "@type": "ListItem", position: 3, name: peptide.name,               item: `https://peptidedosingcalculator.co/peptide/${slug}` },
      ],
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [slug]);

  useJsonLd(peptideSchema as Record<string, unknown>, "jsonld-peptide");

  if (!peptide) return <Navigate to="/" replace />;
  const evidence = evidenceTierMeta[peptide.evidence];
  const doseLow  = detail?.doseLow  ?? Math.round(peptide.typicalMcg * 0.5);
  const doseHigh = detail?.doseHigh ?? Math.round(peptide.typicalMcg * 2);
  const maxGauge = Math.ceil(doseHigh * 1.2 / 100) * 100;

  const categoryPeers = peptides
    .filter(p => p.categorySlug === peptide.categorySlug && p.slug !== slug)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background-50">
      <AgeGate />
      <SiteHeader />

      <main>
        {/* ── Breadcrumb ── */}
        <div className="border-b border-background-200 bg-background-100 px-4 py-3 md:px-8">
          <div className="mx-auto flex max-w-[1440px] items-center gap-2 text-xs text-foreground-500">
            <Link to="/" className="hover:text-foreground-800">Home</Link>
            <span>/</span>
            <Link to="/#peptides" className="hover:text-foreground-800">{category?.name ?? "Peptides"}</Link>
            <span>/</span>
            <span className="text-foreground-800 font-medium">{peptide.name}</span>
          </div>
        </div>

        {/* ── Hero ── */}
        <section className="border-b border-background-200 bg-background-100 px-4 pb-10 pt-10 md:px-8 md:pb-14 md:pt-14">
          <div className="mx-auto max-w-[1440px]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <VialIcon categorySlug={peptide.categorySlug} size={52} fillRatio={0.7} />
                <div>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${EVIDENCE_COLORS[peptide.evidence]}`}>
                    {evidence.label} Evidence
                  </span>
                  <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground-950 md:text-4xl">
                    {peptide.name}
                  </h1>
                  {detail && (
                    <p className="mt-2 text-base text-foreground-600">{detail.tagline}</p>
                  )}
                </div>
              </div>
              <Link
                to={`/start?peptide=${slug}`}
                className="shrink-0 rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
              >
                Calculate My Dose →
              </Link>
            </div>

            {/* Quick stats bar */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: "Typical dose", value: fmt(peptide.typicalMcg) },
                { label: "Frequency",    value: peptide.frequency },
                { label: "Route",        value: detail?.route.join(" / ") ?? "SC" },
                { label: "Half-life",    value: detail?.halfLife ?? "—" },
                { label: "Cycle length", value: detail?.cycleLength ?? "—" },
              ].map(s => (
                <div key={s.label} className="rounded-lg border border-background-200 bg-background-50 px-4 py-3">
                  <span className="block text-[10px] uppercase tracking-widest text-foreground-400">{s.label}</span>
                  <span className="mt-1 block font-heading text-sm font-semibold text-foreground-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dose range + syringe ── */}
        <section className="border-b border-background-200 px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-[1440px]">
            <h2 className="font-heading text-xl font-semibold text-foreground-950">Dose Range</h2>
            <p className="mt-1 text-sm text-foreground-500">
              Drawn from published research — not a recommendation for human use.
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {[
                { label: "Low",     dose: doseLow,            color: "text-primary-500" },
                { label: "Typical", dose: peptide.typicalMcg, color: "text-primary-700" },
                { label: "High",    dose: doseHigh,           color: "text-foreground-900" },
              ].map(row => (
                <button
                  key={row.label}
                  type="button"
                  onClick={() => setExpanded(row)}
                  className="group rounded-lg border border-background-200 bg-background-50 p-5 text-left transition-colors hover:border-primary-300 hover:bg-primary-50"
                  title="Click to enlarge"
                >
                  <div className="flex items-start justify-between">
                    <span className="block text-[10px] uppercase tracking-widest text-foreground-400">{row.label}</span>
                    <span className="text-[10px] text-foreground-300 opacity-0 transition-opacity group-hover:opacity-100">
                      <i className="ri-zoom-in-line" /> enlarge
                    </span>
                  </div>
                  <span className={`mt-1 block font-heading text-2xl font-semibold ${row.color}`}>
                    {fmt(row.dose)}
                  </span>
                  <div className="mt-4">
                    <SyringeGauge
                      units={row.dose}
                      max={maxGauge}
                      infoLabel={`dose range · 0 – ${fmt(maxGauge)}`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mechanism (if we have detail) ── */}
        {detail && (
          <section className="border-b border-background-200 px-4 py-10 md:px-8 md:py-14">
            <div className="mx-auto max-w-[1440px]">
              <div className="grid gap-10 lg:grid-cols-2">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-foreground-950">How It Works</h2>
                  <p className="mt-4 leading-relaxed text-foreground-700">{detail.mechanism}</p>
                  {detail.notes && (
                    <div className="mt-6 rounded-lg border border-accent-200 bg-accent-50 px-4 py-4 text-sm text-accent-900">
                      <span className="font-semibold">Protocol note: </span>{detail.notes}
                    </div>
                  )}
                </div>

                {/* Common vial sizes */}
                <div>
                  <h2 className="font-heading text-xl font-semibold text-foreground-950">Common Vial Sizes</h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {detail.vialSizes.map(mg => (
                      <Link
                        key={mg}
                        to={`/start?peptide=${slug}&vial=${mg}`}
                        className="flex flex-col items-center rounded-lg border border-background-200 bg-background-50 px-6 py-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
                      >
                        <span className="font-heading text-xl font-semibold text-foreground-900">{mg} mg</span>
                        <span className="mt-1 text-xs text-primary-600">Calculate →</span>
                      </Link>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-foreground-400">
                    Click a vial size to open the reconstitution wizard pre-filled.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Reconstitution CTA ── */}
        <section className="border-b border-background-200 bg-primary-950 px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-[1440px]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-xl font-semibold text-background-50">
                  Work out your exact draw line
                </h2>
                <p className="mt-1 text-sm text-primary-200">
                  Tell us your vial size, water volume, and target dose — we'll show you the syringe line.
                </p>
              </div>
              <Link
                to={`/start?peptide=${slug}`}
                className="shrink-0 rounded-md bg-primary-400 px-6 py-3 text-sm font-semibold text-primary-950 transition-colors hover:bg-primary-300"
              >
                Open Reconstitution Wizard →
              </Link>
            </div>
          </div>
        </section>

        {/* ── In-category peers ── */}
        {categoryPeers.length > 0 && (
          <section className="px-4 py-10 md:px-8 md:py-14">
            <div className="mx-auto max-w-[1440px]">
              <h2 className="font-heading text-xl font-semibold text-foreground-950">
                More in {category?.name}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {categoryPeers.map(p => (
                  <Link
                    key={p.slug}
                    to={`/peptide/${p.slug}`}
                    className="rounded-lg border border-background-200 bg-background-100 px-4 py-3 transition-colors hover:border-primary-300 hover:bg-primary-50"
                  >
                    <span className="block font-heading text-sm font-semibold text-foreground-900">{p.name}</span>
                    <span className="mt-1 block text-xs text-foreground-500">{fmt(p.typicalMcg)} · {p.frequency}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── Syringe expand modal ── */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-950/70 px-4 backdrop-blur-sm"
          onClick={() => setExpanded(null)}
        >
          <div
            className="w-full max-w-2xl rounded-xl border border-background-200 bg-background-50 p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest text-foreground-400">{expanded.label} dose</span>
                <p className={`font-heading text-3xl font-semibold ${expanded.color}`}>{fmt(expanded.dose)}</p>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-500 hover:bg-background-200"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>
            <SyringeGauge
              units={expanded.dose}
              max={maxGauge}
              infoLabel={`${peptide.name} · dose range 0 – ${fmt(maxGauge)}`}
            />
            <p className="mt-4 text-center text-xs text-foreground-400">
              Scale: 0 – {fmt(maxGauge)} · Press Esc or click outside to close
            </p>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
