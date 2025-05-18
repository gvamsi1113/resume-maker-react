import React, { useRef } from 'react';
import { FileUp } from 'lucide-react';
import { SmallText } from '@/components/ui/Typography';

export interface FileDropzoneProps {
    isDraggingOver: boolean;
    onDragEnter: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Component for the file dropzone
 * @param {FileDropzoneProps} props - Component props
 * @returns {JSX.Element} The file dropzone component
 */
export function FileDropzone({
    isDraggingOver,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileChange
}: FileDropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const dropzoneBaseClasses = "group flex flex-col items-center justify-center w-full h-[20rem] md:h-[30rem] gap-[1rem] border-2 border-[var(--color-gray-medium)] border-dashed rounded-[var(--large-rounding)] cursor-pointer transition-all duration-300 ease-in-out p-[1rem] text-center hover:border-[var(--color-gray-light)]";
    const dropzoneDraggingClasses = "border-[var(--color-mockup-gradient-light-blue)] bg-[var(--color-mockup-gradient-dark-blue)]/50 scale-102";
    const iconDraggingClasses = "scale-105 text-[var(--color-white)]";

    const handleBoxClick = () => {
        inputRef.current?.click();
    };

    return (
        <div
            onClick={handleBoxClick}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`${dropzoneBaseClasses} ${isDraggingOver ? dropzoneDraggingClasses : ''}`}
            style={{ userSelect: 'none' }}
            tabIndex={0}
            role="button"
            aria-label="Upload file by clicking or dragging"
        >
            <FileUp size={48} className={`transition-transform text-[var(--color-gray-light)] duration-400 ${isDraggingOver ? iconDraggingClasses : ''}`} />
            <SmallText className='text-[1rem] text-[var(--color-gray-light)] transition-colors duration-300'>
                Drag your current resume here<br />or<br /> <span className="underline underline-offset-2 group-hover:text-[var(--color-white)] ">click to browse files</span>.
            </SmallText>
            <input
                id="file-upload"
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={onFileChange}
                accept=".pdf,.doc,.docx"
                tabIndex={-1}
            />
        </div>
    );
} 