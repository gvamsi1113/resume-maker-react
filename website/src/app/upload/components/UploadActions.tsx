import React from 'react';
import { LargeText } from '@/components/ui/Typography';
import { twMerge } from 'tailwind-merge';

interface UploadActionsProps {
    onSubmit: () => void;
    isSubmitDisabled: boolean;
}

/**
 * Component for upload action buttons
 * @param {UploadActionsProps} props - Component props
 * @returns {JSX.Element} The actions component
 */
export function UploadActions({ onSubmit, isSubmitDisabled }: UploadActionsProps) {
    return (
        <div className="flex justify-end pt-[1rem] pr-[.2rem] pb-[.2rem]">
            <button
                onClick={onSubmit}
                disabled={isSubmitDisabled}
                className={twMerge(
                    'cta-primary flex items-center justify-center px-[1.5rem] py-[.75rem] rounded-[.7rem] gap-[1.5rem] cursor-pointer transition-all duration-300',
                    isSubmitDisabled && 'opacity-40 cursor-not-allowed grayscale hover:grayscale'
                )}
                aria-disabled={isSubmitDisabled}
            >
                <LargeText fontSizeClass="text-[1.2rem]" colorClass='text-[var(--color-black)]'>Perfect Resume</LargeText>
            </button>
        </div>
    );
} 