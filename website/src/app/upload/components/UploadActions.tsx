import React from 'react';
import { LargeText } from '@/components/ui/Typography';
import { twMerge } from 'tailwind-merge';

/**
 * Props for the {@link UploadActions} component.
 */
interface UploadActionsProps {
    /** Callback function triggered when the primary action button is clicked. */
    onSubmit: () => void;
    /** Boolean indicating whether the primary action button should be disabled. */
    isSubmitDisabled: boolean;
}

/**
 * @component UploadActions
 * @description A component that renders action buttons for the upload process, primarily a submit button.
 * It handles disable states and styling for the actions.
 * @param {UploadActionsProps} props - The props for the component.
 * @returns {React.ReactElement} The actions component, typically containing one or more buttons.
 */
export function UploadActions({ onSubmit, isSubmitDisabled }: UploadActionsProps): React.ReactElement {
    return (
        <div className="flex justify-end pt-4 pr-1 pb-1">
            <button
                onClick={onSubmit}
                disabled={isSubmitDisabled}
                className={twMerge(
                    'cta-primary flex items-center justify-center px-6 py-3 rounded-xl gap-6 cursor-pointer transition-all duration-300',
                    isSubmitDisabled && 'opacity-40 cursor-not-allowed grayscale hover:grayscale'
                )}
                aria-disabled={isSubmitDisabled}
            >
                <LargeText fontSizeClass="text-xl" colorClass='text-[var(--color-black)]'>Perfect Resume</LargeText>
            </button>
        </div>
    );
} 