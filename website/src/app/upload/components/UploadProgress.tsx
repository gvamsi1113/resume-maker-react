import { AlertCircle, CheckCircle, Loader2, Timer } from 'lucide-react';
import React from 'react';

interface UploadProgressProps {
    progress: number;
    error?: {
        type: 'validation' | 'network' | 'server' | 'processing';
        message: string;
    };
    isWaitingForCaptcha: boolean;
    isSuccess: boolean;
    captchaSubmitted: boolean;
}

interface UseUploadProgressParams {
    progress: number;
    error?: UploadProgressProps['error'];
    isWaitingForCaptcha: boolean;
    isSuccess: boolean;
    captchaSubmitted: boolean;
}

interface SimplifiedDisplayState {
    displayProgress: number;
    barColorClass: string;
    IconComponent: React.ElementType | null;
    message: string | null;
    messageColorClass: string;
    transitionStyle: string;
}

const useUploadDisplayLogic = ({ progress, error, isWaitingForCaptcha, isSuccess, captchaSubmitted }: UseUploadProgressParams): SimplifiedDisplayState => {
    if (error) {
        return {
            displayProgress: 100,
            barColorClass: 'bg-red-500',
            IconComponent: AlertCircle,
            message: error.message,
            messageColorClass: 'text-red-500 text-sm',
            transitionStyle: 'none',
        };
    } else if (isSuccess) {
        return {
            displayProgress: 100,
            barColorClass: 'bg-blue-500',
            IconComponent: CheckCircle,
            message: 'Resume Perfected',
            messageColorClass: 'text-blue-500 text-sm',
            transitionStyle: 'width 1s ease-in-out',
        };
    } else if (isWaitingForCaptcha) {
        return {
            displayProgress: 20,
            barColorClass: 'bg-yellow-500',
            IconComponent: Timer,
            message: 'Waiting for CAPTCHA...',
            messageColorClass: 'text-yellow-600 text-sm',
            transitionStyle: 'width 300ms ease-in-out',
        };
    } else if (captchaSubmitted) {
        return {
            displayProgress: 99,
            barColorClass: 'bg-blue-500',
            IconComponent: Loader2,
            message: 'Perfecting...',
            messageColorClass: 'text-gray-500 text-sm',
            transitionStyle: 'width 100s linear',
        };
    } else if (progress === 0) {
        return {
            displayProgress: 0,
            barColorClass: 'bg-blue-500',
            IconComponent: null,
            message: null,
            messageColorClass: 'text-gray-500 text-sm',
            transitionStyle: 'width 300ms ease-in-out',
        };
    } else if (progress > 0 && progress < 100) {
        return {
            displayProgress: progress,
            barColorClass: 'bg-blue-500',
            IconComponent: Loader2,
            message: 'Processing...',
            messageColorClass: 'text-gray-500 text-sm',
            transitionStyle: 'width 300ms ease-in-out',
        };
    } else {
        return {
            displayProgress: 100,
            barColorClass: 'bg-blue-500',
            IconComponent: Loader2,
            message: 'Finalizing...',
            messageColorClass: 'text-gray-500 text-sm',
            transitionStyle: 'width 300ms ease-in-out',
        };
    }
};

/**
 * Component for displaying upload progress
 * @param {UploadProgressProps} props - Component props
 * @returns {JSX.Element} The upload progress component
 */
export function UploadProgress({ progress, error, isWaitingForCaptcha, isSuccess, captchaSubmitted }: UploadProgressProps) {
    const {
        displayProgress,
        barColorClass,
        IconComponent,
        message,
        messageColorClass,
        transitionStyle
    } = useUploadDisplayLogic({
        progress,
        error,
        isWaitingForCaptcha,
        isSuccess,
        captchaSubmitted
    });

    return (
        <div className="w-full flex flex-col gap-[1rem]">
            {IconComponent && message && (
                <div className={`flex items-center gap-2 ${messageColorClass}`}>
                    <IconComponent
                        size={16}
                        className={IconComponent === Loader2 ? 'animate-spin' : ''}
                    />
                    <span>{message}</span>
                </div>
            )}
            <div className="h-2 w-full bg-[var(--color-gray-medium)]/20 rounded-full overflow-hidden">
                <div
                    className={`h-full ${barColorClass}`}
                    style={{
                        width: `${displayProgress}%`,
                        transition: transitionStyle
                    }}
                />
            </div>
        </div>
    );
} 