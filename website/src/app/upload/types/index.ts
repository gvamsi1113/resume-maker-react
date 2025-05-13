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

/**
 * Represents the state of an API token
 */
export interface TokenState {
    /** The authentication token, or null if not available */
    token: string | null;
    /** Captcha challenge string if required, or null */
    captchaChallenge: string | null;
    /** Captcha answer provided by user, or null */
    captchaAnswer: string | null;
    /** Error message if token retrieval failed, or null */
    error: string | null;
    /** Whether token is currently being loaded */
    loading: boolean;
}

/**
 * Response data from resume upload API
 */
export interface ResumeResponse {
    /** Unique identifier for the processed resume */
    id: string;
    /** URL to the generated PDF */
    pdfUrl: string;
} 