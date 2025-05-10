export type UploadStep = 'upload' | 'processing';

export interface FileUploadState {
    file: File | null;
    uploadProgress: number;
    isDraggingOver: boolean;
    uploading: boolean;
    error: string | null;
} 