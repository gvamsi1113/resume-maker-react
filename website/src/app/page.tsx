'use client';

import React from 'react';
import BentoBox from '@/components/ui/BentoBox';
import AiModelsBox from '@/components/landing/AiModelsBox';
import BrowserMockupBox from '@/components/landing/BrowserMockupBox';
import CtaButtonBox from '@/components/landing/CtaButtonBox';
import DownloadFileTypesBox from '@/components/landing/DownloadFileTypesBox';
import FeaturesChecklistBox from '@/components/landing/FeaturesChecklistBox';
import FooterCarousel from '@/components/landing/FooterCarousel';
import HeaderNav from '@/components/landing/HeaderNav';
import HeadlineStatsBox from '@/components/landing/HeadlineStatsBox';
import PricingBox from '@/components/landing/PricingBox';
import SingleClickDownloadBox from '@/components/landing/SingleClickDownloadBox';
import SloganBox from '@/components/landing/SloganBox';
import TailoredStatsBox from '@/components/landing/TailoredStatsBox';

/**
 * Main layout component for the landing page, implementing the bento box design pattern
 * Structure:
 * - Vertical split: Header, Main content, Footer
 * - Main content has horizontal split with three columns
 * @returns {JSX.Element} Complete landing page layout
 */
const LandingPageStructure: React.FC = () => {
  return (
    <BentoBox
      splitConfig={{ direction: 'vertical', fractions: [1, 8, 1] }}
      className="p-[var(--main-gap)] h-screen overflow-hidden"
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
 * @returns {JSX.Element} The complete landing page
 */
const BentoLandingPage = () => {
  return <LandingPageStructure />;
};

export default BentoLandingPage; 