import { Link } from "react-router-dom";
import { vprName, vprUrl } from "@/mocks/vpr";

export default function VprBanner() {
  return (
    <section className="bg-foreground-950">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
        <div className="flex flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between md:py-7">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-accent-950">
              <i className="ri-shield-star-line text-xl"></i>
            </span>
            <div className="min-w-0">
              <span className="font-label text-[10px] uppercase tracking-wider text-accent-400">
                Spotlight — {vprName}
              </span>
              <h2 className="mt-1 font-heading text-lg font-semibold text-background-50 md:text-xl">
                Check suppliers on VPR
              </h2>
              <p className="mt-1 text-sm text-background-50/70">
                Directory, third-party lab reports and community feedback — all in one independent
                place.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <a
              href={vprUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent-500 px-5 py-3 text-sm font-semibold text-accent-950 transition-colors hover:bg-accent-600"
            >
              Open VPR <i className="ri-arrow-right-up-line"></i>
            </a>
            <Link
              to="/vpr-spotlight"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-50/25 px-5 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-background-50/10"
            >
              Why VPR? <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}