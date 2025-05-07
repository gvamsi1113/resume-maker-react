import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ManualTailoringNightmareSection from '@/components/landing/ManualTailoringNightmareSection';
import PressureSection from '@/components/landing/PressureSection';
import PricingSection from "@/components/landing/PricingSection";
import CompaniesSection from '@/components/landing/CompaniesSection';
import FaqSection from "@/components/landing/FaqSection";
import FinalCtaSection from '@/components/landing/FinalCtaSection';

// Placeholder Icon Component (Replace with actual icons e.g., from react-icons or SVGs)
const IconPlaceholder = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" // Example clock icon
    ></path>
  </svg>
);

// FAQ Item Component (Basic structure, no interactivity yet)
const FaqItem = ({ question, answer }: { question: string; answer: string }) => (
  <div className="border-b border-border-muted py-6">
    <h4 className="font-semibold text-lg text-primary">{question}</h4>
    <p className="mt-2 text-foreground-muted">{answer}</p>
  </div>
);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-1 pt-10 md:pt-16 lg:pt-20">
        <HeroSection />
        <FeaturesSection />
        <ManualTailoringNightmareSection />
        <HowItWorksSection />
        <PressureSection />
        <PricingSection />
        <CompaniesSection />
        <FaqSection />
        <FinalCtaSection />
      </main>

      <Footer />
    </div>
  );
}
