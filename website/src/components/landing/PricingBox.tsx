'use client';

import React from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText, SmallText } from '@/components/ui/Typography';

/**
 * Displays pricing information and plans
 * @returns {JSX.Element} Box containing pricing details
 */
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

export default PricingBox; 