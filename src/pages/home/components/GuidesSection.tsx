import { guides } from "@/mocks/guides";

export default function GuidesSection() {
  return (
    <section id="guides" className="bg-background-100 py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
        <div className="reveal max-w-2xl">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground-950 md:text-4xl">
            First time here?
          </h2>
          <p className="mt-3 text-sm text-foreground-600 md:text-base">
            Three short reads that cover the groundwork, written in plain English.
          </p>
        </div>

        <div className="reveal mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {guides.map((guide) => (
            <div
              key={guide.slug}
              className="flex flex-col rounded-lg border border-background-200 bg-background-50 p-6 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span className="inline-flex w-fit items-center rounded-full bg-accent-100 px-2.5 py-1 font-label text-[10px] uppercase tracking-wide text-accent-900">
                Guide
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold text-foreground-950">
                {guide.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground-600">
                {guide.summary}
              </p>
              <a
                href="#start"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800"
              >
                Read <i className="ri-arrow-right-line"></i>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}