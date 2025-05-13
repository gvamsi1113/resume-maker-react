'use client';

import React from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText, SmallText } from '@/components/ui/Typography';
import { Upload } from 'lucide-react';
import GradientButton from './GradientButton'; // Assuming GradientButton is in the same directory

/**
 * Call-to-action button box for resume upload
 * @returns {JSX.Element} Box containing CTA button for resume upload
 */
const CtaButtonBox: React.FC = () => (
    <BentoBox className='p-[.5rem]'>
        <GradientButton className='rounded-[1rem] gap-[1.5rem] cursor-pointer' onClick={() => window.location.href = '/upload'}>
            <LargeText fontSizeClass="text-[1.8rem]" colorClass='text-[var(--color-black)]'>Fix yours now</LargeText>
            <Upload className="w-[var(--button-icon-size)] h-[var(--button-icon-size)]" />
            <SmallText className='text-[var(--color-black)]'>upload<br />resume</SmallText>
        </GradientButton>
    </BentoBox>
);

export default CtaButtonBox; 