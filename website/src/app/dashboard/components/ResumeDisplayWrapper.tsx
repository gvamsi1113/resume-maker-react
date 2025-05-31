'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import BentoBox from '@/components/ui/BentoBox';
import { Button } from '@/components/ui/button';
import { LargeText, SmallText } from '@/components/ui/Typography';
import ResumeView from '../../upload/components/ResumeView';
import { type EnhancedResumeData, type ResumeResponse } from '@/types/resume';
import { DashboardResumeUpload } from './DashboardResumeUpload';

// Helper component to display resume data
export const ResumeDisplay = ({ resumeResponse, title, message }: { resumeResponse: ResumeResponse, title: string, message: string }) => {
    if (!resumeResponse.enhanced_resume_data) return null;
    return (
        <BentoBox className="p-0 bg-transparent gap-0">
            <BentoBox className="flex flex-row w-full justify-between bg-transparent">
                <LargeText as="h2">{title}</LargeText>
                {message && <SmallText>{message}</SmallText>}
            </BentoBox>
            <ResumeView resumeData={resumeResponse} />
        </BentoBox>
    );
};

interface ResumeDisplayWrapperProps {
    user: any; // Consider using a more specific type for user
    contextResumeData: ResumeResponse | null;
    fetchedBaseResumeData: EnhancedResumeData | undefined;
    baseResumeIsLoading: boolean;
    baseResumeIsError: boolean;
    baseResumeFetchError: Error | null;
    isAuthenticated: boolean;
}

const ResumeDisplayWrapper = ({
    user,
    contextResumeData,
    fetchedBaseResumeData,
    baseResumeIsLoading,
    baseResumeIsError,
    baseResumeFetchError,
    isAuthenticated,
}: ResumeDisplayWrapperProps) => {
    const queryClient = useQueryClient();

    const handleUploadSuccess = (data: ResumeResponse) => {
        console.log('Dashboard upload successful:', data);
        queryClient.invalidateQueries({ queryKey: ['baseResume', user?.id] });
    };

    const handleUploadError = (error: Error) => {
        console.error('Dashboard upload failed:', error);
    };

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
            <BentoBox className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <SmallText>Loading your base resume...</SmallText>
            </BentoBox>
        );
    } else if (fetchedBaseResumeData) {
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
        const isNotFoundError = (baseResumeFetchError as any)?.response?.status === 404 ||
            baseResumeFetchError?.message?.toLowerCase().includes('not found');

        if (isNotFoundError) {
            // If no base resume, show the uploader
            resumeContent = (
                <BentoBox className="flex flex-col items-center justify-center h-full p-4">
                    <DashboardResumeUpload
                        onUploadSuccess={handleUploadSuccess}
                        onUploadError={handleUploadError}
                    />
                </BentoBox>
            );
        } else {
            resumeContent = (
                <BentoBox className="flex flex-col items-center justify-center h-full">
                    <LargeText as="h2" className="text-red-600">Error Loading Base Resume</LargeText>
                    <SmallText className="text-red-500">
                        {baseResumeFetchError?.message || "Could not fetch your base resume."}
                    </SmallText>
                    <SmallText>
                        Please try again later or contact support if the issue persists.
                        <Button
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['baseResume', user?.id] })}
                            className="p-0 h-auto inline align-baseline bg-transparent hover:bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 ml-1"
                        >
                            <SmallText className="text-blue-600 hover:underline">Try again</SmallText>
                        </Button>
                    </SmallText>
                </BentoBox>
            );
        }
    } else if (isAuthenticated && !contextResumeData?.enhanced_resume_data && !baseResumeIsLoading) {
        resumeContent = (
            <BentoBox className="flex flex-col items-center justify-center h-full p-4">
                <LargeText as="h2" className="mb-4">Welcome, {user?.email?.split('@')[0]}!</LargeText>
                <DashboardResumeUpload
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                />
            </BentoBox>
        );
    }
    return <>{resumeContent}</>;
};

export default ResumeDisplayWrapper; 