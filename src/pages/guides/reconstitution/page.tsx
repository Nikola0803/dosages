import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useReveal } from "@/hooks/useReveal";
import { useHashScroll } from "@/hooks/useHashScroll";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useJsonLd } from "@/hooks/useJsonLd";
import AgeGate from "@/components/feature/AgeGate";
import SiteHeader from "@/components/feature/SiteHeader";
import SiteFooter from "@/components/feature/SiteFooter";
import EvlvCta from "@/components/feature/EvlvCta";

const SITE = "https://peptideratio.com";

const STEPS = [
  {
    name: "Gather your supplies",
    text: "You need four things before you start: the lyophilised peptide vial, bacteriostatic water for injection (BAC water), U-100 insulin syringes (29–31G, 1 mL), and 70% isopropyl alcohol prep pads. Some people keep a second larger-gauge drawing needle to pull BAC water, which spares the fine insulin tip — optional, but it extends syringe life.",
  },
  {
    name: "Sanitise your workspace",
    text: "Work on a clean, hard, non-porous surface. Wash your hands. Wipe the rubber stopper of both the peptide vial and the BAC water vial with a fresh alcohol pad. Let both stoppers air-dry for 30 seconds before inserting any needle — rubbing alcohol kills surface organisms, but rushing through the drying step defeats the purpose.",
  },
  {
    name: "Decide on your water volume",
    text: "Your target concentration determines how much BAC water to add. A common starting point is 2 mL per 5 mg vial, giving 2,500 mcg/mL. Smaller volumes produce higher concentrations — useful for high-dose compounds — but require precise syringe reading. Use the PeptideRatio calculator to confirm the volume for your specific vial size and dose before picking up a needle.",
  },
  {
    name: "Draw the bacteriostatic water",
    text: "Insert the syringe needle through the rubber stopper of the BAC water vial. Invert the vial so the stopper faces down and draw your chosen volume. On a U-100 syringe, 1.0 mL sits at the 100-unit line. Check for air bubbles, tap the barrel, and expel them back before withdrawing.",
  },
  {
    name: "Inject water into the peptide vial — slowly",
    text: "This is the step most people get wrong. Do not plunge the water directly onto the lyophilised cake. Angle the needle tip against the inner glass wall of the peptide vial, then depress the plunger slowly over 10–20 seconds. Water runs down the glass and wets the powder gently from the sides. Injecting fast — or directly onto the cake — causes foaming and can partially denature the peptide.",
  },
  {
    name: "Swirl gently — never shake",
    text: "Cap the vial and rotate it slowly between your fingertips. The lyophilised powder should dissolve within 30–90 seconds into a clear or very slightly hazy solution. Some longer-chain peptides (CJC-1295 DAC, GHK-Cu) take longer; a faint cloudiness is normal. A milky, particulate, or strongly coloured solution is not — discard and start over.",
  },
  {
    name: "Confirm your concentration",
    text: "Calculate: mcg/mL = (vial mg × 1,000) ÷ water mL. A 5 mg vial in 2 mL gives 2,500 mcg/mL. Write this on a piece of tape stuck to the vial — you will need it every time you draw a dose. Label the vial with the peptide name, concentration, mix date, and expiry date.",
  },
  {
    name: "Refrigerate immediately",
    text: "Place the reconstituted vial in the fridge at 2–8°C (36–46°F). Do not leave it at room temperature for more than 30 minutes, and never freeze a reconstituted vial — ice crystals shear peptide bonds. Refrigerated with BAC water, most peptides remain stable for 4–12 weeks.",
  },
];

