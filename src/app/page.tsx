import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/pages/landing/HeroSection";
import { FeaturesSection } from "@/components/pages/landing/FeaturesSection";
import { ComparisonSection } from "@/components/pages/landing/ComparisonSection";
import { PricingSection } from "@/components/pages/landing/PricingSection";
import { TestimonialsSection } from "@/components/pages/landing/TestimonialsSection";
import { FinalCTASection } from "@/components/pages/landing/FinalCTASection";

export default function Home() {
  return (
    <>
      <main className="min-h-screen">
        <HeroSection />
        <FeaturesSection />
        <ComparisonSection />
        <PricingSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
    </>
  );
}
