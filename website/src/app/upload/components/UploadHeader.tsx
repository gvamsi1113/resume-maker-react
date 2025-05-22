import React from 'react';
import { LargeText, SmallText } from '@/components/ui/Typography';

/**
 * @component UploadHeader
 * @description Displays the main header for the resume upload page, including a title and a subtitle.
 * @returns {React.ReactElement} The header component.
 */
export function UploadHeader(): React.ReactElement {
    return (
        <div className="flex flex-col gap-4 py-4">
            <LargeText fontSizeClass='text-[2rem]'>Upload Resume</LargeText>
            <SmallText>
                Upload your current resume and we'll make it perfect.
            </SmallText>
        </div>
    );
} 