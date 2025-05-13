'use client';

import React from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText } from '@/components/ui/Typography';
import LogoCarousel from './LogoCarousel'; // Assuming LogoCarousel is in the same directory

/**
 * Footer component with company logo carousel
 * @returns {JSX.Element} Footer with company logos
 */
const FooterCarousel: React.FC = () => (
    <BentoBox className="flex flex-row gap-[2rem] items-center pl-[1.8rem]">
        <LargeText fontSizeClass="text-[1.6rem]" className="whitespace-nowrap">Get Hired in Top Companies</LargeText>
        <LogoCarousel className="flex flex-grow items-center" />
    </BentoBox>
);

export default FooterCarousel; 