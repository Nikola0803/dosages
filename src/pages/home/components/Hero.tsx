import { totalPeptides } from "@/mocks/peptides";
import { peptideCategories } from "@/mocks/categories";
import StartHereWizard from "@/pages/home/components/StartHereWizard";

const stats = [
  { value: totalPeptides,               label: "Compounds indexed" },
  { value: 125,                         label: "Studies sourced"   },
  { value: peptideCategories.length,    label: "Categories"        },
  { value: 0,                           label: "Paid placements"   },
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-foreground-950">
      {/* ── Background layers ── */}
      <div className="absolute inset-0">
        <img
          src="https://readdy.ai/api/search-image?query=Artistic%20laboratory%20still%20life%20with%20glass%20peptide%20vials%2C%20a%20syringe%20and%20clear%20glassware%20on%20a%20dark%20slate%20surface%2C%20moody%20teal%20green%20tones%20with%20a%20warm%20amber%20rim%20light%2C%20shallow%20depth%20of%20field%2C%20deep%20shadows%20across%20the%20frame%20to%20keep%20white%20overlay%20text%20legible%2C%20high%20end%20editorial%20pharmaceutical%20photography&width=1920&height=1080&seq=hero-lab-2026&orientation=landscape"
          alt="Glass peptide vials and a syringe on a dark laboratory surface under teal and amber lighting"
          title="Peptide reconstitution reference laboratory"
          className="h-full w-full object-cover object-top opacity-60"
        />
        {/* Multi-layer gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/65 to-black/95" />
        {/* Radial vignette */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)" }}
        />
        {/* Subtle mesh */}
        <div className="bg-mesh absolute inset-0 opacity-100" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-16 pt-32 md:px-8 md:pb-24 md:pt-44">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">

          {/* ── Left: headline + CTAs + stats ── */}
          <div className="animate-fadeUp">
            {/* Animated badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-3.5 py-1.5 backdrop-blur-sm">
              <span className="pulse-dot h-2 w-2 rounded-full bg-primary-400" />
              <span className="font-label text-[11px] font-semibold uppercase tracking-wider text-primary-300">
                {totalPeptides} Compounds
              </span>
              <span className="text-white/40">·</span>
              <span className="font-label text-[11px] uppercase tracking-wider text-white/75">
                Sourced dose ranges
              </span>
            </span>

            <h1 className="mt-5 font-heading text-5xl font-semibold leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl">
              Get the maths<br />
              <span className="text-gradient-primary">right, every time.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
              Answer three quick questions and we'll hand you the exact water volume for your vial
              plus the line to draw to on the syringe. No arithmetic on your side.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/start"
                className="btn-glow whitespace-nowrap rounded-lg bg-primary-500 px-6 py-3.5 text-center text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-400"
              >
                Start Here. Walk Me Through It →
              </a>
              <a
                href="#peptides"
                className="whitespace-nowrap rounded-lg border border-white/25 bg-white/8 px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/15 hover:border-white/40"
              >
                I know my numbers. Browse the index
              </a>
            </div>

            {/* Stats row */}
            <div className="mt-10 grid max-w-lg grid-cols-2 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`${i > 0 ? "border-l border-white/10 pl-5" : ""}`}
                >
                  <b className="block font-heading text-2xl font-semibold text-white md:text-3xl">
                    {stat.value}
                  </b>
                  <span className="mt-1 block font-label text-[10px] uppercase tracking-widest text-white/60">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: wizard + VPR link ── */}
          <div className="flex flex-col gap-4 animate-fadeUp" id="start" style={{ animationDelay: "0.12s" }}>
            <div className="overflow-hidden rounded-2xl border border-white/12 shadow-2xl ring-1 ring-white/5">
              <StartHereWizard />
            </div>

            <a
              href="https://verifiedpeptidereviews.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 rounded-xl border border-accent-400 bg-accent-500 px-5 py-4 transition-colors hover:bg-accent-600 hover:border-accent-500"
            >
              <span className="min-w-0">
                <span className="block font-heading text-sm font-semibold text-accent-950">
                  Verified Peptide Reviews
                </span>
                <span className="block text-xs text-accent-800">
                  Vet a vendor before you order
                </span>
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-200 text-accent-900 transition-all group-hover:translate-x-0.5">
                <i className="ri-arrow-right-up-line text-lg"></i>
              </span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
