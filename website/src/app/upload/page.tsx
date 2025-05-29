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

const REDIRECT_DELAY_MS = 2000;

/**
 * @file Page component for uploading resume files.
 * @description This page allows users to upload their resume. It handles file selection via
 * drag-and-drop or a file input, manages the upload process including potential
 * captcha verification, and redirects the user to the registration page upon successful upload.
 * It leverages custom hooks for managing file state, API token interactions, and captcha flow.
 * @returns {JSX.Element} The UploadPage component.
 */

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
            console.log('Upload successful, processing response:', responseData);
            setResumeData(responseData); // Set resume data regardless for context

            const timer = setTimeout(() => {
                if (responseData.is_duplicate_user) {
                    console.log('Redirecting now to /login (existing user)');
                    router.push('/login');
                } else if (responseData.is_duplicate) {
                    // Existing resume, but not necessarily an existing user account linked yet
                    console.log('Redirecting now to /register (existing resume)');
                    router.push('/register');
                } else {
                    // New resume, no duplicate user or resume found
                    console.log('Redirecting now to /register (new resume)');
                    router.push('/register');
                }
            }, REDIRECT_DELAY_MS);

            return () => clearTimeout(timer);
        }
    }, [isSuccess, responseData, router, setResumeData]);

    /**
     * Callback for submitting the captcha answer.
     * Validates the captcha and starts the upload if a file is pending.
     * @param {string} answer - The user's answer to the captcha.
     */
    const onCaptchaSubmit = useCallback((answer: string) => {
        validateCaptcha(answer);
        if (pendingFile) {
            startUpload(pendingFile);
        }
    }, [validateCaptcha, pendingFile, startUpload]);

    /**
     * Handles the cancellation of the upload process.
     * Resets the file upload state and clears any existing resume data in the context.
     */
    const handleCancel = () => {
        originalHandleCancel();
        resetFileUpload();
        setResumeData(null);
    };

    return (
        <PageLayout>
            <BentoBox className="flex flex-col p-[1rem] pb-[1.1rem] md:p-[2rem] md:pb-[2.2rem] gap-5 max-w-lg w-full !items-stretch !text-left transition-all duration-1000 ease-out transition-[height,transform] rounded-[2.5rem]">
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
                    onCancel={handleCancel}
                    onCaptchaSubmit={onCaptchaSubmit}
                />
            </BentoBox>
        </PageLayout>
    );
} 