'use client';

import React from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText, SmallText } from '@/components/ui/Typography';
import { twMerge } from 'tailwind-merge';
import { Upload } from 'lucide-react';
import Image from 'next/image';

/**
 * Array of top tech company domains for logo URLs
 */
const TOP_TECH_COMPANIES = [
  "google.com", "meta.com", "apple.com", "amazon.com", "microsoft.com",
  "openai.com", "nvidia.com", "tesla.com", "netflix.com", "adobe.com",
  "salesforce.com", "stripe.com", "airbnb.com", "palantir.com", "shopify.com",
  "linkedin.com", "atlassian.com", "bloomberg.com", "reddit.com", "databricks.com"
];

/**
 * LogoCarousel component for displaying a continuously scrolling strip of company logos
 * Uses CSS animation for smooth infinite scrolling
 * @param className - Additional CSS classes
 */
const LogoCarousel: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={twMerge("relative w-full flex items-center overflow-hidden logo-carousel-mask-effect", className)}>
      <div className="logo-carousel-track flex items-center">
        {[...TOP_TECH_COMPANIES, ...TOP_TECH_COMPANIES].map((domain, i) => (
          <img
            key={`${domain}-${i}`}
            src={`https://cdn.brandfetch.io/${domain}/h/200/theme/light/logo?c=1idz5n0_xXcEY0Cd2Zp`}
            alt={domain.split('.')[0]}
            className="h-8 max-w-23 object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all mr-25"
          />
        ))}
      </div>

    </div>
  );
};

const HeaderNav: React.FC = () => (
  <BentoBox className="flex flex-row justify-between items-center w-full p-0 pl-[3rem]">
    <div className="flex items-center gap-[1.5rem]">
      <Image
        src="/logo.png"
        alt="Rezoome Logo"
        width={40}
        height={40}
        className="h-[2.5rem] w-auto"
        priority
      />
      <span className="text-xl font-bold">Rezoome</span>
    </div>
    <nav className="flex items-center gap-[3rem] p-[.5rem] h-full">
      <a href="#" className="hover:text-[var(--color-white)] text-sm text-[var(--color-gray-light)]">Pricing</a>
      <a href="#" className="hover:text-[var(--color-white)] text-sm text-[var(--color-gray-light)]">Sign In</a>
      <button className="h-full w-[20rem] bg-gradient-to-b from-[var(--color-white)] to-[var(--color-gray-medium-light)] text-[var(--color-black)] font-semibold rounded-[1rem] transition-all duration-300 hover:from-[var(--color-white)] hover:to-[var(--color-gray-placeholder)] hover:shadow-md">
        <LargeText fontSizeClass="text-[1.4rem]" colorClass="text-[var(--color-black)]">Download Extension</LargeText>
      </button>
    </nav>
  </BentoBox>
);

const HeadlineStatsBox: React.FC = () => (
  <BentoBox className='gap-[.6rem]'>
    <SmallText>Tailor your resume to JD in just</SmallText>
    <LargeText>9.2 secs</LargeText>
    <SmallText>Be the applicant #1 not #151</SmallText>
  </BentoBox>
);

/**
 * GradientButton component for primary call-to-action elements
 * @param className - Additional CSS classes
 * @param children - Button content
 * @param onClick - Click event handler
 */
const GradientButton: React.FC<{ className?: string, children: React.ReactNode, onClick?: () => void }> =
  ({ className, children, onClick }) => (
    <button
      onClick={onClick}
      className={twMerge(
        'cta-primary flex items-center justify-center w-full h-full',
        className
      )}
    >
      {children}
    </button>
  );
const CtaButtonBox: React.FC = () => (
  <BentoBox className='p-[.5rem]'>
    <GradientButton className='rounded-[1rem] gap-[1.5rem] cursor-pointer' onClick={() => window.location.href = '/upload'}>
      <LargeText fontSizeClass="text-[1.8rem]" colorClass='text-[var(--color-black)]'>Fix yours now</LargeText>
      <Upload className="w-[var(--button-icon-size)] h-[var(--button-icon-size)]" />
      <SmallText className='text-[var(--color-black)]'>upload<br />resume</SmallText>
    </GradientButton>
  </BentoBox>
);

const PricingBox: React.FC = () => (
  <BentoBox className="items-start text-left p-[1.5rem] pl-[2rem] gap-[1rem]">
    <LargeText fontSizeClass="text-[1.7rem]">Pricing Plans</LargeText>
    <div className="flex flex-col items-start gap-[1.5rem] p-[.75rem] pl-[1rem] border-l-2 border-[var(--color-brown-transparent)]">
      <div className="flex flex-col items-start gap-[.5rem]">
        <LargeText fontSizeClass="text-[3rem]">$20<span className="text-[1.8rem]">/mon</span></LargeText>
        <SmallText>upto 200 resumes</SmallText>
      </div>
      <div className="flex flex-col items-start gap-[.5rem]">
        <LargeText fontSizeClass="text-[1.8rem]">Pay-as-you-go</LargeText>
        <SmallText>No Limits - $1/resume</SmallText>
      </div>
    </div>
  </BentoBox>
);

const TailoredStatsBox: React.FC = () => (
  <BentoBox className="flex flex-col items-center gap-0">
    <LargeText fontSizeClass="text-[1.6rem]">24701</LargeText>
    <SmallText >resumes<br />tailored</SmallText>
  </BentoBox>
);

const DownloadFileTypesBox: React.FC = () => (
  <BentoBox className="gap-4">
    <SmallText>Download<br />file-types</SmallText>
    <div className="flex flex-col items-start gap-[0.3rem]">
      <LargeText fontSizeClass="text-[1.8rem]">.pdf</LargeText>
      <LargeText fontSizeClass="text-[1.8rem]">.doc</LargeText>
      <LargeText fontSizeClass="text-[1.8rem]">.txt</LargeText>
    </div>
  </BentoBox>
);

