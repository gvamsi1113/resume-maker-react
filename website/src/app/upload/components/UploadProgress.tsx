import { AlertCircle, CheckCircle, Loader2, Timer } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';

/**
 * @constant CUSTOM_MESSAGES
 * @description A list of professional, punchy messages displayed during the 'perfecting' phase of the upload.
 * Each message has trailing dots for consistency.
 */
const CUSTOM_MESSAGES: ReadonlyArray<string> = [
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

/**
 * @constant FINALIZING_MESSAGE
 * @description The message displayed when the 'perfecting' phase is about to complete.
 */
const FINALIZING_MESSAGE: string = "Finalizing...";

/**
 * @constant MESSAGE_CHANGE_INTERVAL_MS
 * @description Interval in milliseconds for how long each custom message is displayed during the 'perfecting' phase.
 */
const MESSAGE_CHANGE_INTERVAL_MS: number = 10000; // 10 seconds

/**
 * @constant NUM_CUSTOM_MESSAGES_TO_SHOW
 * @description The number of messages to pick from the shuffled CUSTOM_MESSAGES list to display in sequence.
 */
const NUM_CUSTOM_MESSAGES_TO_SHOW: number = 6;

/**
 * @constant DEFAULT_MESSAGE_COLOR_CLASS
 * @description Default Tailwind CSS classes for non-critical status messages.
 */
const DEFAULT_MESSAGE_COLOR_CLASS: string = 'text-gray-500 text-sm';

/**
 * Props for the {@link UploadProgress} component.
 */
interface UploadProgressProps {
    /** Current progress percentage of the upload (0-100). */
    progress: number;
    /** Optional error object if an error occurred during upload. */
    error?: {
        /** Type of error. */
        type: 'validation' | 'network' | 'server' | 'processing';
        /** Error message to display. */
        message: string;
    };
    /** True if the upload is paused and waiting for CAPTCHA input. */
    isWaitingForCaptcha: boolean;
    /** True if the upload and subsequent processing were successful. */
    isSuccess: boolean;
    /** True if CAPTCHA has been submitted, typically initiating the 'perfecting' phase. */
    captchaSubmitted: boolean;
}

/**
 * Describes the visual state of the progress display, derived by {@link useUploadDisplayLogic}.
 */
interface SimplifiedDisplayState {
    /** The progress value to display in the bar (0-100). */
    displayProgress: number;
    /** Tailwind CSS class for the progress bar's background color. */
    barColorClass: string;
    /** Lucide icon component to display, or null for no icon. */
    IconComponent: React.ElementType | null;
    /** Static message provided by the hook for non-cycling states, or null if messages are cycled. */
    hookMessage: string | null;
    /** Tailwind CSS class for the status message's text color and size. */
    messageColorClass: string;
    /** CSS transition style string for the progress bar's width animation. */
    transitionStyle: string;
    /** True if the component should be in the 'perfecting' state, cycling through custom messages. */
    isPerfectingState: boolean;
}

/**
 * @hook useUploadDisplayLogic
 * @description Determines the visual state for the upload progress display based on input props.
 * This includes progress percentage, colors, icons, messages, and transition styles.
 * @param {UploadProgressProps} params - The current state of the upload (progress, error, captcha status, success).
 * @returns {SimplifiedDisplayState} The derived state object for rendering the progress UI.
 */
const useUploadDisplayLogic = ({ progress, error, isWaitingForCaptcha, isSuccess, captchaSubmitted }: UploadProgressProps): SimplifiedDisplayState => {
    if (error) {
        return {
            displayProgress: 100, // Show full bar on error to make it clear it stopped.
            barColorClass: 'bg-red-500',
            IconComponent: AlertCircle,
            hookMessage: error.message,
            messageColorClass: 'text-red-500 text-sm',
            transitionStyle: 'none', // No transition for error state
            isPerfectingState: false,
        };
    } else if (isSuccess) {
        return {
            displayProgress: 100,
            barColorClass: 'bg-blue-500',
            IconComponent: CheckCircle,
            hookMessage: 'Resume Perfected...',
            messageColorClass: 'text-blue-500 text-sm',
            transitionStyle: 'width 1s ease-in-out',
            isPerfectingState: false,
        };
    } else if (isWaitingForCaptcha) {
        return {
            displayProgress: 20, // Fixed progress while waiting for CAPTCHA
            barColorClass: 'bg-yellow-500',
            IconComponent: Timer,
            hookMessage: 'Waiting for CAPTCHA...',
            messageColorClass: 'text-yellow-600 text-sm',
            transitionStyle: 'width 300ms ease-in-out',
            isPerfectingState: false,
        };
    } else if (captchaSubmitted) { // This is the 'perfecting' state
        return {
            displayProgress: 99, // Progress stays at 99% during message cycling
            barColorClass: 'bg-blue-500',
            IconComponent: Loader2,
            hookMessage: null, // Messages are cycled by the component
            messageColorClass: DEFAULT_MESSAGE_COLOR_CLASS,
            transitionStyle: 'width 100s linear', // Very slow fill for the last 1%
            isPerfectingState: true,
        };
    } else if (progress === 0) {
        return {
            displayProgress: 0,
            barColorClass: 'bg-blue-500',
            IconComponent: null, // No icon or message when progress is 0 and no other state applies
            hookMessage: null,
            messageColorClass: DEFAULT_MESSAGE_COLOR_CLASS,
            transitionStyle: 'width 300ms ease-in-out',
            isPerfectingState: false,
        };
    } else if (progress > 0 && progress < 100) { // Standard processing state
        return {
            displayProgress: progress,
            barColorClass: 'bg-blue-500',
            IconComponent: Loader2,
            hookMessage: 'Processing...',
            messageColorClass: DEFAULT_MESSAGE_COLOR_CLASS,
            transitionStyle: 'width 300ms ease-in-out',
            isPerfectingState: false,
        };
    } else { // Fallback for progress === 100, but not yet isSuccess (e.g., brief moment before FINALIZING_MESSAGE kicks in elsewhere or if isSuccess is delayed)
        return {
            displayProgress: 100,
            barColorClass: 'bg-blue-500',
            IconComponent: Loader2,
            hookMessage: FINALIZING_MESSAGE,
            messageColorClass: DEFAULT_MESSAGE_COLOR_CLASS,
            transitionStyle: 'width 300ms ease-in-out',
            isPerfectingState: false,
        };
    }
};

/**
 * @component UploadProgress
 * @description Displays a progress bar and status messages for the file upload process.
 * It handles various states including waiting for CAPTCHA, active uploading, a 'perfecting' phase
 * with cycling messages, success, and error states.
 * @param {UploadProgressProps} props - Props to control the progress display.
 * @returns {React.ReactElement} The upload progress component.
 */
export function UploadProgress({ progress, error, isWaitingForCaptcha, isSuccess, captchaSubmitted }: UploadProgressProps): React.ReactElement {
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

    const [currentDisplayMessage, setCurrentDisplayMessage] = useState<string | null>(null);
    const messageSequenceRef = useRef<string[]>([]);
    const currentMessageIndexRef = useRef<number>(0);
    const messageIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    useEffect(() => {
        if (isPerfectingState) {
            // Setup message cycling only if not already set up or if it needs to be reset
            if (messageSequenceRef.current.length === 0) {
                const shuffled = [...CUSTOM_MESSAGES].sort(() => 0.5 - Math.random());
                messageSequenceRef.current = [
                    ...shuffled.slice(0, NUM_CUSTOM_MESSAGES_TO_SHOW),
                    FINALIZING_MESSAGE
                ];
                currentMessageIndexRef.current = 0;
                setCurrentDisplayMessage(messageSequenceRef.current[0]);
            }

            // Clear any existing interval before setting a new one to prevent multiple intervals
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);

            messageIntervalRef.current = setInterval(() => {
                currentMessageIndexRef.current += 1;
                if (currentMessageIndexRef.current < messageSequenceRef.current.length) {
                    setCurrentDisplayMessage(messageSequenceRef.current[currentMessageIndexRef.current]);
                } else {
                    // Stay on the last message (FINALIZING_MESSAGE)
                    setCurrentDisplayMessage(messageSequenceRef.current[messageSequenceRef.current.length - 1]);
                    if (messageIntervalRef.current) clearInterval(messageIntervalRef.current); // Stop interval once end is reached
                }
            }, MESSAGE_CHANGE_INTERVAL_MS);

        } else {
            // Not in perfecting state, so clear interval and set static message
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
            messageSequenceRef.current = []; // Reset sequence
            currentMessageIndexRef.current = 0;
            setCurrentDisplayMessage(hookMessage); // Display static message from hook
        }

        // Cleanup function for when the component unmounts or dependencies change
        return () => {
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
        };
    }, [isPerfectingState, hookMessage]); // hookMessage is included to update static message if it changes

    const finalMessageToRender = isPerfectingState ? currentDisplayMessage : hookMessage;

    return (
        <div className="w-full flex flex-col gap-4">
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