import { evidenceTierMeta, peptides, type EvidenceTier } from "@/mocks/peptides";

const tiers: EvidenceTier[] = ["clinical", "preclinical", "limited"];

const descriptions: { tier: EvidenceTier; title: string; body: string }[] = [
  {
    tier: "clinical",
    title: "Human trial data",
    body: "Registered trials with published dose-escalation arms — the GLP-1 class, tesamorelin, elamipretide and bremelanotide among them.",
  },
  {
    tier: "preclinical",
    title: "Preclinical research data",
    body: "Where the only figures available are weight-based animal dosing, we label it that way and give the reported mg/kg rather than implying a human equivalent.",
  },
  {
    tier: "limited",
    title: "Observational and grey literature",
    body: "Ranges that circulate widely in the research community but lack formal trials, flagged clearly as low-confidence.",
  },
];

const tierChip: Record<EvidenceTier, string> = {
  clinical: "bg-primary-100 text-primary-800",
  preclinical: "bg-secondary-100 text-secondary-900",
  limited: "bg-accent-100 text-accent-900",
};

export default function Methodology() {
  return (
    <section id="methodology" className="bg-background-50 py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-14">
          <div className="reveal flex flex-col">
            <span className="inline-flex w-fit items-center rounded-full bg-primary-100 px-2.5 py-1 font-label text-[10px] uppercase tracking-wide text-primary-800">
              Methodology
            </span>
            <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground-950 md:text-4xl">
              How every dose figure is sourced
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground-700 md:text-base">
              Every dose range here is filed under one of three evidence tiers, and we tell you which
              one a compound belongs to instead of blending them all together:
            </p>

            <ul className="mt-6 space-y-3">
              {descriptions.map((d, i) => (
                <li
                  key={d.tier}
                  className="flex gap-3 rounded-lg border border-background-200 bg-background-100 p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 font-label text-xs font-semibold text-primary-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="font-heading text-sm font-semibold text-foreground-950">
                        {d.title}
                      </strong>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 font-label text-[10px] uppercase tracking-wide ${tierChip[d.tier]}`}
                      >
                        {evidenceTierMeta[d.tier].label} ·{" "}
                        {peptides.filter((p) => p.evidence === d.tier).length}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground-700">{d.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <a
              href="#peptides"
              className="mt-auto inline-flex w-fit items-center gap-1 pt-6 text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800"
            >
              Open the full research library <i className="ri-arrow-right-line"></i>
            </a>
          </div>

          <div className="reveal flex flex-col overflow-hidden rounded-lg border border-background-200 bg-background-100">
            <div className="flex items-center justify-between gap-3 border-b border-background-200 px-5 py-4">
              <h3 className="font-heading text-base font-semibold text-foreground-950">
                Evidence tiers, by the numbers
              </h3>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background-200 text-foreground-600">
                <i className="ri-bar-chart-line text-sm"></i>
              </span>
            </div>
            <div className="tbl-scroll flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-background-200 font-label text-[11px] uppercase tracking-wide text-foreground-500">
                    <th className="px-5 py-3">Tier</th>
                    <th className="px-5 py-3">Compounds</th>
                    <th className="px-5 py-3">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((tier) => {
                    const count = peptides.filter((p) => p.evidence === tier).length;
                    return (
                      <tr key={tier} className="border-b border-background-200 last:border-0">
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 font-label text-[10px] uppercase tracking-wide ${tierChip[tier]}`}
                          >
                            {evidenceTierMeta[tier].label}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-heading font-semibold text-foreground-950">
                          {count}
                        </td>
                        <td className="px-5 py-3 text-foreground-600">
                          {evidenceTierMeta[tier].meaning}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t border-background-200 px-5 py-3">
              <p className="text-[11px] text-foreground-500">
                Counts update live across the {peptides.length} indexed compounds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}