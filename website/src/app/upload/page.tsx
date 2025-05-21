'use client';

import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BentoBox from '@/components/ui/BentoBox';
import { UploadHeader } from './components/UploadHeader';
import { UploadFlow } from './components/UploadFlow';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useDemoToken } from '@/hooks/useDemoToken';
import { useCaptchaFlow } from '@/hooks/useCaptchaFlow';
import { useResumeData } from '@/context/ResumeDataContext';
import PageLayout from '@/components/layout/PageLayout';

/**
 * Main component for handling file uploads with drag and drop functionality
 * @returns {JSX.Element} The upload page component
 */
export default function UploadPage() {
    const router = useRouter();
    const { setResumeData } = useResumeData();
    const { tokenState, getToken, validateCaptcha } = useDemoToken();

    const {
        file,
        isUploading,
        error,
        responseData,
        uploadProgress,
        isDraggingOver,
        isSuccess,
        handleFileChange,
        handleCancel: originalHandleCancel,
        handleDragEnter,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        startUpload,
        reset: resetFileUpload,
    } = useFileUpload(tokenState, getToken);

    useEffect(() => {
        if (file && !tokenState.token && !tokenState.loading && !tokenState.error) {
            getToken();
        }
    }, [file, tokenState.token, tokenState.loading, tokenState.error, getToken]);

    const { showCaptcha, pendingFile } = useCaptchaFlow({
        tokenState,
        file: file,
        uploading: isUploading
    });

    // useEffect to handle navigation after successful upload with a delay for animations
    useEffect(() => {
        if (isSuccess && responseData) {
            console.log('Upload successful, setting resume data and preparing to redirect...');
            setResumeData(responseData);
            const timer = setTimeout(() => {
                console.log('Redirecting now to /register');
                router.push('/register');
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [isSuccess, responseData, router, setResumeData]);

    const handleSubmit = useCallback(() => {
        console.log('UploadFlow internal submission completed. isSuccess:', isSuccess, 'Has responseData:', !!responseData);
    }, [isSuccess, responseData]);

    const onCaptchaSubmit = useCallback((answer: string) => {
        validateCaptcha(answer);
        if (pendingFile) {
            startUpload(pendingFile);
        }
    }, [validateCaptcha, pendingFile, startUpload]);

    const handleCancel = () => {
        originalHandleCancel();
        setResumeData(null);
    };

    return (
        <PageLayout>
            <BentoBox className="flex flex-col p-[1rem] md:p-8 gap-5 max-w-lg w-full !items-stretch !text-left transition-all duration-1000 ease-out transition-[height,transform]">
                <UploadHeader />
                <UploadFlow
                    file={file}
                    isUploading={isUploading}
                    error={error}
                    uploadProgress={uploadProgress}
                    isDraggingOver={isDraggingOver}
                    isSuccess={isSuccess}
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
        </PageLayout>
    );
} 