import { useMemo } from "react";
import { useReveal } from "@/hooks/useReveal";
import { useHashScroll } from "@/hooks/useHashScroll";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useJsonLd } from "@/hooks/useJsonLd";
import { faqs } from "@/mocks/faqs";
import AgeGate from "@/components/feature/AgeGate";
import SiteHeader from "@/components/feature/SiteHeader";
import SiteFooter from "@/components/feature/SiteFooter";
import Hero from "@/pages/home/components/Hero";
import BrowseByType from "@/pages/home/components/BrowseByType";
import Methodology from "@/pages/home/components/Methodology";
import PeptideIndex from "@/pages/home/components/PeptideIndex";
import FaqSection from "@/pages/home/components/FaqSection";
import GuidesSection from "@/pages/home/components/GuidesSection";
import AppHome from "@/pages/home/AppHome";
import { isStandalone } from "@/lib/standalone";

const SITE = "https://peptidedosingcalculator.co";

export default function Home() {
  useReveal();
  useHashScroll();

  usePageMeta({
    title: "Peptide Dosing Calculator — Reconstitution & Draw-Line Guide | VialCalc",
    description:
      "Work out exactly what to draw. 72 peptides with researched dose ranges, reconstitution maths and the studies behind every number. Free, no sign-up.",
    canonical: `${SITE}/`,
  });

  const websiteSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VialCalc",
    url: SITE,
    description: "Peptide dosing calculator and reconstitution guide for research use. 72 compounds with sourced dose ranges.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE}/#peptides`,
      "query-input": "required",
    },
  }), []);

  const faqSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }), []);

  useJsonLd(websiteSchema, "jsonld-website");
  useJsonLd(faqSchema,    "jsonld-faq");

  if (isStandalone()) return <AppHome />;

  return (
    <div className="min-h-screen bg-background-50">
      <AgeGate />
      <SiteHeader />
      <main>
        <Hero />
        <BrowseByType />
        <Methodology />
        <PeptideIndex />
        <FaqSection />
        <GuidesSection />
      </main>
      <SiteFooter />
    </div>
  );
}