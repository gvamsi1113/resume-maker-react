'use client';

import React from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText, SmallText } from '@/components/ui/Typography';

/**
 * Displays statistics about number of resumes tailored
 * @returns {JSX.Element} Box showing total resumes tailored
 */
const TailoredStatsBox: React.FC = () => (
    <BentoBox className="flex flex-col items-center gap-0 justify-around">
        <LargeText fontSizeClass="text-[1.6rem]">24701</LargeText>
        <SmallText >resumes<br />tailored</SmallText>
    </BentoBox>
);

export default TailoredStatsBox; 