'use client';

import React, { useState } from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText, SmallText } from '@/components/ui/Typography';
import { FileUp, FileText, X, FolderArchive, Loader2 } from 'lucide-react';

type Step = 'upload' | 'processing';

export default function UploadPage() {
    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const handleFileSelect = (selectedFile: File | null) => {
        if (selectedFile) {
            setFile(selectedFile);
            setUploadProgress(0);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(event.target.files ? event.target.files[0] : null);
    };

    const handleSubmit = () => {
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }
        setStep('processing');
    };

    const handleCancel = () => {
        setFile(null);
        setUploadProgress(0);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        console.log('Upload cancelled');
    };

    const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(true);
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsDraggingOver(false);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            handleFileSelect(event.dataTransfer.files[0]);
            event.dataTransfer.clearData();
        }
    };

    if (step === 'processing') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-4">
                <BentoBox className="flex flex-col items-center justify-center p-6 md:p-10 gap-4 md:gap-6 max-w-md w-full !text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-primary" />
                    <LargeText className="!text-2xl md:!text-3xl">Perfecting your resume...</LargeText>
                    <SmallText className="!text-center">
                        Designing my way through the chaos, endless coffee refills, and late-night inspiration.
                    </SmallText>
                </BentoBox>
            </div>
        );
    }

    const dropzoneBaseClasses = "flex flex-col items-center justify-center w-full h-48 md:h-56 border-2 border-border-muted border-dashed rounded-lg cursor-pointer bg-background/50 hover:bg-muted/80 transition-all duration-200 ease-in-out p-4 text-center mt-2 mb-4";
    const dropzoneDraggingClasses = "border-primary bg-primary/10 scale-105";
    const iconDraggingClasses = "scale-110";

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <BentoBox className="flex flex-col p-6 md:p-8 gap-5 max-w-lg w-full !items-stretch !text-left">
                <div className="flex justify-between items-center">
                    <LargeText as="h1" className="!text-2xl md:!text-3xl !font-bold">Upload Resume & Portfolio</LargeText>
                    <button onClick={() => console.log('Close clicked')} className="text-foreground-muted hover:text-foreground">
                        <X size={24} />
                    </button>
                </div>

                <SmallText>
                    Apply this job in a few clicks, recruiter needs your updated resume and your proof of work.
                </SmallText>

                <label
                    htmlFor="file-upload"
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`${dropzoneBaseClasses} ${isDraggingOver ? dropzoneDraggingClasses : ''}`}
                >
                    <FolderArchive size={48} className={`text-primary mb-4 transition-transform duration-200 ${isDraggingOver ? iconDraggingClasses : ''}`} />
                    <p className="mb-2 text-base text-foreground">
                        Drag your documents, photos, or videos here to start uploading.
                    </p>
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                </label>

                <div className="flex items-center justify-center my-1">
                    <span className="text-foreground-muted">OR</span>
                </div>

                <label htmlFor="file-upload" className="w-full">
                    <div className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium text-center cursor-pointer">
                        Browse files
                    </div>
                </label>

                {file && (
                    <div className="w-full bg-muted rounded-full h-2.5 mt-5 mb-2">
                        <div
                            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-3 mt-auto pt-4">
                    <button
                        onClick={handleCancel}
                        className="w-full md:w-auto flex-1 px-6 py-2.5 border border-border text-foreground-muted rounded-md hover:bg-muted font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!file}
                        className="w-full md:w-auto flex-1 px-6 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Apply Job
                    </button>
                </div>
            </BentoBox>
        </div>
    );
} 