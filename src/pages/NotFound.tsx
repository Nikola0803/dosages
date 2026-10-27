import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-50 px-4 text-center">
      <span className="font-label text-[11px] uppercase tracking-widest text-foreground-400">
        404 — Page not found
      </span>
      <h1 className="mt-4 font-heading text-3xl font-semibold text-foreground-950 md:text-4xl">
        Nothing here.
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-foreground-500">
        <code className="rounded bg-background-200 px-1.5 py-0.5 font-mono text-xs text-foreground-700">
          {location.pathname}
        </code>{" "}
        doesn't exist on this site.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          className="rounded-md bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Back to home
        </Link>
        <Link
          to="/start"
          className="rounded-md border border-background-200 px-6 py-2.5 text-sm font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-700"
        >
          Open calculator
        </Link>
      </div>
    </div>
  );
}
