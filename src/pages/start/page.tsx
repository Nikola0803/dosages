import AgeGate from "@/components/feature/AgeGate";
import SiteHeader from "@/components/feature/SiteHeader";
import SiteFooter from "@/components/feature/SiteFooter";
import StartHereWizard from "@/pages/home/components/StartHereWizard";
import { useReveal } from "@/hooks/useReveal";

export default function StartPage() {
  useReveal();

  return (
    <div className="min-h-screen bg-background-50">
      <AgeGate />
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="border-b border-background-200 bg-background-100 px-4 pb-10 pt-16 md:px-8 md:pb-14 md:pt-20">
          <div className="mx-auto max-w-2xl">
            <span className="inline-block font-label text-[11px] uppercase tracking-widest text-primary-600">
              Start Here
            </span>
            <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight tracking-tight text-foreground-950 md:text-4xl">
              Let's work it out together.
            </h1>
            <p className="mt-3 text-base leading-relaxed text-foreground-600">
              Three questions. We'll tell you exactly how much water to add to your vial and
              which line to draw to on the syringe — no arithmetic on your side.
            </p>
          </div>
        </section>

        {/* Wizard */}
        <section className="px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-2xl">
            <p className="mb-5 font-label text-[11px] uppercase tracking-widest text-foreground-500">
              Three questions, then your numbers
            </p>
            <StartHereWizard />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
