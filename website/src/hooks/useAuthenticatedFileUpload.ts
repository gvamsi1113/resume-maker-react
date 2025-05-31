import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import mammoth from 'mammoth';
import { processAuthenticatedResume } from '../api/resume'; // Changed API import
import { ResumeResponse } from '../types/resume'; // TokenState removed

// tokenState and getToken removed from parameters
export function useAuthenticatedFileUpload(
    onUploadSuccess?: (data: ResumeResponse) => void,
    onUploadError?: (error: Error) => void
) {
    const [file, setFile] = useState<File | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const mutation = useMutation<ResumeResponse, Error, File, unknown>({
        mutationFn: async (fileToUpload: File) => {
            // Removed token check
            // if (!tokenState.token) {
            //     throw new Error('Upload error: Missing authorization. Please try again.');
            // }

            let processedFile = fileToUpload;
            if (fileToUpload.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const arrayBuffer = await fileToUpload.arrayBuffer();
                const { value: text } = await mammoth.extractRawText({ arrayBuffer });
                const textBlob = new Blob([text], { type: 'text/plain' });
                processedFile = new File([textBlob], fileToUpload.name.replace(/\.docx$/, '.txt'), { type: 'text/plain' });
            }

            // Call the new API function for authenticated uploads
            // tokenState is removed from the call
            return processAuthenticatedResume({ file: processedFile });
        },
        onSuccess: (data) => {
            if (onUploadSuccess) onUploadSuccess(data);
        },
        onError: (error: Error) => {
            // Removed token-specific error handling
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
        const fileInput = document.getElementById('file-upload-dashboard') as HTMLInputElement; // Potentially different ID
        if (fileInput) fileInput.value = '';
        // No window.location.reload() by default, can be handled by consumer component if needed
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(true);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(true); // Ensure this stays true while dragging over
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
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
        isUploading: mutation.isPending,
        uploadProgress: mutation.isPending ? 50 : (mutation.isSuccess ? 100 : 0),
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
        reset: () => {
            setFile(null);
            setIsDraggingOver(false);
            mutation.reset();
            // No window.location.reload() by default
        }
    };
} 