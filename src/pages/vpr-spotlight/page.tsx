import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useReveal } from "@/hooks/useReveal";
import { useHashScroll } from "@/hooks/useHashScroll";
import AgeGate from "@/components/feature/AgeGate";
import SiteHeader from "@/components/feature/SiteHeader";
import SiteFooter from "@/components/feature/SiteFooter";
import {
  vprDescription,
  vprName,
  vprPillars,
  vprResources,
  vprStats,
  vprSteps,
  vprUrl,
} from "@/mocks/vpr";

export default function VprSpotlight() {
  useReveal();
  useHashScroll();

  useEffect(() => {
    const previous = document.title;
    document.title = "Vetting a Supplier on Verified Peptide Reviews | VialCalc";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background-50">
      <AgeGate />
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-foreground-950">
          <div className="absolute inset-0">
            <img
              src="https://readdy.ai/api/search-image?query=Dark%20moody%20editorial%20still%20life%20of%20glass%20laboratory%20vials%20and%20a%20folded%20report%20sheet%20on%20a%20deep%20slate%20surface%2C%20deep%20teal%20shadows%20with%20a%20warm%20amber%20highlight%2C%20abstract%20and%20stylized%2C%20lots%20of%20dark%20negative%20space%20across%20the%20frame%20to%20keep%20white%20overlay%20text%20readable%2C%20premium%20pharmaceutical%20magazine%20photography&width=1920&height=1080&seq=vpr-hero-2026&orientation=landscape"
              alt="Laboratory vials and a supplier report sheet under moody teal lighting"
              title="Verified Peptide Reviews supplier checks"
              className="h-full w-full object-cover object-top"
            />
            <div className="bg-dots-dark absolute inset-0 opacity-60"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90"></div>
          </div>

          <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-14 pt-32 md:px-8 md:pb-20 md:pt-44">
            <div className="max-w-3xl animate-fadeUp">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent-400 bg-accent-900 px-3 py-1 font-label text-[11px] uppercase tracking-wider text-accent-200">
                <i className="ri-shield-star-line text-sm"></i>
                Spotlight — {vprName}
              </span>

              <h1 className="mt-5 font-heading text-3xl font-semibold leading-tight tracking-tight text-background-50 md:text-5xl">
                Vet the vendor before you send a cent.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
                {vprDescription}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={vprUrl}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent-500 px-6 py-3.5 text-sm font-semibold text-accent-950 transition-colors hover:bg-accent-600"
                >
                  Open Verified Peptide Reviews <i className="ri-arrow-right-up-line"></i>
                </a>
                <Link
                  to="/vpr-spotlight#spotlight-resources"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  See what's inside <i className="ri-arrow-down-line"></i>
                </Link>
              </div>

              <div className="mt-12 grid max-w-xl grid-cols-1 gap-6 border-t border-white/15 pt-8 sm:grid-cols-3">
                {vprStats.map((stat) => (
                  <div key={stat.label}>
                    <b className="block font-heading text-2xl font-semibold text-accent-400 md:text-3xl">
                      {stat.value}
                    </b>
                    <span className="mt-1 block text-[11px] uppercase tracking-wide text-white/65">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why VPR */}
        <section className="bg-background-50 py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
            <div className="reveal max-w-2xl">
              <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1 font-label text-[10px] uppercase tracking-wide text-primary-800">
                Why it matters
              </span>
              <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground-950 md:text-4xl">
                A label can claim anything. A record can't.
              </h2>
              <p className="mt-3 text-sm text-foreground-600 md:text-base">
                A purity claim costs a vendor nothing to print. What actually protects you is an
                independent record of who shipped what — backed by lab data and other buyers —
                before any money leaves your account.
              </p>
            </div>

            <div className="reveal mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {vprPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="flex flex-col rounded-lg border border-background-200 bg-background-100 p-5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary-100 text-secondary-800">
                    <i className={`${pillar.icon} text-xl`}></i>
                  </span>
                  <h3 className="mt-4 font-heading text-base font-semibold text-foreground-950">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-600">{pillar.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Three places to start */}
        <section id="spotlight-resources" className="bg-background-100 py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
            <div className="reveal max-w-2xl">
              <span className="inline-flex items-center rounded-full bg-accent-100 px-2.5 py-1 font-label text-[10px] uppercase tracking-wide text-accent-900">
                Three places to start
              </span>
              <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground-950 md:text-4xl">
                Three doors into VPR
              </h2>
              <p className="mt-3 text-sm text-foreground-600 md:text-base">
                Three destinations doing one job: telling you whether a supplier deserves your money.
                Each one opens straight into {vprName}.
              </p>
            </div>

            <div className="reveal mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
              {vprResources.map((resource, index) => (
                <a
                  key={resource.name}
                  href={resource.href}
                  target="_blank"
                  rel="noopener"
                  className="group flex flex-col overflow-hidden rounded-lg border border-background-200 bg-background-50 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-background-200 px-5 py-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-100 text-primary-700 transition-colors group-hover:bg-primary-500 group-hover:text-background-50">
                      <i className={`${resource.icon} text-xl`}></i>
                    </span>
                    <span className="font-label text-[10px] uppercase tracking-wide text-foreground-500">
                      {String(index + 1).padStart(2, "0")} · {resource.tag}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-heading text-base font-semibold text-foreground-950">
                      {resource.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground-600">
                      {resource.desc}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                      Open on VPR <i className="ri-arrow-right-up-line"></i>
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* How to vet in three steps */}
        <section className="bg-background-50 py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
              <div className="reveal">
                <span className="inline-flex items-center rounded-full bg-secondary-100 px-2.5 py-1 font-label text-[10px] uppercase tracking-wide text-secondary-900">
                  Two-minute routine
                </span>
                <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground-950 md:text-4xl">
                  Three checks, two minutes
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-foreground-600 md:text-base">
                  Run this every time you're about to order from someone new. It takes a couple of
                  minutes and it's the cheapest insurance going.
                </p>

                <ol className="mt-8 space-y-3">
                  {vprSteps.map((step, index) => (
                    <li
                      key={step.title}
                      className="flex gap-4 rounded-lg border border-background-200 bg-background-100 p-4"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-500 font-label text-xs font-semibold text-accent-950">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <strong className="font-heading text-sm font-semibold text-foreground-950">
                          {step.title}
                        </strong>
                        <p className="mt-1 text-sm leading-relaxed text-foreground-600">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="reveal rounded-lg border border-background-200 bg-background-100 p-6 md:p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                  <i className="ri-error-warning-line text-2xl"></i>
                </span>
                <h3 className="mt-5 font-heading text-lg font-semibold text-foreground-950 md:text-xl">
                  Red flags worth walking away from
                </h3>
                <ul className="mt-5 space-y-3">
                  {[
                    "No third-party certificate for the specific batch you're ordering.",
                    "One glowing review with no order history behind it.",
                    "Prices well under every other listing for the same compound.",
                    "Pressure to pay off the normal checkout, or no stated refund terms.",
                  ].map((flag) => (
                    <li key={flag} className="flex gap-3 text-sm leading-relaxed text-foreground-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-800">
                        <i className="ri-close-line text-xs"></i>
                      </span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-secondary-500 py-14 md:py-16">
          <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 className="font-heading text-2xl font-semibold tracking-tight text-secondary-950 md:text-3xl">
                  Know who you're buying from
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-secondary-900 md:text-base">
                  Browse the directory, read the test reports and compare community feedback — free
                  to use on Verified Peptide Reviews.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                <a
                  href={vprUrl}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-secondary-950 px-6 py-3.5 text-sm font-semibold text-background-50 transition-colors hover:bg-foreground-950"
                >
                  Go to VPR <i className="ri-arrow-right-up-line"></i>
                </a>
                <Link
                  to="/#sources"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-secondary-900 px-6 py-3.5 text-sm font-semibold text-secondary-950 transition-colors hover:bg-secondary-300"
                >
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}