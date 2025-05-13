'use client';

import React from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText, SmallText } from '@/components/ui/Typography';

/**
 * Displays main slogan and value proposition
 * @returns {JSX.Element} Box containing marketing slogan
 */
const SloganBox: React.FC = () => (
    <BentoBox>
        <SmallText className='font-semibold'>Generic resumes get ignored. Applications over #50 get buried.</SmallText>
        <LargeText fontSizeClass="text-3xl">Get tailored fast. Skip the pile.</LargeText>
    </BentoBox>
);

export default SloganBox; 