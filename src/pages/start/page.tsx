import AgeGate from "@/components/feature/AgeGate";
import SiteHeader from "@/components/feature/SiteHeader";
import SiteFooter from "@/components/feature/SiteFooter";
import StartHereWizard from "@/pages/home/components/StartHereWizard";
import AppShell from "@/components/feature/AppShell";
import { useReveal } from "@/hooks/useReveal";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useJsonLd } from "@/hooks/useJsonLd";
import { isStandalone } from "@/lib/standalone";

const SITE = "https://peptidedosingcalculator.co";

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Reconstitute a Peptide Vial",
  description:
    "Step-by-step guide to reconstituting a research peptide vial with bacteriostatic water and calculating the exact draw line on your syringe.",
  totalTime: "PT5M",
  step: [
    { "@type": "HowToStep", position: 1, name: "Choose your compound", text: "Select the peptide name printed on your vial label." },
    { "@type": "HowToStep", position: 2, name: "Enter your vial size", text: "Enter the milligram weight on the label (e.g. 5 mg)." },
    { "@type": "HowToStep", position: 3, name: "Add bacteriostatic water", text: "Inject the recommended water volume slowly down the inside wall of the vial." },
    { "@type": "HowToStep", position: 4, name: "Read your draw line", text: "Draw the displayed number of syringe units for your target dose." },
  ],
  tool: [
    { "@type": "HowToTool", name: "U-100 insulin syringe (1 mL)" },
    { "@type": "HowToTool", name: "Bacteriostatic water vial" },
    { "@type": "HowToTool", name: "Alcohol swab" },
  ],
} as Record<string, unknown>;

export default function StartPage() {
  useReveal();

  usePageMeta({
    title: "Peptide Reconstitution Calculator — Step-by-Step Wizard | VialCalc",
    description:
      "Three questions. We calculate the exact water volume and syringe draw line for any peptide vial. Free, instant, no sign-up required.",
    canonical: `${SITE}/start`,
  });

  useJsonLd(howToSchema, "jsonld-howto");

  if (isStandalone()) {
    return (
      <AppShell title="Calculator">
        <div className="pt-4">
          <StartHereWizard />
        </div>
      </AppShell>
    );
  }

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
              which line to draw to on the syringe. No arithmetic on your side.
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
