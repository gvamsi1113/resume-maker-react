'use client';

import React, { useCallback, useEffect } from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { UploadHeader } from './components/UploadHeader';
import { UploadFlow } from './components/UploadFlow';
import { useFileUpload } from './hooks/useFileUpload';
import { useDemoToken } from './hooks/useDemoToken';
import { useCaptchaFlow } from './hooks/useCaptchaFlow';

/**
 * Main component for handling file uploads with drag and drop functionality
 * @returns {JSX.Element} The upload page component
 */
export default function UploadPage() {
    // Get token state with captcha handling
    const { tokenState, getToken, validateCaptcha } = useDemoToken();

    // Get file upload state and handlers
    const {
        fileState,
        responseData,
        handleFileChange,
        handleCancel,
        handleDragEnter,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        startUpload
    } = useFileUpload(tokenState, getToken);

    // Request token when file is selected but no token exists
    useEffect(() => {
        if (fileState.file && !tokenState.token && !tokenState.loading) {
            getToken();
        }
    }, [fileState.file, tokenState.token, tokenState.loading, getToken]);

    // Handle captcha flow logic
    const { showCaptcha, pendingFile } = useCaptchaFlow({
        tokenState,
        file: fileState.file,
        uploading: fileState.uploading
    });

    // Handle form submission
    const handleSubmit = useCallback(() => {
        console.log('handleSubmit - Process completed resume:', responseData);
        // Navigation or next steps would happen here
    }, [responseData]);

    // Handle captcha submission
    const onCaptchaSubmit = useCallback((answer: string) => {
        validateCaptcha(answer);
        if (pendingFile) {
            startUpload(pendingFile);
        }
    }, [validateCaptcha, pendingFile, startUpload]);

    return (
        <div className="bg-[#161F36] flex items-center justify-center min-h-screen p-4">
            <BentoBox className="flex flex-col p-[1rem] md:p-8 gap-5 max-w-lg w-full !items-stretch !text-left transition-all duration-1000 ease-out transition-[height,transform]">
                <UploadHeader />

                <UploadFlow
                    fileState={fileState}
                    tokenState={tokenState}
                    showCaptcha={showCaptcha}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onFileChange={handleFileChange}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    onCaptchaSubmit={onCaptchaSubmit}
                />
            </BentoBox>
        </div>
    );
} 