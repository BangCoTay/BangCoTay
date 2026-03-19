import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { PainSolutionSection } from '@/components/landing/PainSolutionSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ProductPreviewSection } from '@/components/landing/ProductPreviewSection';
import { AICoachSection } from '@/components/landing/AICoachSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { FinalCTASection, Footer } from '@/components/landing/FooterSection';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      <HeroSection />
      <SocialProofSection />
      <PainSolutionSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ProductPreviewSection />
      <AICoachSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