const STORAGE_CARDS = [
  { icon: "ri-temp-cold-line", title: "Refrigerate at 2–8°C", body: "Fridge shelf, not the door — doors fluctuate. Most peptides stable 4–12 weeks once mixed." },
  { icon: "ri-close-circle-line", title: "Never freeze a mixed vial", body: "Ice crystals form and break peptide bonds. Lyophilised unmixed vials can be frozen; reconstituted ones cannot." },
  { icon: "ri-sun-line", title: "Protect from light", body: "UV degrades peptide bonds over time. Keep vials in their original box or wrap in foil." },
  { icon: "ri-calendar-check-line", title: "Label with date and expiry", body: "Write mix date and a 30–90 day expiry. BAC water gives the longer end of that range." },
  { icon: "ri-alert-line", title: "Inspect before every use", body: "Hold the vial to light. Cloudiness, particles, or unusual colour are reasons to discard." },
  { icon: "ri-information-line", title: "BAC water vs plain sterile water", body: "0.9% benzyl alcohol in BAC water suppresses microbial growth. Plain sterile water gives only 24–72 hours of stability after mixing." },
];

const FAQS = [
  {
    q: "Can I use sterile water for injection instead of bacteriostatic water?",
    a: "You can, but the reconstituted vial must be used within 24–72 hours. Bacteriostatic water contains 0.9% benzyl alcohol, which prevents microbial growth and extends stability to 4–12 weeks refrigerated. For any protocol lasting more than a few days, BAC water is the correct choice.",
  },
  {
    q: "My solution is slightly cloudy after mixing. Is it ruined?",
    a: "A very faint haze is acceptable for some longer-chain peptides and usually resolves once the vial warms to room temperature. Distinct cloudiness, visible particles, or any colour beyond clear-to-pale-yellow mean the vial should be discarded.",
  },
  {
    q: "How do I measure 0.5 mL on a U-100 syringe?",
    a: "A 1 mL U-100 syringe is marked 0–100 in units. Because 1 mL = 100 units, 0.5 mL is the 50-unit mark, 0.25 mL is the 25-unit mark, and so on. The PeptideRatio calculator converts your target dose directly into the unit line to draw to.",
  },
  {
    q: "Can I draw multiple doses in advance and store them in syringes?",
    a: "It is better to draw each dose immediately before use. Pre-loading syringes and refrigerating them is technically possible for up to 24 hours but introduces contamination risk every time you pierce the stopper.",
  },
  {
    q: "What if I accidentally shook the vial?",
    a: "A few brief swirls are unlikely to cause harm. Vigorous sustained shaking creates foam and mechanical shear that can partially denature a peptide. If you see prolonged foaming or a milky appearance that does not clear after 10 minutes at room temperature, discard.",
  },
];

const POPULAR_PEPTIDES = [
  { name: "BPC-157", slug: "bpc-157" },
  { name: "TB-500", slug: "tb-500" },
  { name: "Semaglutide", slug: "semaglutide" },
  { name: "Tirzepatide", slug: "tirzepatide" },
  { name: "Ipamorelin", slug: "ipamorelin" },
  { name: "CJC-1295 (no DAC)", slug: "cjc-1295-no-dac" },
  { name: "Sermorelin", slug: "sermorelin" },
  { name: "Epitalon", slug: "epitalon" },
];

