import React from 'react';
import { FileDropzone } from './FileDropzone';
import { UploadFileCard } from './UploadFileCard';
import { UploadActions } from './UploadActions';
import { CaptchaChallenge } from './CaptchaChallenge';
import { FileUploadState, TokenState } from '../types';

interface UploadFlowProps {
    fileState: FileUploadState;
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
    fileState,
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
    if (showCaptcha && tokenState.captchaChallenge) {
        return (
            <CaptchaChallenge
                challenge={tokenState.captchaChallenge}
                onSubmit={onCaptchaSubmit}
            />
        );
    }

    if (fileState.file) {
        return (
            <>
                <UploadFileCard
                    file={fileState.file}
                    progress={fileState.uploadProgress}
                    onCancel={onCancel}
                    error={
                        fileState.error && !fileState.uploading
                            ? {
                                type: 'validation',
                                message: fileState.error
                            }
                            : undefined
                    }
                />
                <UploadActions
                    onSubmit={onSubmit}
                    isSubmitDisabled={
                        !fileState.file ||
                        fileState.uploadProgress < 100 ||
                        fileState.error !== null
                    }
                />
            </>
        );
    }

    return (
        <FileDropzone
            isDraggingOver={fileState.isDraggingOver}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onFileChange={onFileChange}
        />
    );
} 