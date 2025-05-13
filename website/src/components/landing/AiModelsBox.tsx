'use client';

import React from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText, SmallText } from '@/components/ui/Typography';
import Image from 'next/image';

/**
 * Displays information about AI models used
 * @returns {JSX.Element} Box showing AI model information
 */
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

export default AiModelsBox; 