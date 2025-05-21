import React from 'react';
import { FileDropzone } from './FileDropzone';
import { UploadFileCard } from './UploadFileCard';
import { UploadActions } from './UploadActions';
import { CaptchaChallenge } from './CaptchaChallenge';
import { TokenState, FileUploadState } from '../../../types/resume';

interface UploadFlowProps {
    file: File | null;
    isUploading: boolean;
    error: string | null;
    uploadProgress: number;
    isDraggingOver: boolean;
    isSuccess: boolean;
    tokenState: TokenState;
    showCaptcha: boolean;
    onDragEnter: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onCancel: () => void;
    onCaptchaSubmit: (answer: string) => void;
}

/**
 * Component for handling the different states of the upload flow
 * @param {UploadFlowProps} props - Component props
 * @returns {JSX.Element} The appropriate component for the current upload state
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
    onSubmit,
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
                        error && !isUploading
                            ? {
                                type: 'validation',
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