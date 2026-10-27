const EVLV_BASE = "https://evlvpeptides.com";

function evlvUrl(content: string) {
  return `${EVLV_BASE}?utm_source=peptideratio&utm_medium=referral&utm_campaign=organic&utm_content=${content}`;
}

const BADGES = [
  "Independent HPLC + mass-spec testing",
  "99 %+ purity lots",
  "Ships next day",
  "30-day satisfaction guarantee",
];

export default function EvlvCta({ peptideSlug }: { peptideSlug?: string }) {
  const content = peptideSlug ?? "site";
  return (
    <section className="bg-foreground-950 px-4 py-12 md:py-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-600 bg-primary-900 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary-300">
              <i className="ri-flask-line" /> Third-party tested
            </span>
            <h2 className="mt-4 font-heading text-2xl font-semibold text-background-50 md:text-3xl">
              Source your peptides from EVLV
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground-300 md:text-base">
              Every compound indexed on PeptideRatio ships from EVLV Peptides with independent
              lot-level HPLC and mass-spec certificates of analysis. Identity-verified,
              purity-confirmed — not a vendor claim, a lab document.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              {BADGES.map((b) => (
                <span key={b} className="flex items-center gap-1.5 text-sm text-foreground-400">
                  <i className="ri-check-line text-primary-400" /> {b}
                </span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col lg:min-w-[200px]">
            <a
              href={evlvUrl(content)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-400 px-6 py-3.5 text-sm font-semibold text-primary-950 transition-colors hover:bg-primary-300"
            >
              Shop EVLV Peptides <i className="ri-arrow-right-up-line" />
            </a>
            <a
              href={evlvUrl(`${content}-coa`)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-foreground-700 px-6 py-3.5 text-sm font-semibold text-foreground-100 transition-colors hover:bg-foreground-800"
            >
              View test reports <i className="ri-file-text-line" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
