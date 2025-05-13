/**
 * Represents the state of a file upload operation
 */
export interface FileUploadState {
    /** The file being uploaded, or null if no file selected */
    file: File | null;
    /** Upload progress as a percentage from 0-100 */
    uploadProgress: number;
    /** Whether a file is being dragged over the dropzone */
    isDraggingOver: boolean;
    /** Whether a file is currently being uploaded */
    uploading: boolean;
    /** Error message if upload failed, or null if no error */
    error: string | null;
} 