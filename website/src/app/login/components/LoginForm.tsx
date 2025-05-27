'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import BentoBox from '@/components/ui/BentoBox';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/FormField';
import { LargeText, SmallText } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import { loginUser } from '@/api/auth';

// Zod validation schema
const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, touchedFields, dirtyFields, isSubmitted },
    } = useForm<FormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onTouched', // Validate when field loses focus
    });

    const onSubmit = async (data: FormData) => {
        setError(null); // Clear previous errors
        try {
            const response = await loginUser({ // Using the actual login API call
                email: data.email,
                password: data.password,
            });

            console.log('Login successful:', response);

            // The loginUser response now includes a top-level 'user' object and a nested 'tokens' object.
            // The backend now only returns the access token in tokens.refresh, refresh is in an HttpOnly cookie.
            // The useAuth().login() function expects (user, tokens) where tokens contains at least .access.

            if (response.user && response.tokens && response.tokens.access) {
                login(response.user, response.tokens);
            } else {
                console.error("Login API response missing user, tokens, or tokens.access:", response);
                setError("Login failed: Unexpected response from server.");
                setIsSuccess(false);
                return;
            }

            setIsSuccess(true);

            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);

        } catch (err: any) {
            console.error('Login failed (raw error object):', err);
            // Default generic error message
            let errorMessage = 'Invalid email or password. Please try again.';

            if (err.data && typeof err.data.detail === 'string') {
                // Attempt to extract specific message from string like: "{'non_field_errors': [ErrorDetail(string='Message here', code='auth')]}"
                const match = err.data.detail.match(/ErrorDetail\(string='([^']*)'/);
                if (match && match[1]) {
                    errorMessage = match[1]; // Use the specific message from backend
                }
                // If regex doesn't match, we stick with the generic errorMessage set above,
                // as err.data.detail itself would be the verbose string.
            } else if (err.data && err.data.detail && typeof err.data.detail === 'object') {
                // Fallback for cases where err.data.detail might be an object (less likely now)
                if (err.data.detail.non_field_errors && Array.isArray(err.data.detail.non_field_errors) && err.data.detail.non_field_errors.length > 0) {
                    const errorDetailEntry = err.data.detail.non_field_errors[0];
                    if (typeof errorDetailEntry === 'object' && errorDetailEntry !== null && 'string' in errorDetailEntry) {
                        errorMessage = errorDetailEntry.string;
                    } else if (typeof errorDetailEntry === 'string') {
                        errorMessage = errorDetailEntry;
                    }
                } else if (typeof err.data.detail === 'string') {
                    errorMessage = err.data.detail; // Should be caught by the first if, but as a safe fallback.
                }
            } else if (err.message && typeof err.message === 'string' && !err.message.toLowerCase().includes('fetch')) {
                // Use err.message if it's not a generic fetch error and more specific
                errorMessage = err.message;
            }

            console.error('Processed error message to display:', errorMessage);
            setError(errorMessage);
        }
    };

    const shouldShowError = (fieldName: keyof FormData) => {
        const hasError = errors[fieldName];
        const isTouched = touchedFields[fieldName];
        const isDirty = dirtyFields[fieldName];
        return hasError && (isSubmitted || (isDirty && isTouched));
    };

    return (
        <BentoBox className="flex flex-col p-6 md:p-8 gap-6 max-w-md w-full !items-stretch !text-left bg-black h-full">
            <div>
                <LargeText className="text-[2rem] text-center">
                    Login
                </LargeText>
                <SmallText className="text-center">
                    Welcome back! Please enter your details.
                </SmallText>
            </div>

            {error && (
                <SmallText className="text-center text-red-500">
                    {error}
                </SmallText>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <FormField
                    id="email"
                    type="email"
                    label="Email"
                    placeholder="you@example.com"
                    register={register('email')}
                    error={shouldShowError('email') ? errors.email?.message : undefined}
                />

                <FormField
                    id="password"
                    type="password"
                    label="Password"
                    placeholder="••••••••"
                    register={register('password')}
                    error={shouldShowError('password') ? errors.password?.message : undefined}
                />

                <Button
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
                >
                    {isSuccess ? 'Logged In!' : isSubmitting ? 'Logging In...' : 'Login'}
                </Button>
            </form>
            <SmallText className="text-center mt-4">
                Don't have an account?{' '}
                <a href="/register" className="text-blue-500 hover:underline">
                    Register here
                </a>
            </SmallText>
        </BentoBox>
    );
} 