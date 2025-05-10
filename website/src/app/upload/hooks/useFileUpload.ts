import { useState, useRef } from 'react';
import { FileUploadState } from '../types';
import mammoth from 'mammoth';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:8000/api/onboard/process-resume/';

interface TokenState {
    token: string | null;
    captchaChallenge: string | null;
    captchaAnswer: string | null;
    error: string | null;
    loading: boolean;
}

interface ResumeResponse {
    id: string;
    analysis: any;
    pdfUrl: string;
}

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
    console.log('useFileUpload hook initialized');
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
            setFileState(prev => ({
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
        setFileState({
            file: null,
            uploadProgress: 0,
            isDraggingOver: false,
            uploading: false,
            error: null
        });
        setResponseData(null);
        if (uploadInterval.current) clearInterval(uploadInterval.current);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setFileState(prev => ({ ...prev, isDraggingOver: true }));
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setFileState(prev => ({ ...prev, isDraggingOver: true }));
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setFileState(prev => ({ ...prev, isDraggingOver: false }));
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setFileState(prev => ({ ...prev, isDraggingOver: false }));
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            handleFileSelect(event.dataTransfer.files[0]);
            event.dataTransfer.clearData();
        }
    };

    const startUpload = async (file: File) => {
        console.log('startUpload called with file:', file, 'and tokenState:', tokenState);

        if (!tokenState.token) {
            console.error('startUpload called without a token. This should be orchestrated by UploadPage.');
            setFileState(prev => ({
                ...prev,
                uploading: false,
                error: 'Upload error: Missing authorization. Please try again.'
            }));
            return;
        }

        try {
            setFileState(prev => ({
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
                    console.error('Token error (403):', errorData, 'tokenState:', tokenState, 'file:', file);
                    throw new Error('Please try uploading again with the new token');
                }
                console.error('Upload failed:', errorData, 'tokenState:', tokenState, 'file:', file);
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            setResponseData(data);
            setFileState(prev => ({ 
                ...prev, 
                uploadProgress: 100,
                uploading: false 
            }));
            
            if (onUploadComplete) onUploadComplete();
            
            // Remove automatic navigation
            // router.push(`/resume/${data.id}`);
            
        } catch (error) {
            console.error('startUpload error:', error, 'tokenState:', tokenState, 'file:', file);
            setFileState(prev => ({
                ...prev,
                uploading: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            }));
        }
    };

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