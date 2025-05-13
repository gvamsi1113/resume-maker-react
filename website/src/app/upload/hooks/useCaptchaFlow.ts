import { useState, useEffect } from 'react';
import { TokenState } from '../types';

interface UseCaptchaFlowProps {
    tokenState: TokenState;
    file: File | null;
    uploading: boolean;
}

/**
 * Custom hook for handling captcha flow state
 * @param {UseCaptchaFlowProps} props - Hook props
 * @returns {Object} Captcha flow state
 */
export function useCaptchaFlow({
    tokenState,
    file,
    uploading
}: UseCaptchaFlowProps) {
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    useEffect(() => {
        // If we're already uploading, don't show captcha
        if (uploading) {
            setShowCaptcha(false);
            return;
        }

        // If captcha has been answered, hide captcha and clear pending file
        if (pendingFile && tokenState.captchaAnswer) {
            setShowCaptcha(false);
            setPendingFile(null);
            return;
        }

        // If we have a file with a token and captcha challenge but no answer, show captcha
        if (
            file && 
            tokenState.token && 
            tokenState.captchaChallenge && 
            !tokenState.captchaAnswer && 
            !showCaptcha
        ) {
            setShowCaptcha(true);
            setPendingFile(file);
            return;
        }
    }, [
        file, 
        tokenState.token, 
        tokenState.captchaChallenge, 
        tokenState.captchaAnswer, 
        uploading,
        showCaptcha,
        pendingFile
    ]);

    return {
        showCaptcha,
        pendingFile
    };
} 