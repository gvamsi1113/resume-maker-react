import React from 'react';
import { X, FileText, FileSpreadsheet, File, RefreshCw, AlertCircle } from 'lucide-react';
import { UploadProgress } from './UploadProgress';
import BentoBox from '@/components/ui/BentoBox';

interface UploadFileCardProps {
    file: File;
    progress: number;
    onCancel: () => void;
    error?: {
        type: 'validation' | 'network' | 'server' | 'processing';
        message: string;
    };
}

function getFileIcon(type: string, name: string) {
    if (type.includes('spreadsheet') || name.match(/\.(xls|xlsx|csv)$/i)) {
        return <FileSpreadsheet className="text-green-600" size={32} />;
    }
    if (type.includes('pdf') || name.match(/\.pdf$/i)) {
        return <FileText className="text-red-600" size={32} />;
    }
    return <File className="text-blue-600" size={32} />;
}

/**
 * Card to show uploading file info, progress, and cancel button
 */
export function UploadFileCard({ file, progress, onCancel, error }: UploadFileCardProps) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const fileType = file.name.split('.').pop()?.toUpperCase() || file.type || 'FILE';

    return (
        <BentoBox className="flex flex-col items-start p-[1.5rem] gap-[1.5rem]">
            <div className="flex items-center w-full rounded-[calc(var(--large-rounding)/2)] gap-[1.5rem]">
                <div className="flex items-center gap-[1.5rem]">
                    <div className="flex items-center justify-center rounded-[calc(var(--large-rounding)/4)]">
                        {getFileIcon(file.type, file.name)}
                    </div>
                    <div className="flex flex-col gap-[.5rem] text-left">
                        <span className="font-medium text-base text-foreground break-all">{file.name}</span>
                        <span className="text-[.75rem] text-[var(--color-gray-light)]">{fileSizeMB} MB &middot; {fileType}</span>
                    </div>
                </div>

                <button
                    onClick={onCancel}
                    className="ml-auto flex items-center justify-center p-2 rounded-full hover:bg-[var(--color-gray-medium)]/20 transition-colors cursor-pointer"
                    aria-label="Cancel upload and select a different file"
                >
                    <RefreshCw size={20} className="text-[var(--color-gray-light)]" />
                </button>
            </div>
            <div className="flex flex-row justify-between items-center w-full">
                <UploadProgress progress={progress} error={error} />
            </div>
        </BentoBox>
    );
} 