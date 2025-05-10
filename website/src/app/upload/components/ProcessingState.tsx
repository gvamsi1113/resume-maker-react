import React from 'react';
import { Loader2 } from 'lucide-react';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText, SmallText } from '@/components/ui/Typography';

/**
 * Component for displaying the processing state
 * @returns {JSX.Element} The processing state component
 */
export function ProcessingState() {
    return (
        <div className="upload-page-background flex items-center justify-center min-h-screen p-4">
            <BentoBox className="upload-page-content flex flex-col items-center justify-center p-6 md:p-10 gap-4 md:gap-6 max-w-md w-full !text-center">
                <Loader2 className="animate-spin h-12 w-12 text-primary" />
                <LargeText className="!text-2xl md:!text-3xl">Perfecting your resume...</LargeText>
                <SmallText className="!text-center">
                    Designing my way through the chaos, endless coffee refills, and late-night inspiration.
                </SmallText>
            </BentoBox>
        </div>
    );
} 