const BrowserMockupBox: React.FC = () => (
  <BentoBox className='relative p-[.1rem] overflow-hidden bg-extension-mockup-gradient'>
    <Image
      src="/extension_mockup.png"
      alt="Browser Mockup"
      width={1200}
      height={800}
      className="relative z-10 w-full h-full object-cover object-[center_20%] rounded-[1.4rem]"
      priority
    />
  </BentoBox>
);

const SloganBox: React.FC = () => (
  <BentoBox>
    <SmallText className='font-semibold'>Generic resumes get ignored. Applications over #50 get buried.</SmallText>
    <LargeText fontSizeClass="text-3xl">Get tailored fast. Skip the pile.</LargeText>
  </BentoBox>
);

const AiModelsBox: React.FC = () => (
  <BentoBox className='gap-[.5rem]'>
    <SmallText>Smartest AI models</SmallText>
    <div className='flex items-center gap-[1rem]'>
      <Image
        src="/other-logos/gemini.svg"
        alt="Gemini Logo"
        width={32}
        height={32}
        className="h-8 object-contain opacity-60 hover:opacity-100 transition-all"
      />
      <LargeText fontSizeClass="text-[1.7rem]">Gemini 2.5</LargeText>
    </div>
  </BentoBox>
);

/**
 * ChecklistItem component displaying a feature with a check icon
 * @param children - Feature text
 * @param className - Additional CSS classes
 */
const ChecklistItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={twMerge(
      `flex flex-row items-center gap-[var(--main-gap)] w-full h-[4rem] rounded-b-[var(--small-rounding)] bg-gradient-to-b from-[var(--color-transparent)] from-0% to-[var(--color-neutral-800-transparent-20)] to-100% pl-[2rem]`,
      className
    )}
  >
    <svg className="w-5 h-5 text-[var(--color-green-400)] flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
      <path
        className="checkmark-path"
        d="M5 13l4 4L19 7"
      ></path>
    </svg>
    <LargeText fontSizeClass="text-[1.4rem]">{children}</LargeText>
  </div>
);

const FeaturesChecklistBox: React.FC = () => {
  const checklistItemsContent = ["Standard Titles", "File Labeling", "Custom Summary", "ATS-Friendly", "Action-Oriented", "Professional Font", "Consistent Format", "Culture Match", "No Jargon", "Active Voice", "STAR Method", "No Pronouns", "No Buzzwords", "Single Page", "Chronological Order", "Quantified Results", "Keyword Optimized", "Company Language"];

  return (
    <BentoBox className="overflow-y-auto custom-scrollbar p-0">
      <div
        className="w-full feature-checklist"
      >
        {[...checklistItemsContent, ...checklistItemsContent].map((item, index) => (
          <ChecklistItem
            key={`${item}-${index}`}
          >
            {item}
          </ChecklistItem>
        ))}
      </div>
    </BentoBox>
  );
};

const SingleClickDownloadBox: React.FC = () => (
  <BentoBox className="flex flex-row gap-[1.5rem]">
    <SmallText>Tailored resume<br />Download in a</SmallText>
    <LargeText fontSizeClass="text-[1.6rem]">Single<br />Click</LargeText>
  </BentoBox>
);

const FooterCarousel: React.FC = () => (
  <BentoBox className="flex flex-row gap-[2rem] items-center pl-[1.8rem]">
    <LargeText fontSizeClass="text-[1.6rem]" className="whitespace-nowrap">Get Hired in Top Companies</LargeText>
    <LogoCarousel className="flex flex-grow items-center" />
  </BentoBox>
);

/**
 * Main layout component for the landing page, implementing the bento box design pattern
 * Structure:
 * - Vertical split: Header, Main content, Footer
 * - Main content has horizontal split with three columns
 */
const LandingPageStructure: React.FC = () => {
  return (
    <BentoBox
      splitConfig={{ direction: 'vertical', fractions: [1, 8, 1] }}
      className="p-[var(--main-gap)] h-screen overflow-hidden bg-[url('/Icy_Robotics.png')] bg-cover bg-center"
    >
      <HeaderNav />

      <BentoBox
        splitConfig={{ direction: 'horizontal', fractions: [55, 87, 42] }}
      >
        {/* Left Column */}
        <BentoBox
          splitConfig={{ direction: 'vertical', fractions: [2, 1, 3] }}
        >
          <HeadlineStatsBox />
          <CtaButtonBox />
          <BentoBox
            splitConfig={{ direction: 'horizontal', fractions: [38, 15] }}
          >
            <PricingBox />
            <BentoBox splitConfig={{ direction: 'vertical', fractions: [8, 15] }}>
              <TailoredStatsBox />
              <DownloadFileTypesBox />
            </BentoBox>
          </BentoBox>
        </BentoBox>

        {/* Middle Column */}
        <BentoBox
          splitConfig={{ direction: 'vertical', fractions: [58, 20] }}
        >
          <BrowserMockupBox />
          <SloganBox />
        </BentoBox>

        {/* Right Column */}
        <BentoBox
          splitConfig={{ direction: 'vertical', fractions: [12, 53, 11] }}
        >
          <AiModelsBox />
          <FeaturesChecklistBox />
          <SingleClickDownloadBox />
        </BentoBox>
      </BentoBox>

      <FooterCarousel />
    </BentoBox>
  );
};

/**
 * Entry component for the bento-style landing page
 */
const BentoLandingPage = () => {
  return <LandingPageStructure />;
};

export default BentoLandingPage; 