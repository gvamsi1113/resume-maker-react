import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { TokenState } from '../types/resume'; // Or a dedicated auth type
import { fetchDemoToken } from '../api/auth';

export function useDemoToken() {
    const [captchaAnswer, setCaptchaAnswer] = useState<string | null>(null);

    const mutation = useMutation<Partial<TokenState>, Error, void, unknown>({
        mutationFn: fetchDemoToken,
        // onSuccess and onError can be handled by the component using the hook
        // or defined here if there's common logic
    });

    const getToken = useCallback(async () => {
        try {
            await mutation.mutateAsync();
        } catch (error) {
            console.error("Error calling getToken mutation:", error);
            throw error;
        }
    }, [mutation]);

    const validateCaptcha = useCallback((answer: string) => {
        setCaptchaAnswer(answer);
    }, []);

    // Combine mutation state with local captchaAnswer
    const tokenState: TokenState = {
        token: mutation.data?.token || null,
        captchaChallenge: mutation.data?.captchaChallenge || null,
        captchaAnswer: captchaAnswer, // User-provided answer
        error: mutation.error?.message || null,
        loading: mutation.isPending,
        isDemo: true, // Assuming this hook is always for demo tokens
    };

    return {
        tokenState,
        getToken,
        validateCaptcha,
        // Expose mutation status if needed directly
        isLoading: mutation.isPending,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        resetMutation: mutation.reset,
    };
} 