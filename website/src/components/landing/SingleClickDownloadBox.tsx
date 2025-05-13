'use client';

import React from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText, SmallText } from '@/components/ui/Typography';

/**
 * Displays information about single-click download functionality
 * @returns {JSX.Element} Box showing download convenience feature
 */
const SingleClickDownloadBox: React.FC = () => (
    <BentoBox className="flex flex-row gap-[1.5rem]">
        <SmallText>Tailored resume<br />Download in a</SmallText>
        <LargeText fontSizeClass="text-[1.6rem]">Single<br />Click</LargeText>
    </BentoBox>
);

export default SingleClickDownloadBox; 