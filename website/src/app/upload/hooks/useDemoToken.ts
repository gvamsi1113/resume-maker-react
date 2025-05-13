import { useState, useCallback } from 'react';
import { TokenState } from '../types';

const TOKEN_API_URL = 'http://localhost:8000/api/onboard/get-demo-token/';

export function useDemoToken() {
    console.log('useDemoToken hook initialized');
    const [tokenState, setTokenState] = useState<TokenState>({
        token: null,
        captchaChallenge: null,
        captchaAnswer: null,
        error: null,
        loading: false
    });

    const getToken = useCallback(async () => {
        console.log('getToken called');
        setTokenState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await fetch(TOKEN_API_URL, {
                method: 'POST'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get token');
            }

            const data = await response.json();
            console.log('getToken response:', data);
            setTokenState({
                token: data.token,
                captchaChallenge: data.captcha_challenge,
                captchaAnswer: null,
                error: null,
                loading: false
            });
        } catch (error) {
            setTokenState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to get token',
                loading: false
            }));
        }
    }, []);

    const validateCaptcha = useCallback((answer: string) => {
        console.log('validateCaptcha called with answer:', answer);
        setTokenState(prev => ({
            ...prev,
            captchaAnswer: answer
        }));
    }, []);

    return {
        tokenState,
        getToken,
        validateCaptcha
    };
} 