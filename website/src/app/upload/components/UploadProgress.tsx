import { AlertCircle, CheckCircle, Loader2, Timer } from 'lucide-react';
import React from 'react';

// Shorter, punchier, professional messages with trailing dots
const CUSTOM_MESSAGES = [
    "Aligning with industry standards...",
    "Optimizing for impact...",
    "Refining key metrics...",
    "Ensuring conciseness...",
    "Verifying content flow...",
    "Cross-referencing best practices...",
    "Polishing for clarity...",
    "Structuring for readability...",
    "Enhancing keyword relevance...",
    "Checking for consistency..."
];

const FINALIZING_MESSAGE = "Finalizing..."; // Already has dots, but ensure it's used consistently
const MESSAGE_CHANGE_INTERVAL_MS = 10000; // 10 seconds
const NUM_CUSTOM_MESSAGES_TO_SHOW = 6;

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
    hookMessage: string | null;
    messageColorClass: string;
    transitionStyle: string;
    isPerfectingState: boolean;
}

const useUploadDisplayLogic = ({ progress, error, isWaitingForCaptcha, isSuccess, captchaSubmitted }: UseUploadProgressParams): SimplifiedDisplayState => {
    if (error) {
        return {
            displayProgress: 100,
            barColorClass: 'bg-red-500',
            IconComponent: AlertCircle,
            hookMessage: error.message, // Assuming error messages don't need trailing dots from here
            messageColorClass: 'text-red-500 text-sm',
            transitionStyle: 'none',
            isPerfectingState: false,
        };
    } else if (isSuccess) {
        return {
            displayProgress: 100,
            barColorClass: 'bg-blue-500',
            IconComponent: CheckCircle,
            hookMessage: 'Resume Perfected...', // Added trailing dots for consistency
            messageColorClass: 'text-blue-500 text-sm',
            transitionStyle: 'width 1s ease-in-out',
            isPerfectingState: false,
        };
    } else if (isWaitingForCaptcha) {
        return {
            displayProgress: 20,
            barColorClass: 'bg-yellow-500',
            IconComponent: Timer,
            hookMessage: 'Waiting for CAPTCHA...',
            messageColorClass: 'text-yellow-600 text-sm',
            transitionStyle: 'width 300ms ease-in-out',
            isPerfectingState: false,
        };
    } else if (captchaSubmitted) {
        return {
            displayProgress: 99,
            barColorClass: 'bg-blue-500',
            IconComponent: Loader2,
            hookMessage: null, // Component will manage cycling messages with dots
            messageColorClass: 'text-gray-500 text-sm',
            transitionStyle: 'width 100s linear',
            isPerfectingState: true,
        };
    } else if (progress === 0) {
        return {
            displayProgress: 0,
            barColorClass: 'bg-blue-500',
            IconComponent: null,
            hookMessage: null,
            messageColorClass: 'text-gray-500 text-sm',
            transitionStyle: 'width 300ms ease-in-out',
            isPerfectingState: false,
        };
    } else if (progress > 0 && progress < 100) {
        return {
            displayProgress: progress,
            barColorClass: 'bg-blue-500',
            IconComponent: Loader2,
            hookMessage: 'Processing...',
            messageColorClass: 'text-gray-500 text-sm',
            transitionStyle: 'width 300ms ease-in-out',
            isPerfectingState: false,
        };
    } else {
        // This default fallback for 100% progress might coincide with FINALIZING_MESSAGE
        // or be a very brief state before isSuccess. hookMessage here is 'Finalizing...'
        return {
            displayProgress: 100,
            barColorClass: 'bg-blue-500',
            IconComponent: Loader2,
            hookMessage: FINALIZING_MESSAGE, // Use the constant
            messageColorClass: 'text-gray-500 text-sm',
            transitionStyle: 'width 300ms ease-in-out',
            isPerfectingState: false,
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
        hookMessage,
        messageColorClass,
        transitionStyle,
        isPerfectingState
    } = useUploadDisplayLogic({
        progress,
        error,
        isWaitingForCaptcha,
        isSuccess,
        captchaSubmitted
    });

    const [currentDisplayMessage, setCurrentDisplayMessage] = React.useState<string | null>(null);
    const messageSequenceRef = React.useRef<string[]>([]);
    const currentMessageIndexRef = React.useRef<number>(0);
    const messageIntervalRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

    React.useEffect(() => {
        if (isPerfectingState) {
            if (messageSequenceRef.current.length === 0) {
                const shuffled = [...CUSTOM_MESSAGES].sort(() => 0.5 - Math.random());
                messageSequenceRef.current = [
                    ...shuffled.slice(0, NUM_CUSTOM_MESSAGES_TO_SHOW),
                    FINALIZING_MESSAGE // This constant should already have dots
                ];
                currentMessageIndexRef.current = 0;
                setCurrentDisplayMessage(messageSequenceRef.current[0]);
            }

            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);

            messageIntervalRef.current = setInterval(() => {
                currentMessageIndexRef.current += 1;
                if (currentMessageIndexRef.current < messageSequenceRef.current.length) {
                    setCurrentDisplayMessage(messageSequenceRef.current[currentMessageIndexRef.current]);
                } else {
                    setCurrentDisplayMessage(messageSequenceRef.current[messageSequenceRef.current.length - 1]); // Stay on Finalizing
                    if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
                }
            }, MESSAGE_CHANGE_INTERVAL_MS);

        } else {
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
            messageSequenceRef.current = [];
            currentMessageIndexRef.current = 0;
            setCurrentDisplayMessage(hookMessage);
        }

        return () => {
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
        };
    }, [isPerfectingState, hookMessage]);

    const finalMessageToRender = isPerfectingState ? currentDisplayMessage : hookMessage;

    return (
        <div className="w-full flex flex-col gap-[1rem]">
            {IconComponent && finalMessageToRender && (
                <div className={`flex items-center gap-2 ${messageColorClass}`}>
                    <IconComponent
                        size={16}
                        className={IconComponent === Loader2 ? 'animate-spin' : ''}
                    />
                    <span>{finalMessageToRender}</span>
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