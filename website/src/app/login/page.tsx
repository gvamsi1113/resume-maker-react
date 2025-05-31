'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from './components/LoginForm';

export default function LoginPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || isAuthenticated) {
        // You might want to show a loader here or return null
        return null; // Or a loading spinner
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <LoginForm />
        </div>
    );
} 