import { peptideCategories } from "@/mocks/categories";
import { peptides, totalPeptides } from "@/mocks/peptides";

const CATEGORY_ICONS: Record<string, string> = {
  "tissue-repair": "ri-heart-pulse-line",
  metabolic:       "ri-fire-line",
  "gh-secretagogue": "ri-line-chart-line",
  "growth-factor": "ri-plant-line",
  longevity:       "ri-hourglass-line",
  mitochondrial:   "ri-flashlight-line",
  cognitive:       "ri-brain-line",
  immune:          "ri-shield-cross-line",
  cosmetic:        "ri-sparkling-line",
  endocrine:       "ri-test-tube-line",
  blends:          "ri-flask-line",
};

export default function BrowseByType() {
  return (
    <section id="browse" className="relative overflow-hidden bg-background-100 py-16 md:py-24">
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto w-full max-w-[1440px] px-4 md:px-8">

        <div className="reveal max-w-2xl">
          <span className="badge-primary">The library</span>
          <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground-950 md:text-4xl">
            Browse by category
          </h2>
          <p className="mt-3 text-sm text-foreground-600 md:text-base">
            {totalPeptides} compounds across {peptideCategories.length} research areas. Click any category to filter the index below.
          </p>
        </div>

        <div className="reveal mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {peptideCategories.map((cat) => {
            const count = peptides.filter((p) => p.categorySlug === cat.slug).length;
            return (
              <a
                key={cat.slug}
                href="#peptides"
                className="card-lift group flex flex-col rounded-xl border border-background-200 bg-background-50 p-5"
              >
                {/* Icon with gradient */}
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700 shadow-sm transition-all duration-200 group-hover:from-primary-500 group-hover:to-primary-600 group-hover:text-background-50 group-hover:shadow-md">
                  <i className={`${CATEGORY_ICONS[cat.slug] ?? "ri-flask-line"} text-xl`} />
                </span>

                <h3 className="mt-4 font-heading text-base font-semibold leading-snug text-foreground-950">
                  {cat.name}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-foreground-500">
                  {cat.members}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-background-100 pt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-100 px-2.5 py-1 font-label text-[10px] uppercase tracking-wide text-secondary-900">
                    <i className="ri-flask-line text-[9px]" />
                    {count} compounds
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center text-foreground-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary-600">
                    <i className="ri-arrow-right-line" />
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
