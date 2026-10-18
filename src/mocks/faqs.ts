export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: "How do I reconstitute a peptide?",
    answer:
      "Let the vial come up to room temperature first, then wipe the stopper with an alcohol pad. Draw your bacteriostatic water and aim the needle at the inside wall of the vial so the liquid slides down instead of blasting straight into the powder. The vacuum will help pull it in. Once it's added, swirl gently or simply set the vial down and let it dissolve. Don't shake it — the agitation can damage the peptide chain. Wait until the solution is completely clear before using it.",
  },
  {
    question: "How much bacteriostatic water should I add?",
    answer:
      "You choose, and it's really the only lever you have over how precisely you can measure. More water means a weaker solution and a larger, easier-to-read draw. Put a 5 mg vial into 1 mL and a 250 mcg dose works out to 5 units, where being half a unit off is a 10% mistake. Put the same vial into 2.5 mL and that dose becomes 12.5 units, so the same slip hardly matters. The aim is to have your usual dose land in the middle of the barrel.",
  },
  {
    question: "What does a unit mean on an insulin syringe?",
    answer:
      "A unit measures volume, not the amount of peptide. On a standard U-100 syringe, one unit is 0.01 mL. Ten units from a weak mix and ten from a strong one stop at the identical line, yet one holds several times more peptide than the other. That's exactly why any calculator has to know how much you put into the vial before it can tell you what to draw.",
  },
  {
    question: "How do I work out how many doses are in a vial?",
    answer:
      "Take the total peptide in the vial and divide it by your dose. A 5 mg vial at 250 mcg per dose gives 20 doses — 5 mg is 5000 mcg, and 5000 divided by 250 is 20. How much water you added doesn't change the dose count at all; it only changes how much liquid each dose is.",
  },
  {
    question: "How long does a peptide last after mixing?",
    answer:
      "A sealed lyophilised powder kept at −20 °C generally holds up for a year or more. Once it's reconstituted with bacteriostatic water and sitting in the fridge at 2–8 °C, most compounds are treated as usable for roughly two to four weeks, though that varies by peptide. Sterile water with no preservative is much shorter — usually a single session. Never freeze a reconstituted vial.",
  },
  {
    question: "What is the difference between mg, mcg and IU?",
    answer:
      "One milligram is 1000 micrograms. An international unit is something else again — it expresses biological activity rather than mass, and converting it to milligrams depends entirely on the compound, so there's no single factor that works for all of them. Syringe units are a separate idea altogether: pure volume, at 0.01 mL each.",
  },
];