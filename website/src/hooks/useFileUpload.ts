import { useState, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import mammoth from 'mammoth';
import { processResume } from '../api/resume';
import { FileUploadState, TokenState, ResumeResponse } from '../types/resume';

// const API_URL = 'http://localhost:8000/api/onboard/process-resume/'; // No longer needed

type GetTokenFn = () => Promise<void>; // This might need to be re-evaluated based on auth flow

export function useFileUpload(
    tokenState: TokenState,
    getToken: GetTokenFn, // Consider if this is still the best way to handle token refresh with React Query
    onUploadSuccess?: (data: ResumeResponse) => void,
    onUploadError?: (error: Error) => void
) {
    // const router = useRouter(); // See comment above
    const [file, setFile] = useState<File | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    // Removed uploadProgress from local state as useMutation provides status

    // The core mutation logic using React Query
    const mutation = useMutation<ResumeResponse, Error, File, unknown>({
        mutationFn: async (fileToUpload: File) => {
            if (!tokenState.token) {
                throw new Error('Upload error: Missing authorization. Please try again.');
            }

            let processedFile = fileToUpload;
            // DOCX conversion
            if (fileToUpload.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const arrayBuffer = await fileToUpload.arrayBuffer();
                const { value: text } = await mammoth.extractRawText({ arrayBuffer });
                const textBlob = new Blob([text], { type: 'text/plain' });
                processedFile = new File([textBlob], fileToUpload.name.replace(/\.docx$/, '.txt'), { type: 'text/plain' });
            }

            return processResume({ file: processedFile, tokenState });
        },
        onSuccess: (data) => {
            setFile(null); // Clear the file on success
            if (onUploadSuccess) onUploadSuccess(data);
            // Example: Trigger navigation or further actions
            // router.push(`/resume/${data.id}`); 
        },
        onError: (error: Error) => {
             // If token is invalid (e.g. 403), getToken might be called here to refresh
            // This depends on how getToken and tokenState are managed globally
            if (error.message.includes('token')) {
                // Potentially call getToken() here, or signal parent to do so.
                // For now, just pass the error up.
                console.warn('Token might be invalid, consider refreshing:', error.message);
            }
            if (onUploadError) onUploadError(error);
        },
    });

    const handleFileSelect = (selectedFile: File | null) => {
        if (selectedFile) {
            setFile(selectedFile);
            mutation.reset();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(event.target.files ? event.target.files[0] : null);
    };

    const handleCancel = () => {
        setFile(null);
        mutation.reset();
        // Reset the native file input value
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        // Consider if reload is still desired or if resetting state is enough
        if (typeof window !== 'undefined') {
            // window.location.reload();
        }
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(true);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        // Check if the leave is to an element outside the drop zone
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsDraggingOver(false);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            handleFileSelect(event.dataTransfer.files[0]);
            event.dataTransfer.clearData();
        }
    };

    const startUpload = useCallback((fileToUpload?: File) => {
        const targetFile = fileToUpload || file;
        if (targetFile) {
            mutation.mutate(targetFile);
        }
    }, [file, mutation]);

    return {
        file,
        isDraggingOver,
        // Expose mutation states for UI updates
        isUploading: mutation.isPending,
        uploadProgress: mutation.isPending ? 50 : (mutation.isSuccess ? 100 : 0), // Simplified progress
        error: mutation.error?.message || null,
        isSuccess: mutation.isSuccess,
        responseData: mutation.data || null,
        
        handleFileChange,
        handleCancel,
        handleDragEnter,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        startUpload,
        reset: () => { // Allow resetting the hook state from outside
            setFile(null);
            setIsDraggingOver(false);
            mutation.reset();
        }
    };
} 