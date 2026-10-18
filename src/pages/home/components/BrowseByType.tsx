import { peptideCategories } from "@/mocks/categories";
import { peptides, totalPeptides } from "@/mocks/peptides";

const CATEGORY_ICONS: Record<string, string> = {
  "tissue-repair": "ri-heart-pulse-line",
  metabolic: "ri-fire-line",
  "gh-secretagogue": "ri-line-chart-line",
  "growth-factor": "ri-plant-line",
  longevity: "ri-hourglass-line",
  mitochondrial: "ri-flashlight-line",
  cognitive: "ri-brain-line",
  immune: "ri-shield-cross-line",
  cosmetic: "ri-sparkling-line",
  endocrine: "ri-test-tube-line",
  blends: "ri-flask-line",
};

export default function BrowseByType() {
  return (
    <section id="browse" className="relative overflow-hidden bg-background-100 py-16 md:py-24">
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-70"></div>
      <div className="relative mx-auto w-full max-w-[1440px] px-4 md:px-8">
        <div className="reveal max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1 font-label text-[10px] uppercase tracking-wide text-primary-800">
            The library
          </span>
          <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground-950 md:text-4xl">
            Browse the categories
          </h2>
          <p className="mt-3 text-sm text-foreground-600 md:text-base">
            {totalPeptides} compounds, grouped into {peptideCategories.length} research areas.
          </p>
        </div>

        <div className="reveal mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {peptideCategories.map((cat) => {
            const count = peptides.filter((p) => p.categorySlug === cat.slug).length;
            return (
              <a
                key={cat.slug}
                href="#peptides"
                className="group flex flex-col rounded-lg border border-background-200 bg-background-50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-100 text-primary-700 transition-colors group-hover:bg-primary-500 group-hover:text-background-50">
                  <i className={`${CATEGORY_ICONS[cat.slug] ?? "ri-flask-line"} text-xl`}></i>
                </span>
                <h3 className="mt-4 font-heading text-base font-semibold leading-snug text-foreground-950">
                  {cat.name}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-foreground-600">
                  {cat.members}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-secondary-100 px-2.5 py-1 font-label text-[10px] uppercase tracking-wide text-secondary-900">
                    {count} compounds
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center text-foreground-400 transition-all group-hover:translate-x-0.5 group-hover:text-primary-600">
                    <i className="ri-arrow-right-line"></i>
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}