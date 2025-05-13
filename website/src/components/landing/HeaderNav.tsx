'use client';

import React from 'react';
import Image from 'next/image';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText } from '@/components/ui/Typography';

/**
 * Header navigation component containing logo, navigation links and CTA button
 * @returns {JSX.Element} Header navigation bar with logo and navigation elements
 */
const HeaderNav: React.FC = () => (
    <BentoBox className="flex flex-row justify-between items-center w-full p-0">
        <div className="flex items-center gap-[1rem] p-[1.2rem] h-full">
            <Image
                src="/Rezoome.svg"
                alt="Rezoome Logo"
                width={40}
                height={40}
                className="h-full w-auto object-contain"
                priority
            />
            <span className="text-[1.5rem] font-bold">Rezoome</span>
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

export default HeaderNav; 