'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import BentoBox from '@/components/ui/BentoBox';
import { Button } from '@/components/ui/button';
import { LargeText, SmallText } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/api/auth';
import { getBaseResume } from '@/api/resume';
import { useResumeData } from '@/context/ResumeDataContext';
import ResumeView from '../upload/components/ResumeView';
import { type EnhancedResumeData, type ResumeResponse } from '@/types/resume';

// Helper component to display resume data
const ResumeDisplay = ({ resumeResponse, title, message }: { resumeResponse: ResumeResponse, title: string, message: string }) => {
    if (!resumeResponse.enhanced_resume_data) return null;
    return (
        <BentoBox className="p-6 mb-8 w-full">
            <LargeText as="h2" className="mb-4 text-xl font-semibold text-gray-900">{title}</LargeText>
            <div className="h-[500px] overflow-y-auto border border-gray-300 rounded-md">
                <ResumeView resumeData={resumeResponse} />
            </div>
            <SmallText className="mt-2 text-sm text-gray-500">{message}</SmallText>
        </BentoBox>
    );
};

export default function Dashboard() {
    const router = useRouter();
    const { user, isLoading: authIsLoading, isAuthenticated, logout } = useAuth();
    const { resumeData: contextResumeData } = useResumeData(); // We only read from context here

    // Fetch Base Resume only if context is empty and user is authenticated
    const {
        data: fetchedBaseResumeData,
        isLoading: baseResumeIsLoading,
        isError: baseResumeIsError,
        error: baseResumeFetchError
    } = useQuery<EnhancedResumeData, Error>({
        queryKey: ['baseResume', user?.id],
        queryFn: getBaseResume,
        enabled: !contextResumeData?.enhanced_resume_data && !!user && isAuthenticated, // Key condition here
        staleTime: 1000 * 60 * 15, // Cache for 15 minutes
    });

    useEffect(() => {
        if (!authIsLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authIsLoading, isAuthenticated, router]);

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error: any) {
            console.error('Logout API call failed:', error);
            alert(error.message || 'Logout failed. Please try again.');
        }
        logout();
        router.push('/');
    };

    if (authIsLoading) {
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
        // This state should ideally be handled by the redirect in useEffect,
        // but as a fallback or during transition:
        return (
            <div className="min-h-screen w-full bg-black flex items-center justify-center">
                <SmallText>Redirecting to login...</SmallText>
            </div>
        );
    }

    // Determine what to render for resume display
    let resumeContent = null;
    if (contextResumeData?.enhanced_resume_data) {
        resumeContent = (
            <ResumeDisplay
                resumeResponse={contextResumeData}
                title="Your Current Resume Draft"
                message="This is the resume data currently loaded from your previous session or upload."
            />
        );
    } else if (baseResumeIsLoading) {
        resumeContent = (
            <BentoBox className="p-6 mb-8 w-full text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <SmallText>Loading your base resume...</SmallText>
            </BentoBox>
        );
    } else if (fetchedBaseResumeData) {
        // Construct a ResumeResponse-like object for ResumeView
        const baseResumeForView: ResumeResponse = {
            enhanced_resume_data: fetchedBaseResumeData,
            message: "Base resume loaded successfully."
        };
        resumeContent = (
            <ResumeDisplay
                resumeResponse={baseResumeForView}
                title="Your Base Resume"
                message="This is your primary resume stored on our servers."
            />
        );
    } else if (baseResumeIsError) {
        resumeContent = (
            <BentoBox className="p-6 mb-8 w-full">
                <LargeText as="h2" className="mb-4 text-xl font-semibold text-red-600">Error Loading Base Resume</LargeText>
                <SmallText className="text-red-500">
                    {baseResumeFetchError?.message || "Could not fetch your base resume."}
                </SmallText>
                <SmallText className="mt-2">
                    You might not have a base resume yet. Try uploading one, or it will be created when you save your first resume.
                </SmallText>
            </BentoBox>
        );
    } else if (isAuthenticated && !contextResumeData?.enhanced_resume_data && !baseResumeIsLoading) {
        // Authenticated, no context data, not loading base, and base not found (implies initial state or explicit 404)
        resumeContent = (
            <BentoBox className="p-6 mb-8 w-full">
                <LargeText as="h2" className="mb-4 text-xl font-semibold text-gray-900">Welcome!</LargeText>
                <SmallText>
                    No active resume draft or base resume found.
                    Please <Button onClick={() => router.push('/upload')} className="p-0 h-auto text-base text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500">upload an existing resume</Button> or create a new one to get started.
                </SmallText>
            </BentoBox>
        );
    }

    return (
        <div className="min-h-screen bg-black py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-8">
                    <LargeText className="text-3xl font-bold text-gray-900 mb-2">
                        Dashboard
                    </LargeText>
                    <SmallText className="text-gray-600">
                        Welcome {user.email} to your Resume Maker dashboard
                    </SmallText>
                </div>

                {resumeContent}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
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
            </div>
        </div>
    );
} 