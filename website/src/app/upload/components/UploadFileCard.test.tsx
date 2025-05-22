import React from 'react';
import { UploadFileCard } from './UploadFileCard';

/**
 * @component UploadFileCardTest
 * @description A test harness component for manually testing the {@link UploadFileCard}.
 * It provides UI controls to simulate different upload states such as progress and various error types.
 * @remarks This component is intended for visual inspection and manual interaction during development.
 * Note: This harness currently does not provide controls for `isWaitingForCaptcha`, `captchaSubmitted`, or `isSuccess` props of `UploadFileCard`.
 * @returns {React.ReactElement} The test harness UI.
 */
export function UploadFileCardTest(): React.ReactElement {
    const [progress, setProgress] = React.useState(0);
    const [error, setError] = React.useState<{
        type: 'validation' | 'network' | 'server' | 'processing';
        message: string;
    } | undefined>(undefined);
    const [isSuccess, setIsSuccess] = React.useState(false); // Added for completeness, though not fully controlled
    const [isWaitingForCaptcha, setIsWaitingForCaptcha] = React.useState(false);
    const [captchaSubmitted, setCaptchaSubmitted] = React.useState(false);


    // Test file
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    /**
     * Simulates different error scenarios for the UploadFileCard.
     * @param {('validation' | 'network' | 'server' | 'processing')} type - The type of error to simulate.
     */
    const simulateError = (type: 'validation' | 'network' | 'server' | 'processing') => {
        const errorMessages = {
            validation: 'File type not supported. Please upload PDF, DOCX, or TXT.',
            network: 'Network error. Please check your connection.',
            server: 'Server error. Please try again later.',
            processing: 'Failed to process file. Please try a different file.'
        };
        setError({ type, message: errorMessages[type] });
        setProgress(0); // Reset progress on error
        setIsSuccess(false);
        setIsWaitingForCaptcha(false);
        setCaptchaSubmitted(false);
    };

    /**
     * Simulates the upload progress for the UploadFileCard.
     * Resets errors and starts a progress interval from 0 to 100.
     */
    const simulateProgress = () => {
        setProgress(0);
        setError(undefined);
        setIsSuccess(false);
        setIsWaitingForCaptcha(false);
        setCaptchaSubmitted(false);
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 10;
            if (currentProgress >= 100) {
                setProgress(100);
                clearInterval(interval);
                // setIsSuccess(true); // Optionally set success after progress for full simulation
            } else {
                setProgress(currentProgress);
            }
        }, 200); // Faster interval for testing
    };

    const handleCancel = () => {
        setProgress(0);
        setError(undefined);
        setIsSuccess(false);
        setIsWaitingForCaptcha(false);
        setCaptchaSubmitted(false);
        // Potentially clear any running intervals if simulateProgress was active
    };

    // Added basic controls for other states for more thorough manual testing
    const toggleSuccess = () => {
        setIsSuccess(s => !s);
        if (!isSuccess) { // If becoming true, reset other conflicting states
            setProgress(100); // Typically success is at 100%
            setError(undefined);
            setIsWaitingForCaptcha(false);
            setCaptchaSubmitted(false);
        }
    };

    const toggleWaitingForCaptcha = () => {
        setIsWaitingForCaptcha(w => !w);
        if (!isWaitingForCaptcha) {
            setError(undefined);
            // setProgress(20); // As per UploadProgress logic
        }
    };

    const toggleCaptchaSubmitted = () => {
        setCaptchaSubmitted(cs => !cs);
        if (!captchaSubmitted) {
            setError(undefined);
            // setProgress(99); // As per UploadProgress logic
        }
    };


    return (
        <div className="p-4 space-y-4 bg-gray-100 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">UploadFileCard Test Harness</h2>
            <UploadFileCard
                file={testFile}
                progress={progress}
                onCancel={handleCancel}
                error={error}
                isSuccess={isSuccess}
                isWaitingForCaptcha={isWaitingForCaptcha}
                captchaSubmitted={captchaSubmitted}
            />

            <div className="space-y-3 p-3 bg-gray-50 rounded border border-gray-200">
                <h3 className="font-medium text-gray-600">Test Controls:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <button
                        onClick={simulateProgress}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                    >
                        Simulate Upload
                    </button>
                    <button
                        onClick={toggleSuccess}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                    >
                        Toggle Success (Currently: {isSuccess ? 'ON' : 'OFF'})
                    </button>
                    <button
                        onClick={toggleWaitingForCaptcha}
                        className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded text-sm transition-colors"
                    >
                        Toggle Waiting Captcha (Currently: {isWaitingForCaptcha ? 'ON' : 'OFF'})
                    </button>
                    <button
                        onClick={toggleCaptchaSubmitted}
                        className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm transition-colors"
                    >
                        Toggle Captcha Submitted (Currently: {captchaSubmitted ? 'ON' : 'OFF'})
                    </button>
                    <button
                        onClick={() => simulateError('validation')}
                        className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm transition-colors"
                    >
                        Test Validation Error
                    </button>
                    <button
                        onClick={() => simulateError('network')}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                    >
                        Test Network Error
                    </button>
                    <button
                        onClick={() => simulateError('server')}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                    >
                        Test Server Error
                    </button>
                    <button
                        onClick={() => simulateError('processing')}
                        className="px-3 py-2 bg-red-700 hover:bg-red-800 text-white rounded text-sm transition-colors"
                    >
                        Test Processing Error
                    </button>
                </div>
            </div>
        </div>
    );
} 