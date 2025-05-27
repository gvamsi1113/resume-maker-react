'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BentoBox from '@/components/ui/BentoBox';
import { Button } from '@/components/ui/button';
import { LargeText, SmallText } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/api/auth';

interface User {
    id: number;
    email: string;
}

export default function Dashboard() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated, logout } = useAuth();

    console.log('[Dashboard Render] isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'User:', user);

    // Redirect if not authenticated
    useEffect(() => {
        console.log('[Dashboard useEffect] Dependencies changed. isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
        if (!isLoading && !isAuthenticated) {
            console.log('[Dashboard useEffect] Redirecting to /login');
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleLogout = async () => {
        try {
            await logoutUser();
            console.log('Successfully initiated logout on backend.');
        } catch (error: any) {
            console.error('Logout API call failed:', error);
            let alertMessage = 'Logout failed. Please try again.';
            if (error.response && error.response.data && error.response.data.detail) {
                alertMessage = `Logout failed: ${error.response.data.detail}`;
            } else if (error.message) {
                alertMessage = `Logout failed: ${error.message}`;
            }
            alert(alertMessage);
        }

        logout();
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // This shouldn't render due to redirect, but just in case
    }

    return (
        <div className="min-h-screen bg-black py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-8">
                    <LargeText className="text-3xl font-bold text-gray-900 mb-2">
                        Dashboard
                    </LargeText>
                    <SmallText className="text-gray-600">
                        Welcome to your Resume Maker dashboard
                    </SmallText>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* User Info Card */}
                    <BentoBox className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">User Information</h3>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                    {user.email.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">User ID</label>
                                <p className="text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                    {user.id}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="text-gray-900 break-all">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </BentoBox>

                    {/* Quick Actions Card */}
                    <BentoBox className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => router.push('/upload')}
                            >
                                Upload Resume
                            </Button>
                            <Button
                                className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                onClick={() => alert('Feature coming soon!')}
                            >
                                Create New Resume
                            </Button>
                            <Button
                                className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                onClick={() => alert('Feature coming soon!')}
                            >
                                View Templates
                            </Button>
                        </div>
                    </BentoBox>

                    {/* Account Settings Card */}
                    <BentoBox className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
                        <div className="space-y-3">
                            <Button
                                className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                onClick={() => alert('Profile settings coming soon!')}
                            >
                                Edit Profile
                            </Button>
                            <Button
                                className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                onClick={() => alert('Settings coming soon!')}
                            >
                                Settings
                            </Button>
                            <Button
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </div>
                    </BentoBox>
                </div>

                {/* Authentication Status */}
                <div className="mt-8">
                    <BentoBox className="p-4 bg-green-50 border-green-200">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                            <SmallText className="text-green-800">
                                ✅ Successfully authenticated with JWT tokens
                            </SmallText>
                        </div>
                    </BentoBox>
                </div>
            </div>
        </div>
    );
} 