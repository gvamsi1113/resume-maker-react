import React from 'react';
import { UploadFileCard } from './UploadFileCard';

// Test component to simulate different upload states
export function UploadFileCardTest() {
    const [progress, setProgress] = React.useState(0);
    const [error, setError] = React.useState<{
        type: 'validation' | 'network' | 'server' | 'processing';
        message: string;
    } | undefined>(undefined);

    // Test file
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    // Simulate different error scenarios
    const simulateError = (type: 'validation' | 'network' | 'server' | 'processing') => {
        const errorMessages = {
            validation: 'File type not supported. Please upload PDF, DOCX, or TXT.',
            network: 'Network error. Please check your connection.',
            server: 'Server error. Please try again later.',
            processing: 'Failed to process file. Please try a different file.'
        };
        setError({ type, message: errorMessages[type] });
    };

    // Simulate upload progress
    const simulateProgress = () => {
        setProgress(0);
        setError(undefined);
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 10;
            setProgress(currentProgress);
            if (currentProgress >= 100) {
                clearInterval(interval);
            }
        }, 500);
    };

    return (
        <div className="p-4 space-y-4">
            <UploadFileCard
                file={testFile}
                progress={progress}
                onCancel={() => {
                    setProgress(0);
                    setError(undefined);
                }}
                error={error}
            />
            
            <div className="space-y-2">
                <h3 className="font-bold">Test Controls:</h3>
                <div className="space-x-2">
                    <button
                        onClick={simulateProgress}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Simulate Upload
                    </button>
                    <button
                        onClick={() => simulateError('validation')}
                        className="px-4 py-2 bg-yellow-500 text-white rounded"
                    >
                        Test Validation Error
                    </button>
                    <button
                        onClick={() => simulateError('network')}
                        className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                        Test Network Error
                    </button>
                    <button
                        onClick={() => simulateError('server')}
                        className="px-4 py-2 bg-red-600 text-white rounded"
                    >
                        Test Server Error
                    </button>
                    <button
                        onClick={() => simulateError('processing')}
                        className="px-4 py-2 bg-red-700 text-white rounded"
                    >
                        Test Processing Error
                    </button>
                </div>
            </div>
        </div>
    );
} 