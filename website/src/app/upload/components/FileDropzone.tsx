import React, { useRef } from 'react';
import { FileUp } from 'lucide-react';
import { SmallText } from '@/components/ui/Typography';

/**
 * Props for the {@link FileDropzone} component.
 */
export interface FileDropzoneProps {
    /** Indicates if a file is currently being dragged over the dropzone area. */
    isDraggingOver: boolean;
    /** Callback function triggered when a dragged item enters the dropzone area. */
    onDragEnter: (event: React.DragEvent<HTMLDivElement>) => void;
    /** Callback function triggered when a dragged item is being moved over the dropzone area. */
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    /** Callback function triggered when a dragged item leaves the dropzone area. */
    onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
    /** Callback function triggered when a file is dropped onto the dropzone area. */
    onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    /** Callback function triggered when a file is selected using the file input (e.g., by clicking the dropzone). */
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * @component FileDropzone
 * @description A UI component that allows users to select a file by either clicking to browse
 * or by dragging and dropping a file onto the designated area. It visually responds to
 * drag-over events and manages file input interactions.
 * @param {FileDropzoneProps} props - The props for the component.
 * @returns {React.ReactElement} The file dropzone element.
 */
export function FileDropzone({
    isDraggingOver,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileChange
}: FileDropzoneProps): React.ReactElement {
    const inputRef = useRef<HTMLInputElement>(null);
    const dropzoneBaseClasses = "group flex flex-col items-center justify-center w-full h-[20rem] md:h-[30rem] gap-4 border-2 border-[var(--color-gray-medium)] border-dashed rounded-[var(--large-rounding)] cursor-pointer transition-all duration-300 ease-in-out p-4 text-center hover:border-[var(--color-gray-light)]";
    const dropzoneDraggingClasses = "border-[var(--color-mockup-gradient-light-blue)] bg-[var(--color-mockup-gradient-dark-blue)]/50 scale-105";
    const iconDraggingClasses = "scale-105 text-[var(--color-white)]"; // This class is for the icon itself when dragging

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
            className={`${dropzoneBaseClasses} ${isDraggingOver ? dropzoneDraggingClasses : ''} select-none`}
            tabIndex={0}
            role="button"
            aria-label="Upload file by clicking or dragging"
        >
            <FileUp size={48} className={`transition-transform text-[var(--color-gray-light)] duration-300 ${isDraggingOver ? iconDraggingClasses : ''}`} />
            <SmallText className='text-base text-[var(--color-gray-light)] transition-colors duration-300'>
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