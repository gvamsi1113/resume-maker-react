'use client';

import React, { useState } from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { FileDropzone } from './components/FileDropzone';
import { UploadProgress } from './components/UploadProgress';
import { ProcessingState } from './components/ProcessingState';
import { UploadHeader } from './components/UploadHeader';
import { UploadActions } from './components/UploadActions';
import { UploadFileCard } from './components/UploadFileCard';
import { useFileUpload } from './hooks/useFileUpload';
import { UploadStep } from './types';
import './upload.css';

/**
 * Main component for handling file uploads with drag and drop functionality
 * @returns {JSX.Element} The upload page component
 */
export default function UploadPage() {
    const [step, setStep] = useState<UploadStep>('upload');
    const {
        fileState,
        handleFileChange,
        handleCancel,
        handleDragEnter,
        handleDragOver,
        handleDragLeave,
        handleDrop
    } = useFileUpload(() => {
        // This callback is called when upload is complete
        if (fileState.uploadProgress === 100) {
            setStep('processing');
        }
    });

    const handleSubmit = () => {
        if (fileState.file && fileState.uploadProgress === 100) {
            setStep('processing');
        }
    };

    if (step === 'processing') {
        return <ProcessingState />;
    }

    return (
        <div className="upload-page-background flex items-center justify-center min-h-screen p-4">
            <BentoBox className="upload-page-content flex flex-col p-[1rem] md:p-8 gap-5 max-w-lg w-full !items-stretch !text-left transition-all duration-1000 ease-out transition-[height,transform]">
                <UploadHeader />
                {fileState.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{fileState.error}</span>
                    </div>
                )}
                {fileState.file ? (
                    <>
                        <UploadFileCard
                            file={fileState.file}
                            progress={fileState.uploadProgress}
                            onCancel={handleCancel}
                        />
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