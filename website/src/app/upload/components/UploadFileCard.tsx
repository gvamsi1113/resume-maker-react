import React from 'react';
import { X, FileText, FileSpreadsheet, File, RefreshCw, AlertCircle } from 'lucide-react';
import { UploadProgress } from './UploadProgress';
import BentoBox from '@/components/ui/BentoBox';

/**
 * Props for the {@link UploadFileCard} component.
 */
interface UploadFileCardProps {
    /** The file object to display information about. */
    file: File;
    /** The current upload progress percentage (0-100). */
    progress: number;
    /** Callback function triggered when the cancel button is clicked. */
    onCancel: () => void;
    /** Optional error object containing type and message if an error occurred. */
    error?: {
        /** Type of error. */
        type: 'validation' | 'network' | 'server' | 'processing';
        /** Error message to display. */
        message: string;
    };
    /** Boolean indicating if the flow is waiting for captcha input. */
    isWaitingForCaptcha: boolean;
    /** Boolean indicating if the captcha has been submitted. */
    captchaSubmitted: boolean;
    /** Boolean indicating if the upload was successful. */
    isSuccess: boolean;
}

/**
 * Determines the appropriate file icon based on the file type or name.
 * @param {string} type - The MIME type of the file (e.g., 'application/pdf').
 * @param {string} name - The name of the file (e.g., 'resume.pdf').
 * @returns {React.ReactElement} A Lucide icon component.
 */
function getFileIcon(type: string, name: string): React.ReactElement {
    if (type.includes('spreadsheet') || name.match(/\.(xls|xlsx|csv)$/i)) {
        return <FileSpreadsheet className="text-green-600" size={32} />;
    }
    if (name.match(/\.pdf$/i) || type.includes('pdf')) {
        return <FileText className="text-red-600" size={32} />;
    }
    if (name.match(/\.(doc|docx)$/i) || type.includes('wordprocessingml')) {
        return <FileText className="text-blue-700" size={32} />;
    }
    return <File className="text-blue-600" size={32} />;
}

/**
 * @component UploadFileCard
 * @description A card component that displays information about an uploading file,
 * its progress, and provides an option to cancel the upload.
 * It shows the file name, size, type, an icon representing the file type,
 * and the upload progress status including any errors or captcha states.
 */
export function UploadFileCard({
    file,
    progress,
    onCancel,
    error,
    isWaitingForCaptcha,
    captchaSubmitted,
    isSuccess
}: UploadFileCardProps) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    const fileNameExtension = file.name.includes('.') ? file.name.split('.').pop()!.toUpperCase() : null;
    let simplifiedMimeType: string | null = null;
    if (file.type) {
        const parts = file.type.split('/');
        if (parts.length === 2 && parts[1] && parts[1].toLowerCase() !== 'octet-stream') {
            simplifiedMimeType = parts[1].toUpperCase();
        }
    }
    const fileTypeDisplay = fileNameExtension || simplifiedMimeType || 'FILE';

    return (
        <BentoBox className="flex flex-col items-start p-6 gap-6">
            <div className="flex items-center w-full rounded-[calc(var(--large-rounding)/2)] gap-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center justify-center rounded-[calc(var(--large-rounding)/4)]">
                        {getFileIcon(file.type, file.name)}
                    </div>
                    <div className="flex flex-col gap-2 text-left">
                        <span className="font-medium text-base text-foreground break-all">{file.name}</span>
                        <span className="text-xs text-[var(--color-gray-light)]">{fileSizeMB} MB &middot; {fileTypeDisplay}</span>
                    </div>
                </div>

                <button
                    onClick={onCancel}
                    className="ml-auto flex items-center justify-center p-2 rounded-full hover:bg-[var(--color-gray-medium)]/20 transition-colors cursor-pointer"
                    aria-label="Remove file"
                    disabled={isSuccess}
                >
                    <X size={20} className="text-[var(--color-gray-light)]" />
                </button>
            </div>
            <div className="flex flex-row justify-between items-center w-full">
                <UploadProgress
                    progress={progress}
                    error={error}
                    isWaitingForCaptcha={isWaitingForCaptcha}
                    isSuccess={isSuccess}
                    captchaSubmitted={captchaSubmitted}
                />
            </div>
        </BentoBox>
    );
} 