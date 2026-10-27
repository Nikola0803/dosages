import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useReveal } from "@/hooks/useReveal";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useJsonLd } from "@/hooks/useJsonLd";
import AgeGate from "@/components/feature/AgeGate";
import SiteHeader from "@/components/feature/SiteHeader";
import SiteFooter from "@/components/feature/SiteFooter";
import { vendors, BADGE_META, type Vendor } from "@/mocks/vendors";

const SITE = "https://peptideratio.com";
const VPR = "https://www.verifiedpeptidereviews.com";

const EVLV_UTM =
  "https://evlvpeptides.com?utm_source=peptideratio&utm_medium=referral&utm_campaign=vendors-page&utm_content=featured";

function ScoreDot({ score }: { score: number }) {
  const color =
    score >= 4.9 ? "bg-primary-500" :
    score >= 4.8 ? "bg-primary-400" :
    score >= 4.7 ? "bg-primary-300" :
    "bg-primary-200";
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
  );
}

function BadgePill({ badge }: { badge: keyof typeof BADGE_META }) {
  const m = BADGE_META[badge];
  return (
    <span
      title={m.title}
      className="inline-flex items-center gap-1 rounded-full border border-background-200 bg-background-100 px-2 py-0.5 text-[10px] font-medium text-foreground-500"
    >
      <i className={`${m.icon} text-primary-500`} />
      {m.label}
    </span>
  );
}

