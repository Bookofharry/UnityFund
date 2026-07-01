import { useEffect } from 'react';
import { Navigation } from '../sections/Navigation';
import { HeroSection } from '../sections/HeroSection';
import { TrustedBySection } from '../sections/TrustedBySection';
import { ProblemSection } from '../sections/ProblemSection';
import { FeaturesMarquee } from '../sections/FeaturesMarquee';
import { SolutionSection } from '../sections/SolutionSection';
import { FeaturesSection } from '../sections/FeaturesSection';
import { HowItWorksSection } from '../sections/HowItWorksSection';
import { FundTypesSection } from '../sections/FundTypesSection';
import { SecuritySection } from '../sections/SecuritySection';
import { TestimonialsSection } from '../sections/TestimonialsSection';
import { PricingSection } from '../sections/PricingSection';
import { FAQSection } from '../sections/FAQSection';
import { FinalCTASection } from '../sections/FinalCTASection';
import { Footer } from '../sections/Footer';

export function LandingPage() {
  useEffect(() => {
    document.documentElement.classList.add('scrollbar-hide');
    return () => document.documentElement.classList.remove('scrollbar-hide');
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy-800 focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Navigation includes the announcement bar — both in one fixed header */}
      <Navigation />

      <main id="main-content">
        <HeroSection />
        <TrustedBySection />
        <ProblemSection />
        <FeaturesMarquee />
        <SolutionSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FundTypesSection />
        <SecuritySection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
      </main>

      <Footer />
    </>
  );
}
