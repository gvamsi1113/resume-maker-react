import { useState, useRef } from 'react';
import { FileUploadState, TokenState, ResumeResponse } from '../types';
import mammoth from 'mammoth';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:8000/api/onboard/process-resume/';

type GetTokenFn = () => Promise<void>;

/**
 * Custom hook for handling file upload state and logic
 * @returns {Object} File upload state and handlers
 */
export function useFileUpload(
    tokenState: TokenState,
    getToken: GetTokenFn,
    onUploadComplete?: () => void
) {
    const router = useRouter();
    const [fileState, setFileState] = useState<FileUploadState>({
        file: null,
        uploadProgress: 0,
        isDraggingOver: false,
        uploading: false,
        error: null
    });
    const [responseData, setResponseData] = useState<ResumeResponse | null>(null);
    const uploadInterval = useRef<NodeJS.Timeout | null>(null);

    const handleFileSelect = (selectedFile: File | null) => {
        if (selectedFile) {
            setFileState((prev: FileUploadState) => ({
                ...prev,
                file: selectedFile,
                uploadProgress: 0,
                uploading: false,
                error: null
            }));
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(event.target.files ? event.target.files[0] : null);
    };

    const handleCancel = () => {
        if (uploadInterval.current) {
            clearInterval(uploadInterval.current);
            uploadInterval.current = null;
        }

        // Reset the native file input value if it exists
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        // Perform a reload of the current page.
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setFileState((prev: FileUploadState) => ({ ...prev, isDraggingOver: true }));
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setFileState((prev: FileUploadState) => ({ ...prev, isDraggingOver: true }));
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setFileState((prev: FileUploadState) => ({ ...prev, isDraggingOver: false }));
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setFileState((prev: FileUploadState) => ({ ...prev, isDraggingOver: false }));
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            handleFileSelect(event.dataTransfer.files[0]);
            event.dataTransfer.clearData();
        }
    };

    const startUpload = async (file: File) => {
        if (!tokenState.token) {
            setFileState((prev: FileUploadState) => ({
                ...prev,
                uploading: false,
                error: 'Upload error: Missing authorization. Please try again.'
            }));
            return;
        }

        try {
            setFileState((prev: FileUploadState) => ({
                ...prev,
                uploading: true,
                uploadProgress: 0,
                error: null
            }));
            
            const formData = new FormData();
            let fileToUpload = file;

            // Only use the parser for DOCX files
            if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const arrayBuffer = await file.arrayBuffer();
                const { value: text } = await mammoth.extractRawText({ arrayBuffer });
                const textBlob = new Blob([text], { type: 'text/plain' });
                fileToUpload = new File([textBlob], file.name.replace(/\.docx$/, '.txt'), { type: 'text/plain' });
            }

            formData.append('resume_file', fileToUpload);
            
            // Add CAPTCHA if we have it
            if (tokenState.captchaChallenge && tokenState.captchaAnswer) {
                formData.append('captcha_challenge', tokenState.captchaChallenge);
                formData.append('captcha_answer', tokenState.captchaAnswer);
            }
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'X-Demo-Token': tokenState.token
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                // If token is invalid, let UploadPage handle getting a new one and retrying
                if (response.status === 403 && errorData.error?.includes('token')) {
                    throw new Error('Please try uploading again with the new token');
                }
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            setResponseData(data);
            setFileState((prev: FileUploadState) => ({ 
                ...prev, 
                uploadProgress: 100,
                uploading: false 
            }));
            
            if (onUploadComplete) onUploadComplete();
            
            // Remove automatic navigation
            // router.push(`/resume/${data.id}`);
            
        } catch (error) {
            setFileState((prev: FileUploadState) => ({
                ...prev,
                uploading: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            }));
        }
    };

    // ADDED: Dummy startUpload function
    // const dmmyStartUpload = async (file: File) => {
    //     setFileState(prev => ({
    //         ...prev,
    //         uploading: true,
    //         uploadProgress: 0,
    //         error: null
    //     }));

    //     // Simulate upload progress
    //     let progress = 0;
    //     const progressInterval = setInterval(() => {
    //         progress += 20;
    //         if (progress <= 100) {
    //             setFileState(prev => ({ ...prev, uploadProgress: progress }));
    //         } else {
    //             clearInterval(progressInterval);
    //             setFileState(prev => ({ 
    //                 ...prev, 
    //                 uploadProgress: 100,
    //                 uploading: false 
    //             }));
    //             // Simulate successful response
    //             setResponseData({
    //                 id: 'dummy-resume-id',
    //                 pdfUrl: '/dummy-resume.pdf'
    //             });
    //             if (onUploadComplete) onUploadComplete();
    //         }
    //     }, 500);

        // Simulate an error (optional, uncomment to test error handling)
        // setTimeout(() => {
        //     clearInterval(progressInterval);
        //     setFileState(prev => ({
        //         ...prev,
        //         uploading: false,
        //         error: 'Dummy upload error: Something went wrong!'
        //     }));
        // }, 2000);
    // };
    // END ADDED: Dummy startUpload function

    return {
        fileState,
        responseData,
        handleFileChange,
        handleCancel,
        handleDragEnter,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        startUpload
    };
} 