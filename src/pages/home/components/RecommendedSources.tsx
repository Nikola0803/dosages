import { vprDescription, vprName, vprResources, vprUrl } from "@/mocks/vpr";

export default function RecommendedSources() {
  return (
    <section id="sources" className="bg-background-50 py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
        <div className="reveal max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-accent-100 px-2.5 py-1 font-label text-[10px] uppercase tracking-wide text-accent-900">
            Recommended sources
          </span>
          <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground-950 md:text-4xl">
            Where to take it next
          </h2>
          <p className="mt-3 text-sm text-foreground-600 md:text-base">
            We don't sell peptides. So before you buy from anyone, run them past the independent
            directory, testing records and community reports on {vprName}.
          </p>
        </div>

        <a
          href={vprUrl}
          target="_blank"
          rel="noopener"
          className="reveal group mt-10 flex flex-col items-start gap-5 rounded-lg border border-accent-300 bg-accent-500 p-6 transition-colors hover:bg-accent-600 md:flex-row md:items-center md:justify-between md:p-8"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-950/10 text-accent-950">
              <i className="ri-shield-star-line text-2xl"></i>
            </span>
            <div className="min-w-0">
              <span className="font-label text-[10px] uppercase tracking-wide text-accent-950/70">
                Independent review site
              </span>
              <h3 className="mt-1 font-heading text-lg font-semibold text-accent-950 md:text-xl">
                {vprName}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-accent-950/80">
                {vprDescription}
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-accent-950 px-5 py-3 text-sm font-semibold text-accent-50 transition-transform group-hover:translate-x-0.5">
            See the reviews <i className="ri-arrow-right-up-line"></i>
          </span>
        </a>

        <div className="reveal mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {vprResources.map((r) => (
            <a
              key={r.name}
              href={r.href}
              target="_blank"
              rel="noopener"
              className="group flex flex-col rounded-lg border border-background-200 bg-background-100 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700 transition-colors group-hover:bg-primary-500 group-hover:text-background-50">
                <i className={`${r.icon} text-lg`}></i>
              </span>
              <h3 className="mt-4 font-heading text-sm font-semibold text-foreground-950">
                {r.name}
              </h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-foreground-600">
                {r.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary-700">
                Open on VPR <i className="ri-arrow-right-up-line"></i>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}