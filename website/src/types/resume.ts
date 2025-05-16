// src/types/resume.ts
export interface ResumeResponse {
  id: string;
  // pdfUrl: string; // This was in the dummy data, confirm if it's part of the actual response
  // Add other relevant fields from your API response
}

// These might be better placed in a more specific types file like `upload.ts` if not broadly used
export interface TokenState {
  token: string | null;
  captchaChallenge?: string | null;
  captchaAnswer?: string | null;
  isDemo?: boolean;
  error?: string | null;
  loading?: boolean;
}

export interface FileUploadState {
  file: File | null;
  uploadProgress: number;
  isDraggingOver: boolean;
  uploading: boolean;
  error: string | null;
} 