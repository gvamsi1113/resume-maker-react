import { useState, useRef } from 'react';
import { FileUploadState } from '../types';

const API_URL = 'http://localhost:8000/api/onboard/process-resume/';

/**
 * Custom hook for handling file upload state and logic
 * @returns {Object} File upload state and handlers
 */
export function useFileUpload(onUploadComplete?: () => void) {
    const [fileState, setFileState] = useState<FileUploadState>({
        file: null,
        uploadProgress: 0,
        isDraggingOver: false,
        uploading: false,
        error: null
    });
    const uploadInterval = useRef<NodeJS.Timeout | null>(null);

    const handleFileSelect = (selectedFile: File | null) => {
        if (selectedFile) {
            setFileState(prev => ({
                ...prev,
                file: selectedFile,
                uploadProgress: 0,
                uploading: true,
                error: null
            }));
            startUpload(selectedFile);
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
        try {
            setFileState(prev => ({ ...prev, uploading: true, uploadProgress: 0 }));
            
            const formData = new FormData();
            formData.append('resume_file', file);

            // TODO: Replace with actual auth token
            const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ2ODY3MDYwLCJpYXQiOjE3NDY4NjYxNjAsImp0aSI6ImUzMzU5Zjg0OWNlYTQxYzM4MjJkNDFhOTQ0N2ZlMjY0IiwidXNlcl9pZCI6MX0.pzuyKwMyTYcYV0fRo7iYqESEvGfCElXEn5qorJoiTL4';
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            setFileState(prev => ({ 
                ...prev, 
                uploadProgress: 100,
                uploading: false 
            }));
            
            if (onUploadComplete) onUploadComplete();
            
        } catch (error) {
            setFileState(prev => ({
                ...prev,
                uploading: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            }));
        }
    };

    return {
        fileState,
        handleFileChange,
        handleCancel,
        handleDragEnter,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        startUpload
    };
} 