export default function ReconstitutionGuide() {
  useReveal();
  useHashScroll();

  usePageMeta({
    title: "How to Reconstitute Peptides — Step-by-Step Guide | PeptideRatio",
    description:
      "Complete guide to reconstituting lyophilised peptides: bacteriostatic water volumes, mixing technique without denaturing, concentration formula and storage. Research reference.",
    canonical: `${SITE}/guides/reconstitution`,
  });

  const howToSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to Reconstitute a Lyophilised Peptide",
      description:
        "Eight-step guide to safely mixing a lyophilised research peptide with bacteriostatic water, calculating the resulting concentration and storing the vial correctly.",
      totalTime: "PT10M",
      tool: [
        { "@type": "HowToTool", name: "U-100 insulin syringes (29–31G, 1 mL)" },
        { "@type": "HowToTool", name: "Bacteriostatic water for injection" },
        { "@type": "HowToTool", name: "70% isopropyl alcohol prep pads" },
      ],
      step: STEPS.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
        url: `${SITE}/guides/reconstitution#step-${i + 1}`,
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
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE}/#guides` },
        {
          "@type": "ListItem",
          position: 3,
          name: "How to Reconstitute Peptides",
          item: `${SITE}/guides/reconstitution`,
        },
      ],
    }),
    []
  );

  useJsonLd(howToSchema, "jsonld-howto");
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
            <Link to="/#guides" className="hover:text-foreground-800">Guides</Link>
            <span>/</span>
            <span className="font-medium text-foreground-800">How to Reconstitute Peptides</span>
          </div>
        </div>

        {/* Hero */}
        <section className="border-b border-background-200 bg-background-100 px-4 pb-12 pt-10 md:px-8 md:pb-16 md:pt-14">
          <div className="mx-auto max-w-[1440px]">
            <span className="inline-flex items-center rounded-full bg-accent-100 px-2.5 py-1 font-label text-[10px] uppercase tracking-wide text-accent-900">
              Step-by-step guide
            </span>
            <h1 className="mt-4 max-w-3xl font-heading text-3xl font-semibold tracking-tight text-foreground-950 md:text-5xl">
              How to Reconstitute Peptides
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground-600 md:text-lg">
              Reconstitution dissolves a lyophilised (freeze-dried) peptide in bacteriostatic water
              to produce an injectable solution. Done correctly, the process takes under ten minutes
              and results in a stable, properly concentrated vial.
            </p>
            <div className="mt-6 flex flex-wrap gap-6">
              {[
                { icon: "ri-time-line", text: "~10 minutes" },
                { icon: "ri-tools-line", text: "3 items required" },
                { icon: "ri-flask-line", text: "Research use only" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-2 text-sm text-foreground-500">
                  <i className={`${b.icon} text-primary-500`} />
                  {b.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What you need */}
        <section className="border-b border-background-200 px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-[1440px]">
            <div className="reveal max-w-2xl">
              <h2 className="font-heading text-xl font-semibold text-foreground-950 md:text-2xl">
                What you need
              </h2>
              <p className="mt-2 text-sm text-foreground-500">
                Have all four items ready before you start.
              </p>
            </div>
            <div className="reveal mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: "ri-syringe-line",
                  name: "U-100 insulin syringes",
                  spec: "29–31G, 1 mL barrel",
                  note: "One per injection. Fine gauge means minimal trauma and precise reading.",
                },
                {
                  icon: "ri-drop-line",
                  name: "Bacteriostatic water",
                  spec: "BAC water for injection",
                  note: "0.9% benzyl alcohol extends reconstituted vial life to 4–12 weeks refrigerated.",
                },
                {
                  icon: "ri-first-aid-kit-line",
                  name: "Alcohol prep pads",
                  spec: "70% isopropyl",
                  note: "Wipe every vial stopper before inserting a needle, then let air-dry 30 seconds.",
                },
                {
                  icon: "ri-medicine-bottle-line",
                  name: "Peptide vial",
                  spec: "Lyophilised / freeze-dried",
                  note: "Inspect for visible damage or discoloration before mixing.",
                },
              ].map((item) => (
                <div
                  key={item.name}
                  className="rounded-lg border border-background-200 bg-background-50 p-5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                    <i className={`${item.icon} text-xl`} />
                  </span>
                  <h3 className="mt-4 font-heading text-sm font-semibold text-foreground-950">
                    {item.name}
                  </h3>
                  <p className="text-xs font-medium text-primary-700">{item.spec}</p>
                  <p className="mt-2 text-xs leading-relaxed text-foreground-500">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="border-b border-background-200 px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-[1440px]">
            <h2 className="reveal font-heading text-xl font-semibold text-foreground-950 md:text-2xl">
              Step-by-step instructions
            </h2>
            <ol className="mt-8 space-y-5">
              {STEPS.map((step, i) => (
                <li
                  key={step.name}
                  id={`step-${i + 1}`}
                  className="reveal flex gap-5 rounded-lg border border-background-200 bg-background-50 p-5 md:p-6"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 font-label text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-semibold text-foreground-950">
                      {step.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground-600">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Concentration formula */}
        <section className="border-b border-background-200 bg-background-100 px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-[1440px]">
            <div className="reveal grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground-950 md:text-2xl">
                  Calculating your concentration
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground-600">
                  Once you know how much water you added, one formula gives you the concentration
                  and everything that follows from it.
                </p>
                <div className="mt-6 rounded-lg border border-primary-200 bg-primary-50 px-6 py-5">
                  <p className="font-label text-[11px] uppercase tracking-wide text-primary-600">
                    Formula
                  </p>
                  <p className="mt-2 font-mono text-base font-semibold text-foreground-900">
                    mcg/mL = (vial mg × 1,000) ÷ water mL
                  </p>
                </div>
                <div className="mt-5 space-y-2.5">
                  {[
                    { label: "5 mg vial + 1 mL water", result: "5,000 mcg/mL" },
                    { label: "5 mg vial + 2 mL water", result: "2,500 mcg/mL" },
                    { label: "10 mg vial + 2 mL water", result: "5,000 mcg/mL" },
                    { label: "2 mg vial + 1 mL water", result: "2,000 mcg/mL" },
                  ].map((ex) => (
                    <div
                      key={ex.label}
                      className="flex items-center justify-between rounded border border-background-200 bg-background-50 px-4 py-2.5 text-sm"
                    >
                      <span className="text-foreground-600">{ex.label}</span>
                      <span className="font-semibold text-foreground-900">{ex.result}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center rounded-xl border border-primary-200 bg-primary-50 p-6 md:p-8">
                <i className="ri-calculator-line text-3xl text-primary-500" />
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground-950">
                  Skip the maths — use the calculator
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-600">
                  Enter your vial size, water volume, and target dose. PeptideRatio shows your
                  exact syringe draw line, mL volume, and U-100 units in seconds.
                </p>
                <Link
                  to="/start"
                  className="mt-5 inline-flex w-fit items-center gap-2 rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  Open Reconstitution Calculator <i className="ri-arrow-right-line" />
                </Link>
                <Link
                  to="/reference/concentration-chart"
                  className="mt-3 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800"
                >
                  View full concentration reference chart <i className="ri-arrow-right-line" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Storage */}
        <section className="border-b border-background-200 px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-[1440px]">
            <h2 className="reveal font-heading text-xl font-semibold text-foreground-950 md:text-2xl">
              Storage after reconstitution
            </h2>
            <div className="reveal mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {STORAGE_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="rounded-lg border border-background-200 bg-background-50 p-5"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-100 text-secondary-800">
                    <i className={`${card.icon} text-lg`} />
                  </span>
                  <h3 className="mt-3 font-heading text-sm font-semibold text-foreground-950">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground-600">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-background-200 bg-background-100 px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-[1440px]">
            <h2 className="reveal font-heading text-xl font-semibold text-foreground-950 md:text-2xl">
              Common questions
            </h2>
            <dl className="reveal mt-6 max-w-3xl space-y-4">
              {FAQS.map((item) => (
                <div
                  key={item.q}
                  className="rounded-lg border border-background-200 bg-background-50 p-5"
                >
                  <dt className="font-heading text-sm font-semibold text-foreground-950">
                    {item.q}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-foreground-600">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Related peptides */}
        <section className="border-b border-background-200 px-4 py-10 md:px-8 md:py-12">
          <div className="mx-auto max-w-[1440px]">
            <h2 className="reveal font-heading text-lg font-semibold text-foreground-950">
              Most commonly reconstituted
            </h2>
            <div className="reveal mt-4 flex flex-wrap gap-3">
              {POPULAR_PEPTIDES.map((p) => (
                <Link
                  key={p.slug}
                  to={`/peptide/${p.slug}`}
                  className="rounded-full border border-background-200 bg-background-100 px-4 py-2 text-sm font-medium text-foreground-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <EvlvCta />
      </main>

      <SiteFooter />
    </div>
  );
}
