import { useReveal } from "@/hooks/useReveal";
import { useHashScroll } from "@/hooks/useHashScroll";
import AgeGate from "@/components/feature/AgeGate";
import SiteHeader from "@/components/feature/SiteHeader";
import SiteFooter from "@/components/feature/SiteFooter";
import VprBanner from "@/components/feature/VprBanner";
import Hero from "@/pages/home/components/Hero";
import BrowseByType from "@/pages/home/components/BrowseByType";
import Methodology from "@/pages/home/components/Methodology";
import PeptideIndex from "@/pages/home/components/PeptideIndex";
import FaqSection from "@/pages/home/components/FaqSection";
import GuidesSection from "@/pages/home/components/GuidesSection";
import RecommendedSources from "@/pages/home/components/RecommendedSources";

export default function Home() {
  useReveal();
  useHashScroll();

  return (
    <div className="min-h-screen bg-background-50">
      <AgeGate />
      <SiteHeader />
      <main>
        <Hero />
        <VprBanner />
        <BrowseByType />
        <Methodology />
        <PeptideIndex />
        <FaqSection />
        <GuidesSection />
        <RecommendedSources />
      </main>
      <SiteFooter />
    </div>
  );
}