import { AlertCircle, CheckCircle, Loader2, Timer } from 'lucide-react';
import React from 'react';

interface UploadProgressProps {
    progress: number;
    error?: {
        type: 'validation' | 'network' | 'server' | 'processing';
        message: string;
    };
}

// Dummy test hook
const useDummyUpload = () => {
    const [progress, setProgress] = React.useState(0);
    const [error, setError] = React.useState<{ type: 'validation' | 'network' | 'server' | 'processing'; message: string } | undefined>(undefined);

    React.useEffect(() => {
        // Simulate progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 1000);

        // Simulate an error after some time (optional)
        // setTimeout(() => {
        //     setError({ type: 'server', message: 'Dummy server error' });
        //     clearInterval(interval);
        // }, 5000);

        return () => clearInterval(interval);
    }, []);

    return { progress, error };
};
// End of dummy test hook

/**
 * Component for displaying upload progress
 * @param {UploadProgressProps} props - Component props
 * @returns {JSX.Element} The upload progress component
 */
export function UploadProgress({ /* progress, error */ }: UploadProgressProps) {
    const { progress, error } = useDummyUpload();
    return (
        <div className="w-full flex flex-col gap-[1rem]">
            {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle size={16} />
                    <span>{error.message}</span>
                </div>
            )}
            {!error && progress < 100 && (
                <div className="flex items-center justify-between w-full gap-2 text-gray-500 text-sm">
                    <div className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Processing...</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Timer size={16} className="animate-spin" />
                        <span>Processing...</span>
                    </div>
                </div>
            )}
            {!error && progress === 100 && (
                <div className="flex items-center gap-2 text-blue-500 text-sm">
                    <CheckCircle size={16} />
                    <span>Resume Perfected</span>
                </div>
            )}
            <div className="h-2 w-full bg-[var(--color-gray-medium)]/20 rounded-full overflow-hidden">
                <div
                    className={`h-full ${error ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{
                        width: error ? '100%' : `${progress}%`,
                        transition: error ? 'none' : 'width 300ms ease-in-out'
                    }}
                />
            </div>
            {/* <div className="mt-[1rem] text-[.75rem] text-[var(--color-gray-light)] justify-start">
                {error ? 'Upload failed' : `${progress}% uploaded`}
            </div> */}
        </div>
    );
} 