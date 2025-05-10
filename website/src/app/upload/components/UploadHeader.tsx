import React from 'react';
import { LargeText, SmallText } from '@/components/ui/Typography';

/**
 * Component for the upload page header
 * @returns {JSX.Element} The header component
 */
export function UploadHeader() {
    return (
        <div className="flex flex-col gap-[1rem] py-[1rem]">
            <LargeText fontSizeClass='text-[2rem]'>Upload Resume</LargeText>
            <SmallText>
                Upload your current resume and we'll make it perfect.
            </SmallText>
        </div>
    );
} 