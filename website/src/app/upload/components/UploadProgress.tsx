import React from 'react';

interface UploadProgressProps {
    progress: number;
    error?: {
        type: 'validation' | 'network' | 'server' | 'processing';
        message: string;
    };
}

/**
 * Component for displaying upload progress
 * @param {UploadProgressProps} props - Component props
 * @returns {JSX.Element} The upload progress component
 */
export function UploadProgress({ progress, error }: UploadProgressProps) {
    return (
        <div className="w-full">
            <div className="h-2 w-full bg-[var(--color-gray-medium)]/20 rounded-full overflow-hidden">
                <div
                    className={`h-full ${error ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{
                        width: error ? '100%' : `${progress}%`,
                        transition: error ? 'none' : 'width 300ms ease-in-out'
                    }}
                />
            </div>
            <div className="mt-[1rem] text-[.75rem] text-[var(--color-gray-light)] justify-start">
                {error ? 'Upload failed' : `${progress}% uploaded`}
            </div>
        </div>
    );
} 