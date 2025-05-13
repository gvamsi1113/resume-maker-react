'use client';

import React from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText, SmallText } from '@/components/ui/Typography';

/**
 * Displays key statistics about resume tailoring speed and benefits
 * @returns {JSX.Element} Box containing headline statistics
 */
const HeadlineStatsBox: React.FC = () => (
    <BentoBox className='gap-[.6rem]'>
        <SmallText>Tailor your resume to JD in just</SmallText>
        <LargeText>9.2 secs</LargeText>
        <SmallText>Be the applicant #1 not #151</SmallText>
    </BentoBox>
);

export default HeadlineStatsBox; 