function VendorRow({ v, rank }: { v: Vendor; rank: number }) {
  return (
    <div className="group flex items-center gap-4 border-b border-background-100 px-5 py-4 transition-colors hover:bg-primary-50/40 last:border-0 md:px-6">
      {/* Rank */}
      <span className="w-6 shrink-0 font-label text-sm font-semibold text-foreground-300 tabular-nums">
        {rank}
      </span>

      {/* Name + country + badges */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-heading text-sm font-semibold text-foreground-950">{v.name}</span>
          <span className="text-[11px] text-foreground-400">{v.country}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {v.badges.map((b) => (
            <BadgePill key={b} badge={b} />
          ))}
        </div>
      </div>

      {/* Score */}
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <ScoreDot score={v.score} />
        <span className="font-heading text-sm font-semibold text-foreground-900">{v.score.toFixed(1)}</span>
        <span className="text-[11px] text-foreground-400">/5</span>
      </div>

      {/* CTA */}
      <a
        href={v.storeUrl}
        target="_blank"
        rel="noopener"
        className="shrink-0 rounded-md bg-primary-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-600"
      >
        Shop <i className="ri-arrow-right-up-line" />
      </a>
    </div>
  );
}

export default function VendorsPage() {
  useReveal();

  const featured = vendors.find((v) => v.featured)!;
  const others = vendors.filter((v) => !v.featured);

  usePageMeta({
    title: "Verified Peptide Vendors — EVLV & VPR-Rated Directory | PeptideRatio",
    description:
      "Curated directory of independently verified peptide vendors. EVLV Peptides featured. Scores, COA status and review counts sourced from Verified Peptide Reviews.",
    canonical: `${SITE}/vendors`,
  });

  const listSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Verified Peptide Vendors",
      description:
        "Curated directory of independently verified research peptide vendors, sourced from Verified Peptide Reviews.",
      url: `${SITE}/vendors`,
      numberOfItems: vendors.length,
      itemListElement: vendors.map((v, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: v.name,
        url: v.storeUrl,
      })),
    }),
    []
  );

  const breadcrumbSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "Vendors", item: `${SITE}/vendors` },
      ],
    }),
    []
  );

  useJsonLd(listSchema, "jsonld-vendors");
  useJsonLd(breadcrumbSchema, "jsonld-breadcrumb");

  return (
    <div className="min-h-screen bg-background-50">
      <AgeGate />
      <SiteHeader />

      <main>
        {/* Breadcrumb */}
        <div className="border-b border-background-200 bg-background-100 px-4 py-3 md:px-8">
          <div className="mx-auto flex max-w-[1440px] items-center gap-2 text-xs text-foreground-500">
            <Link to="/" className="hover:text-foreground-800">Home</Link>
            <span>/</span>
            <span className="font-medium text-foreground-800">Vendors</span>
          </div>
        </div>

        {/* Hero */}
        <section className="border-b border-background-200 bg-background-100 px-4 pb-12 pt-10 md:px-8 md:pb-16 md:pt-14">
          <div className="mx-auto max-w-[1440px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 font-label text-[10px] uppercase tracking-wider text-primary-800">
              <i className="ri-shield-check-line" /> VPR-Verified
            </span>
            <h1 className="mt-4 max-w-2xl font-heading text-3xl font-semibold tracking-tight text-foreground-950 md:text-5xl">
              Peptide Vendors<br className="hidden md:block" /> We Recommend
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground-500 md:text-lg">
              Every listing is independently audited by{" "}
              <a href={VPR} target="_blank" rel="noopener" className="text-primary-700 underline-offset-2 hover:underline">
                Verified Peptide Reviews
              </a>
              . Scores and COA status sourced directly from VPR.
            </p>
          </div>
        </section>

        {/* Featured: EVLV */}
        <section className="border-b border-background-200 px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-[1440px]">
            <div className="reveal overflow-hidden rounded-2xl bg-foreground-950 shadow-2xl">
              {/* Sponsor label */}
              <div className="flex items-center justify-between border-b border-foreground-800 px-6 py-3">
                <span className="flex items-center gap-2 font-label text-[10px] uppercase tracking-wider text-foreground-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                  Featured Partner · Sponsored
                </span>
                <span className="text-[10px] text-foreground-600">VPR rankings editorially independent</span>
              </div>

              <div className="grid gap-0 lg:grid-cols-2">
                {/* Left: info */}
                <div className="flex flex-col justify-center p-8 md:p-10">
                  <div className="flex items-start gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="font-heading text-2xl font-semibold text-background-50 md:text-3xl">
                          {featured.name}
                        </h2>
                        <div className="flex items-center gap-1.5 rounded-full border border-accent-500/40 bg-accent-500/10 px-2.5 py-1">
                          <i className="ri-star-fill text-xs text-accent-400" />
                          <span className="font-heading text-sm font-semibold text-accent-300">
                            {featured.score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-foreground-500">
                        {featured.reviews.toLocaleString()} verified reviews · {featured.country}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-relaxed text-foreground-300 md:text-base">
                    {featured.tagline}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {featured.badges.map((b) => (
                      <span
                        key={b}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary-700/50 bg-primary-900/50 px-3 py-1 text-xs font-medium text-primary-300"
                      >
                        <i className={BADGE_META[b].icon} />
                        {BADGE_META[b].label}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={EVLV_UTM}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-400 px-7 py-3.5 text-sm font-semibold text-primary-950 transition-colors hover:bg-primary-300"
                    >
                      Shop EVLV Peptides <i className="ri-arrow-right-up-line" />
                    </a>
                  </div>
                </div>

                {/* Right: feature points */}
                <div className="flex flex-col justify-center gap-3 border-t border-foreground-800 p-8 lg:border-l lg:border-t-0 md:p-10">
                  {[
                    {
                      icon: "ri-test-tube-line",
                      title: "Lot-level HPLC + mass-spec",
                      body: "Every batch independently tested for identity and purity before it ships.",
                    },
                    {
                      icon: "ri-qr-code-line",
                      title: "QR-verified COAs",
                      body: "Scan the QR on your vial to open the actual lab certificate — not a vendor-hosted PDF.",
                    },
                    {
                      icon: "ri-shield-check-line",
                      title: "99%+ purity standard",
                      body: "Lots that don't pass spectrometry at intake don't ship. No exceptions.",
                    },
                    {
                      icon: "ri-truck-line",
                      title: "Next-day domestic",
                      body: "Orders placed before cutoff leave same day from a US fulfillment centre.",
                    },
                  ].map((pt) => (
                    <div key={pt.title} className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground-800 text-primary-400">
                        <i className={`${pt.icon} text-base`} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-background-100">{pt.title}</p>
                        <p className="text-xs leading-relaxed text-foreground-500">{pt.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other vendors — ranked list */}
        <section className="border-b border-background-200 px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-[1440px]">
            <div className="reveal mb-6 flex items-end justify-between">
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground-950 md:text-2xl">
                  Other verified vendors
                </h2>
                <p className="mt-1 text-sm text-foreground-500">
                  All VPR-rated 4.6 or above with active COA documentation.
                </p>
              </div>
              <div className="hidden items-center gap-6 text-[11px] font-medium uppercase tracking-wide text-foreground-400 sm:flex">
                <span>Score</span>
                <span className="w-16 text-right">Shop</span>
              </div>
            </div>

            <div className="reveal overflow-hidden rounded-xl border border-background-200 bg-background-50">
              {others.map((v, i) => (
                <VendorRow key={v.slug} v={v} rank={i + 1} />
              ))}
            </div>
          </div>
        </section>

        {/* Full directory CTA */}
        <section className="border-b border-background-200 bg-background-100 px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-[1440px]">
            <div className="reveal flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-lg">
                <h2 className="font-heading text-xl font-semibold text-foreground-950 md:text-2xl">
                  229 more vendors in the full VPR directory
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground-500">
                  Filter by trust score, COA transparency, geography and compound availability.
                </p>
              </div>
              <a
                href={`${VPR}/vendors`}
                target="_blank"
                rel="noopener"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-foreground-950 px-6 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-foreground-800"
              >
                Open VPR Directory <i className="ri-arrow-right-up-line" />
              </a>
            </div>
          </div>
        </section>

        {/* Disclosure */}
        <section className="px-4 py-8 md:px-8">
          <div className="mx-auto max-w-[1440px]">
            <p className="text-xs leading-relaxed text-foreground-400">
              <strong className="text-foreground-600">Disclosure.</strong> EVLV Peptides is a paid sponsor of PeptideRatio.
              Sponsored placement is labelled accordingly. Vendor scores and COA statuses are sourced from Verified Peptide Reviews and are editorially independent.
              PeptideRatio earns no commission on purchases through non-EVLV links.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
