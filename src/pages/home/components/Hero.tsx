import { totalPeptides } from "@/mocks/peptides";
import { peptideCategories } from "@/mocks/categories";
import StartHereWizard from "@/pages/home/components/StartHereWizard";

const stats = [
  { value: totalPeptides, label: "Compounds indexed" },
  { value: 125, label: "Studies sourced" },
  { value: peptideCategories.length, label: "Categories" },
  { value: 0, label: "Paid placements" },
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-foreground-950">
      <div className="absolute inset-0">
        <img
          src="https://readdy.ai/api/search-image?query=Artistic%20laboratory%20still%20life%20with%20glass%20peptide%20vials%2C%20a%20syringe%20and%20clear%20glassware%20on%20a%20dark%20slate%20surface%2C%20moody%20teal%20green%20tones%20with%20a%20warm%20amber%20rim%20light%2C%20shallow%20depth%20of%20field%2C%20deep%20shadows%20across%20the%20frame%20to%20keep%20white%20overlay%20text%20legible%2C%20high%20end%20editorial%20pharmaceutical%20photography&width=1920&height=1080&seq=hero-lab-2026&orientation=landscape"
          alt="Glass peptide vials and a syringe on a dark laboratory surface under teal and amber lighting"
          title="Peptide reconstitution reference laboratory"
          className="h-full w-full object-cover object-top"
        />
        <div className="bg-dots-dark absolute inset-0 opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-foreground-950/75 via-foreground-950/55 to-foreground-950/80"></div>
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-16 pt-32 md:px-8 md:pb-24 md:pt-44">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="animate-fadeUp">
            <span className="inline-flex items-center gap-2 rounded-full border border-background-50/25 bg-background-50/10 px-3 py-1 font-label text-[11px] uppercase tracking-wider text-background-50">
              <span className="font-semibold">{totalPeptides} Compounds</span>
              <span className="text-background-50/50">·</span>
              <span>Sourced dose ranges</span>
            </span>

            <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight tracking-tight text-background-50 md:text-6xl">
              Get the maths right, every time.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-background-50/85 md:text-lg">
              Answer three quick questions and we'll hand you the exact water volume for your vial
              plus the line to draw to on the syringe. No arithmetic on your side.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/start"
                className="whitespace-nowrap rounded-md bg-primary-500 px-6 py-3.5 text-center text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
              >
                Start Here — Walk Me Through It →
              </a>
              <a
                href="#peptides"
                className="whitespace-nowrap rounded-md border border-background-50/30 px-6 py-3.5 text-center text-sm font-semibold text-background-50 transition-colors hover:bg-background-50/10"
              >
                I know my numbers — browse the index
              </a>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <b className="block font-heading text-2xl font-semibold text-background-50 md:text-3xl">
                    {stat.value}
                  </b>
                  <span className="mt-1 block text-[11px] uppercase tracking-wide text-background-50/65">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 animate-fadeUp" id="start">
            <StartHereWizard />

            <a
              href="https://verifiedpeptidereviews.com"
              target="_blank"
              rel="noopener"
              className="flex items-center justify-between gap-4 rounded-lg border border-accent-400/60 bg-accent-500/95 px-5 py-4 transition-colors hover:bg-accent-500"
            >
              <span className="min-w-0">
                <span className="block font-heading text-sm font-semibold text-accent-950">
                  Verified Peptide Reviews
                </span>
                <span className="block text-xs text-accent-950/80">
                  Vet a vendor before you order
                </span>
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center text-accent-950">
                <i className="ri-arrow-right-up-line text-lg"></i>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}