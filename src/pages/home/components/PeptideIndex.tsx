import { useMemo, useState } from "react";
import { peptideCategories } from "@/mocks/categories";
import {
  peptides,
  totalPeptides,
  evidenceTierMeta,
  type EvidenceTier,
} from "@/mocks/peptides";

const tierFilters: { key: EvidenceTier | "all"; label: string }[] = [
  { key: "all", label: "All tiers" },
  { key: "clinical", label: "Clinical" },
  { key: "preclinical", label: "Preclinical" },
  { key: "limited", label: "Limited" },
];

const tierChip: Record<EvidenceTier, string> = {
  clinical: "bg-primary-100 text-primary-800",
  preclinical: "bg-secondary-100 text-secondary-900",
  limited: "bg-accent-100 text-accent-900",
};

const formatDose = (mcg: number) =>
  mcg >= 1000 ? `${(mcg / 1000).toLocaleString()} mg` : `${mcg} mcg`;

export default function PeptideIndex() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [activeTier, setActiveTier] = useState<EvidenceTier | "all">("all");

  const catName = (slug: string) =>
    peptideCategories.find((c) => c.slug === slug)?.name ?? "Uncategorised";

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return peptides.filter((p) => {
      if (activeCat !== "all" && p.categorySlug !== activeCat) return false;
      if (activeTier !== "all" && p.evidence !== activeTier) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, activeCat, activeTier]);

  const hasFilters = query !== "" || activeCat !== "all" || activeTier !== "all";

  const resetFilters = () => {
    setQuery("");
    setActiveCat("all");
    setActiveTier("all");
  };

  return (
    <section id="peptides" className="bg-background-100 py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
        <div className="reveal flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1 font-label text-[10px] uppercase tracking-wide text-primary-800">
              The index
            </span>
            <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground-950 md:text-4xl">
              Look up a compound
            </h2>
            <p className="mt-3 text-sm text-foreground-600 md:text-base">
              Search or filter all {totalPeptides} reference entries. Pick one and it drops straight
              into the calculator with its published dose range.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <span className="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-foreground-400">
              <i className="ri-search-line"></i>
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search peptides"
              aria-label="Search peptides"
              className="w-full rounded-md border border-background-300 bg-background-50 py-2.5 pl-10 pr-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>

        <div className="reveal mt-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1.5 font-label text-[11px] uppercase tracking-wide text-foreground-500">
            <i className="ri-filter-3-line"></i> Evidence
          </span>
          {tierFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveTier(f.key)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 font-label text-[11px] uppercase tracking-wide transition-colors ${
                activeTier === f.key
                  ? "bg-primary-500 text-background-50"
                  : "bg-background-50 text-foreground-600 hover:bg-primary-100 hover:text-primary-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="reveal mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCat("all")}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCat === "all"
                ? "bg-foreground-900 text-background-50"
                : "bg-background-50 text-foreground-600 hover:bg-secondary-100 hover:text-secondary-900"
            }`}
          >
            All types
          </button>
          {peptideCategories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setActiveCat(cat.slug)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCat === cat.slug
                  ? "bg-foreground-900 text-background-50"
                  : "bg-background-50 text-foreground-600 hover:bg-secondary-100 hover:text-secondary-900"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between border-b border-background-300 pb-3">
          <p className="text-xs text-foreground-500">
            Showing <strong className="font-semibold text-foreground-800">{results.length}</strong>{" "}
            of {totalPeptides}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 transition-colors hover:text-primary-800"
            >
              <i className="ri-close-circle-line"></i> Clear filters
            </button>
          )}
        </div>

        {results.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((p) => (
              <a
                key={p.slug}
                href="#start"
                title={`Open the reconstitution calculator for ${p.name}`}
                className="group flex flex-col rounded-lg border border-background-200 bg-background-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-heading text-sm font-semibold leading-snug text-foreground-950">
                    {p.name}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-label text-[10px] uppercase tracking-wide ${tierChip[p.evidence]}`}
                  >
                    {evidenceTierMeta[p.evidence].label}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-foreground-500">
                  {catName(p.categorySlug)}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-background-200 pt-3">
                  <span className="flex min-w-0 items-center gap-1.5 text-xs text-foreground-500">
                    <i className="ri-test-tube-line shrink-0 text-foreground-400"></i>
                    <span className="font-medium text-foreground-800">
                      {formatDose(p.typicalMcg)}
                    </span>
                    <span className="text-foreground-400">·</span>
                    <span className="truncate">{p.frequency}</span>
                  </span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-foreground-400 transition-all group-hover:translate-x-0.5 group-hover:text-primary-600">
                    <i className="ri-arrow-right-line"></i>
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-lg border border-dashed border-background-300 bg-background-50 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background-200 text-foreground-500">
              <i className="ri-search-eye-line text-xl"></i>
            </span>
            <h3 className="mt-4 font-heading text-base font-semibold text-foreground-950">
              No compounds match that
            </h3>
            <p className="mt-1 max-w-sm text-sm text-foreground-600">
              Try a different spelling, or clear your filters to see all {totalPeptides} entries.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
            >
              Show everything
            </button>
          </div>
        )}
      </div>
    </section>
  );
}