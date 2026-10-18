import { useEffect, useState } from "react";

const STORAGE_KEY = "od_age_confirmed";

export default function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "1") {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const confirm = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-scaleIn rounded-lg border border-background-200 bg-background-50 p-6 md:p-8">
        <h2 className="font-heading text-xl font-semibold text-foreground-950 md:text-2xl">
          Research Use Only — Confirm to Continue
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-foreground-700">
          OptimalDosages.com publishes reference material for laboratory and educational use.
          Nothing here is medical advice, a prescription, or a recommendation for human
          administration.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-foreground-700">
          By continuing you confirm you are 21 or older and that you are accessing this material in
          a research or educational capacity.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={confirm}
            className="w-full whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            I Understand — Enter
          </button>
          <a
            href="https://www.google.com"
            className="w-full whitespace-nowrap rounded-md border border-background-300 px-5 py-3 text-center text-sm font-semibold text-foreground-700 transition-colors hover:bg-background-100"
          >
            Leave Site
          </a>
        </div>
      </div>
    </div>
  );
}