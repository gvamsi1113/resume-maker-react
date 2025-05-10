'use client';

import React, { useState, useEffect } from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { FileDropzone } from './components/FileDropzone';
import { UploadProgress } from './components/UploadProgress';
import { ProcessingState } from './components/ProcessingState';
import { UploadHeader } from './components/UploadHeader';
import { UploadActions } from './components/UploadActions';
import { UploadFileCard } from './components/UploadFileCard';
import { useFileUpload } from './hooks/useFileUpload';
import { useDemoToken } from './hooks/useDemoToken';
import { UploadStep } from './types';
import './upload.css';

/**
 * Main component for handling file uploads with drag and drop functionality
 * @returns {JSX.Element} The upload page component
 */
export default function UploadPage() {
    const [step, setStep] = useState<UploadStep>('upload');
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    // Use the token/captcha state at the top level
    const { tokenState, getToken, validateCaptcha } = useDemoToken();

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
    } = useFileUpload(tokenState, getToken, () => {
        if (fileState.uploadProgress === 100) {
            setStep('processing');
        }
    });

    // When a file is selected, check if captcha is required before uploading
    useEffect(() => {
        console.log('fileState.file:', fileState.file);
        console.log('tokenState:', tokenState);
        // If a file is selected and no token, request a token
        if (fileState.file && !tokenState.token && !tokenState.loading) {
            console.log('No token present, requesting token...');
            getToken();
            return;
        }
        // If all required state for captcha upload is ready, start upload
        if (
            fileState.file &&
            tokenState.token &&
            tokenState.captchaChallenge &&
            tokenState.captchaAnswer
        ) {
            console.log('Ready to upload with captcha. Hiding captcha and starting upload.');
            setShowCaptcha(false);
            startUpload(fileState.file);
        } else if (
            fileState.file &&
            tokenState.token &&
            !tokenState.captchaChallenge
        ) {
            console.log('Ready to upload without captcha. Hiding captcha and starting upload.');
            setShowCaptcha(false);
            startUpload(fileState.file);
        } else if (
            fileState.file &&
            tokenState.captchaChallenge &&
            !tokenState.captchaAnswer
        ) {
            console.log('Showing captcha for challenge:', tokenState.captchaChallenge);
            setShowCaptcha(true);
            setPendingFile(fileState.file);
        }
    }, [fileState.file, tokenState.token, tokenState.captchaChallenge, tokenState.captchaAnswer, tokenState.loading]);

    // Handle CAPTCHA submission
    const handleCaptchaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (captchaAnswer && pendingFile) {
            console.log('Submitting captcha answer:', captchaAnswer, 'for challenge:', tokenState.captchaChallenge);
            validateCaptcha(captchaAnswer); // Store the answer in token state
            setShowCaptcha(false);
            setCaptchaAnswer('');
            startUpload(pendingFile); // Now trigger the upload
            setPendingFile(null);
        }
    };

    const handleSubmit = () => {
        if (fileState.file && fileState.uploadProgress === 100) {
            setStep('processing');
        }
    };

    if (step === 'processing' && responseData) {
        return <ProcessingState responseData={responseData} />;
    }

    return (
        <div className="upload-page-background flex items-center justify-center min-h-screen p-4">
            <BentoBox className="upload-page-content flex flex-col p-[1rem] md:p-8 gap-5 max-w-lg w-full !items-stretch !text-left transition-all duration-1000 ease-out transition-[height,transform]">
                <UploadHeader />

                {showCaptcha && tokenState.captchaChallenge ? (
                    <div className="captcha-container p-4 bg-white/5 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Please solve this CAPTCHA to continue</h3>
                        <p className="text-xl mb-4">{tokenState.captchaChallenge}</p>
                        <form onSubmit={handleCaptchaSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={captchaAnswer}
                                onChange={(e) => setCaptchaAnswer(e.target.value)}
                                className="flex-1 px-3 py-2 bg-white/10 rounded border border-white/20"
                                placeholder="Enter your answer"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Submit
                            </button>
                        </form>
                    </div>
                ) : fileState.file ? (
                    <>
                        <UploadFileCard
                            file={fileState.file}
                            progress={fileState.uploadProgress}
                            onCancel={handleCancel}
                            error={
                                fileState.error && !fileState.uploading
                                    ? {
                                        type: 'validation',
                                        message: fileState.error
                                    }
                                    : undefined
                            }
                        />
                        {fileState.uploading && (
                            <div className="loading-message text-center text-blue-400 mt-2">
                                Uploading, please wait...
                            </div>
                        )}
                        <UploadActions
                            onSubmit={handleSubmit}
                            isSubmitDisabled={!fileState.file || fileState.uploadProgress < 100 || fileState.error !== null}
                        />
                    </>
                ) : (
                    <FileDropzone
                        isDraggingOver={fileState.isDraggingOver}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onFileChange={handleFileChange}
                    />
                )}
            </BentoBox>
        </div>
    );
} 