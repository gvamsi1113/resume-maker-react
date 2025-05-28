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
import { registerUser } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';

// Zod validation schema
const registrationSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/,
            'Your password must be between 8 and 16 characters long and include at least one uppercase letter, one lowercase letter, one number, and one symbol'
        ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeToTerms: z.boolean().refine(val => val === true, {
        message: 'Please accept the terms and conditions to continue',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type FormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
    resumeData?: any;
}

export default function RegistrationForm({ resumeData }: RegistrationFormProps) {
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, touchedFields, dirtyFields, isSubmitted },
    } = useForm<FormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            email: resumeData?.email || '',
            password: '',
            confirmPassword: '',
            agreeToTerms: false,
        },
        mode: 'onTouched', // Validate when field loses focus
    });

    const onSubmit = async (data: FormData) => {
        try {
            const response = await registerUser({
                email: data.email,
                password1: data.password,
                password2: data.confirmPassword,
            });

            console.log('Registration successful:', response);

            // Use the auth hook to handle login
            if (response.user && response.access) {
                const tokensForAuthHook = {
                    access: response.access,
                    // refresh token is handled by HttpOnly cookie
                };
                const userForAuthHook = {
                    id: response.user.pk,
                    email: response.user.email
                };
                login(userForAuthHook, tokensForAuthHook);
            } else {
                console.error("Registration API response missing user or access token:", response);
                alert("Registration completed, but auto-login failed. Please try logging in manually.");
                setIsSuccess(false);
                return;
            }

            // Show success state
            setIsSuccess(true);

            // Wait 1 second then redirect to dashboard
            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);

        } catch (error: any) {
            console.error('Registration failed:', error);

            // Handle specific error messages from the backend
            if (error.data) {
                const errorData = error.data;
                if (errorData.email) {
                    alert(`Email error: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`);
                } else if (errorData.password) {
                    alert(`Password error: ${Array.isArray(errorData.password) ? errorData.password[0] : errorData.password}`);
                } else if (errorData.confirmPassword) {
                    alert(`Password confirmation error: ${Array.isArray(errorData.confirmPassword) ? errorData.confirmPassword[0] : errorData.confirmPassword}`);
                } else {
                    alert('Registration failed. Please check your information and try again.');
                }
            } else {
                alert('Registration failed. Please check your connection and try again.');
            }
        }
    };

    // Helper function to determine if error should be shown
    const shouldShowError = (fieldName: keyof FormData) => {
        const hasError = errors[fieldName];
        const isTouched = touchedFields[fieldName];
        const isDirty = dirtyFields[fieldName];

        // Show error if form was submitted OR (field is dirty AND touched)
        return hasError && (isSubmitted || (isDirty && isTouched));
    };

    return (
        <BentoBox className="flex flex-col p-6 md:p-8 gap-6 max-w-md w-full !items-stretch !text-left bg-black h-full">
            <div>
                <LargeText className="text-[2rem] text-center">
                    Create Account
                </LargeText>
                <SmallText className="text-center">
                    Please fill your details to <span className="text-gray-600">Register for Free</span>.
                </SmallText>
            </div>

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

                <FormField
                    id="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    placeholder="••••••••"
                    register={register('confirmPassword')}
                    error={shouldShowError('confirmPassword') ? errors.confirmPassword?.message : undefined}
                />

                <FormField
                    id="agreeToTerms"
                    type="checkbox"
                    label="Terms and Conditions"
                    register={register('agreeToTerms')}
                    error={shouldShowError('agreeToTerms') ? errors.agreeToTerms?.message : undefined}
                    className="pl-1 pt-2 m-0"
                >
                    I have read and agree to the{' '}
                    <a href="/terms" className="text-blue-500 hover:underline">
                        Terms and Conditions
                    </a>
                </FormField>

                <Button
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
                >
                    {isSuccess ? 'Account created' : isSubmitting ? 'Creating Account...' : 'Register'}
                </Button>
            </form>
        </BentoBox>
    );
} 