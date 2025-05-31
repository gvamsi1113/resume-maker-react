'use client';

import React, { useEffect } from 'react';
import { FileDropzone } from '../../upload/components/FileDropzone';
import { UploadFileCard } from '../../upload/components/UploadFileCard';
import { useAuthenticatedFileUpload } from '@/hooks/useAuthenticatedFileUpload';
import { ResumeResponse } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { SmallText } from '@/components/ui/Typography';
import BentoBox from '@/components/ui/BentoBox';

interface DashboardResumeUploadProps {
    onUploadSuccess: (data: ResumeResponse) => void;
    onUploadError?: (error: Error) => void;
}

export function DashboardResumeUpload({ onUploadSuccess, onUploadError }: DashboardResumeUploadProps) {
    const {
        file,
        isUploading,
        error,
        uploadProgress,
        isDraggingOver,
        isSuccess,
        handleFileChange,
        handleCancel,
        handleDragEnter,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        startUpload,
        reset,
    } = useAuthenticatedFileUpload(onUploadSuccess, onUploadError);

    // Automatically start upload once a file is selected
    useEffect(() => {
        if (file && !isUploading && !isSuccess && !error) {
            startUpload();
        }
    }, [file, isUploading, isSuccess, error, startUpload]);

    if (file) {
        return (
            <UploadFileCard
                file={file}
                progress={uploadProgress}
                onCancel={handleCancel}
                error={
                    error && !isUploading
                        ? {
                            type: 'validation',
                            message: error
                        }
                        : undefined
                }
                isWaitingForCaptcha={false}
                captchaSubmitted={true}
                isSuccess={isSuccess}
            />
        );
    }

    return (
        <>
            <SmallText className="mb-2 text-center">No base resume found. Upload one to get started.</SmallText>
            <FileDropzone
                isDraggingOver={isDraggingOver}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onFileChange={handleFileChange}
            />
            {error && (
                <SmallText className="text-red-500 mt-2">
                    Upload failed: {error}
                    <Button onClick={reset} className="ml-2 text-xs">Try again</Button>
                </SmallText>
            )}
        </>
    );
} 