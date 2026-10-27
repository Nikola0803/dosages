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

function Stars({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-1">
      <i className="ri-star-fill text-accent-400 text-xs" />
      <span className="font-heading text-sm font-semibold text-foreground-900">{score.toFixed(1)}</span>
    </span>
  );
}

function BadgePill({ badge }: { badge: keyof typeof BADGE_META }) {
  const m = BADGE_META[badge];
  return (
    <span title={m.title} className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-800">
      <i className={m.icon} />
      {m.label}
    </span>
  );
}

function VendorCard({ v }: { v: Vendor }) {
  return (
    <div className="flex flex-col rounded-lg border border-background-200 bg-background-50 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-base font-semibold text-foreground-950">{v.name}</h3>
          <span className="text-xs text-foreground-400">{v.country}</span>
        </div>
        <Stars score={v.score} />
      </div>

      <p className="mt-1 text-xs text-foreground-500">
        {v.reviews.toLocaleString()} verified reviews
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {v.badges.map((b) => (
          <BadgePill key={b} badge={b} />
        ))}
      </div>

      <div className="mt-auto flex gap-2 pt-4">
        <a
          href={v.vprUrl}
          target="_blank"
          rel="noopener"
          className="flex-1 rounded-md border border-background-200 px-3 py-2 text-center text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-700"
        >
          Reviews
        </a>
        <a
          href={v.storeUrl}
          target="_blank"
          rel="noopener"
          className="flex-1 rounded-md bg-primary-50 px-3 py-2 text-center text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
        >
          Store <i className="ri-arrow-right-up-line" />
        </a>
      </div>
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
        <section className="border-b border-background-200 bg-background-100 px-4 pb-12 pt-10 md:px-8 md:pb-14 md:pt-14">
          <div className="mx-auto max-w-[1440px]">
            <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1 font-label text-[10px] uppercase tracking-wide text-primary-800">
              <i className="ri-shield-star-line mr-1" /> VPR-Verified
            </span>
            <h1 className="mt-4 max-w-3xl font-heading text-3xl font-semibold tracking-tight text-foreground-950 md:text-5xl">
              Peptide Vendors We Recommend
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground-600 md:text-lg">
              Every listing below is independently audited by{" "}
              <a
                href={VPR}
                target="_blank"
                rel="noopener"
                className="text-primary-700 underline underline-offset-2 hover:text-primary-800"
              >
                Verified Peptide Reviews
              </a>
              . Scores, COA status, and review counts are sourced directly from VPR. EVLV Peptides
              is our featured partner — the vendor whose compounds this calculator is built around.
            </p>
            <div className="mt-5 flex flex-wrap gap-5 text-sm text-foreground-500">
              <span className="flex items-center gap-1.5">
                <i className="ri-user-star-line text-primary-500" /> 229 audited vendors on VPR
              </span>
              <span className="flex items-center gap-1.5">
                <i className="ri-file-text-line text-primary-500" /> 1,240 COAs indexed
              </span>
            </div>
          </div>
        </section>

        {/* Featured: EVLV */}
        <section className="border-b border-background-200 bg-foreground-950 px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-5 flex items-center gap-2">
              <span className="rounded-full bg-accent-500 px-3 py-1 font-label text-[10px] font-semibold uppercase tracking-wider text-accent-950">
                ★ Featured Partner
              </span>
              <span className="text-xs text-foreground-400">Sponsored placement · VPR rankings remain editorially independent</span>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-heading text-2xl font-semibold text-background-50 md:text-3xl">
                    {featured.name}
                  </h2>
                  <span className="flex items-center gap-1 rounded-full border border-accent-500 px-2.5 py-0.5 text-sm font-semibold text-accent-400">
                    <i className="ri-star-fill text-xs" /> {featured.score.toFixed(1)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground-400">
                  {featured.reviews.toLocaleString()} verified reviews · {featured.country}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-foreground-300 md:text-base">
                  {featured.tagline}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {featured.badges.map((b) => (
                    <span
                      key={b}
                      title={BADGE_META[b].title}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary-600 bg-primary-900 px-3 py-1 text-xs font-medium text-primary-200"
                    >
                      <i className={BADGE_META[b].icon} />
                      {BADGE_META[b].label}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={EVLV_UTM}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 rounded-md bg-primary-400 px-6 py-3 text-sm font-semibold text-primary-950 transition-colors hover:bg-primary-300"
                  >
                    Shop EVLV Peptides <i className="ri-arrow-right-up-line" />
                  </a>
                  <a
                    href={featured.vprUrl}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 rounded-md border border-foreground-700 px-6 py-3 text-sm font-semibold text-foreground-100 transition-colors hover:bg-foreground-800"
                  >
                    Read reviews on VPR <i className="ri-external-link-line" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { icon: "ri-test-tube-line", title: "Lot-level HPLC testing", body: "Every batch independently tested for identity and purity before it ships." },
                  { icon: "ri-qr-code-line", title: "QR-verified COAs", body: "Scan the QR on your vial to open the lab report — not a vendor-hosted PDF, the actual certificate." },
                  { icon: "ri-shield-check-line", title: "99%+ purity standard", body: "Rejections run at intake. If a lot doesn't meet spec, it doesn't ship." },
                  { icon: "ri-truck-line", title: "Next-day domestic shipping", body: "Orders placed before cutoff leave the same day from a US fulfillment centre." },
                ].map((point) => (
                  <div key={point.title} className="flex gap-4 rounded-lg border border-foreground-800 bg-foreground-900 p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-900 text-primary-300">
                      <i className={`${point.icon} text-lg`} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-background-50">{point.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-foreground-400">{point.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Other verified vendors */}
        <section className="border-b border-background-200 px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-[1440px]">
            <div className="reveal max-w-2xl">
              <h2 className="font-heading text-xl font-semibold text-foreground-950 md:text-2xl">
                Other VPR-verified vendors
              </h2>
              <p className="mt-2 text-sm text-foreground-500">
                All listings below carry a score of 4.6 or higher on Verified Peptide Reviews and
                hold active COA documentation. Sorted by review count.
              </p>
            </div>

            <div className="reveal mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {others.map((v) => (
                <VendorCard key={v.slug} v={v} />
              ))}
            </div>
          </div>
        </section>

        {/* Full directory CTA */}
        <section className="border-b border-background-200 bg-background-100 px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-[1440px]">
            <div className="reveal flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h2 className="font-heading text-xl font-semibold text-foreground-950 md:text-2xl">
                  229 more vendors in the full VPR directory
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground-600">
                  Filter by trust score, COA transparency, geography and compound availability.
                  Run a side-by-side vendor comparison.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <a
                  href={`${VPR}/vendors`}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  Open VPR Directory <i className="ri-arrow-right-up-line" />
                </a>
                <Link
                  to="/vpr-spotlight"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-background-200 px-5 py-2.5 text-sm font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-700"
                >
                  How VPR vetting works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Disclosure */}
        <section className="px-4 py-8 md:px-8">
          <div className="mx-auto max-w-[1440px]">
            <div className="reveal rounded-lg border border-background-200 bg-background-100 px-5 py-4 text-xs leading-relaxed text-foreground-500">
              <strong className="text-foreground-700">Disclosure.</strong> EVLV Peptides is a
              paid sponsor of PeptideRatio. The sponsored placement on this page is labelled
              accordingly. Vendor scores, review counts and COA statuses are sourced from Verified
              Peptide Reviews and are editorially independent — PeptideRatio does not control or
              influence VPR ratings. Other vendor listings on this page are informational and are
              not affiliate arrangements. PeptideRatio earns no commission on purchases made
              through non-EVLV links.
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
