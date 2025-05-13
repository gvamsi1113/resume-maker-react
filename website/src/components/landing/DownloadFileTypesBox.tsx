'use client';

import React from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText, SmallText } from '@/components/ui/Typography';

/**
 * Displays supported file types for resume downloads
 * @returns {JSX.Element} Box showing supported file formats
 */
const DownloadFileTypesBox: React.FC = () => (
    <BentoBox className="flex flex-col items-center justify-around gap-0">
        <SmallText>Download<br />file-types</SmallText>
        <div className="flex flex-col items-start gap-[0.3rem]">
            <LargeText fontSizeClass="text-[1.8rem]">.pdf</LargeText>
            <LargeText fontSizeClass="text-[1.8rem]">.doc</LargeText>
            <LargeText fontSizeClass="text-[1.8rem]">.txt</LargeText>
        </div>
    </BentoBox>
);

export default DownloadFileTypesBox; 