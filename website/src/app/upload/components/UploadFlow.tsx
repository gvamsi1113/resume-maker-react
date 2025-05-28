import React from 'react';
import { FileDropzone } from './FileDropzone';
import { UploadFileCard } from './UploadFileCard';
import { CaptchaChallenge } from './CaptchaChallenge';
import { TokenState } from '../../../types/resume';

/**
 * Props for the {@link UploadFlow} component.
 */
interface UploadFlowProps {
    /** The currently selected file, or null if no file is selected. */
    file: File | null;
    /** Indicates if a file upload is currently in progress. */
    isUploading: boolean;
    /** An error message string if an error has occurred, otherwise null. */
    error: string | null;
    /** The progress of the current upload, as a percentage (0-100). */
    uploadProgress: number;
    /** Indicates if a file is being dragged over the dropzone. */
    isDraggingOver: boolean;
    /** Indicates if the file upload has completed successfully. */
    isSuccess: boolean;
    /** The current state of the authentication token and captcha challenge. */
    tokenState: TokenState;
    /** Indicates if the captcha challenge should be displayed. */
    showCaptcha: boolean;
    /** Event handler for when a dragged item enters the dropzone. */
    onDragEnter: (event: React.DragEvent<HTMLDivElement>) => void;
    /** Event handler for when a dragged item is over the dropzone. */
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    /** Event handler for when a dragged item leaves the dropzone. */
    onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
    /** Event handler for when a file is dropped onto the dropzone. */
    onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    /** Event handler for when a file is selected via the file input. */
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    /** Callback function triggered when the user cancels the file selection or upload. */
    onCancel: () => void;
    /** Callback function for submitting the captcha answer. */
    onCaptchaSubmit: (answer: string) => void;
}

/**
 * @component UploadFlow
 * @description Manages and renders the appropriate UI for different stages of the file upload process.
 * It displays a {@link FileDropzone} if no file is selected. Once a file is selected,
 * it shows an {@link UploadFileCard} with upload progress and details. If a captcha is required,
 * it also renders the {@link CaptchaChallenge} component.
 */
export function UploadFlow({
    file,
    isUploading,
    error,
    uploadProgress,
    isDraggingOver,
    isSuccess,
    tokenState,
    showCaptcha,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileChange,
    onCancel,
    onCaptchaSubmit
}: UploadFlowProps) {
    if (file) {
        return (
            <>
                <UploadFileCard
                    file={file}
                    progress={uploadProgress}
                    onCancel={onCancel}
                    error={
                        // Assuming that a string error received when not actively uploading
                        // is a validation-type error. For more specific error types (network, server),
                        // the source hook (e.g., useFileUpload) should ideally provide a structured error.
                        error && !isUploading
                            ? {
                                type: 'validation', // Or a more generic 'client' or 'general' type
                                message: error
                            }
                            : undefined
                    }
                    isWaitingForCaptcha={showCaptcha && !!tokenState.captchaChallenge}
                    captchaSubmitted={!showCaptcha && !!tokenState.token}
                    isSuccess={isSuccess}
                />
                {showCaptcha && tokenState.captchaChallenge && (
                    <CaptchaChallenge
                        challenge={tokenState.captchaChallenge}
                        onSubmit={onCaptchaSubmit}
                    />
                )}
            </>
        );
    }

    return (
        <FileDropzone
            isDraggingOver={isDraggingOver}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onFileChange={onFileChange}
        />
    );
} 