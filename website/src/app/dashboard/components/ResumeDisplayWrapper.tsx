'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import BentoBox from '@/components/ui/BentoBox';
import { Button } from '@/components/ui/button';
import { LargeText, SmallText } from '@/components/ui/Typography';
import ResumeView from '../../upload/components/ResumeView';
import { type EnhancedResumeData, type ResumeResponse } from '@/types/resume';

// Helper component to display resume data
export const ResumeDisplay = ({ resumeResponse, title, message }: { resumeResponse: ResumeResponse, title: string, message: string }) => {
    if (!resumeResponse.enhanced_resume_data) return null;
    return (
        <BentoBox>
            <LargeText as="h2">{title}</LargeText>
            <div className="h-[600px] overflow-y-auto border border-gray-200 rounded-md">
                <ResumeView resumeData={resumeResponse} />
            </div>
            {message && <SmallText>{message}</SmallText>}
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
    router: ReturnType<typeof useRouter>;
}

const ResumeDisplayWrapper = ({ user, contextResumeData, fetchedBaseResumeData, baseResumeIsLoading, baseResumeIsError, baseResumeFetchError, isAuthenticated, router }: ResumeDisplayWrapperProps) => {
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
            <BentoBox>
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
        resumeContent = (
            <BentoBox>
                <LargeText as="h2" className="text-red-600">Error Loading Base Resume</LargeText>
                <SmallText className="text-red-500">
                    {baseResumeFetchError?.message || "Could not fetch your base resume."}
                </SmallText>
                <SmallText>
                    You might not have a base resume yet. Try uploading one, or it will be created when you save your first resume.
                </SmallText>
            </BentoBox>
        );
    } else if (isAuthenticated && !contextResumeData?.enhanced_resume_data && !baseResumeIsLoading) {
        resumeContent = (
            <BentoBox>
                <LargeText as="h2">Welcome, {user?.email?.split('@')[0]}!</LargeText>
                <SmallText>
                    No active resume draft or base resume found.
                    Please <Button onClick={() => router.push('/upload')} className="p-0 h-auto inline"><SmallText className="text-blue-600 hover:underline">upload an existing resume</SmallText></Button> or create a new one to get started.
                </SmallText>
            </BentoBox>
        );
    }
    return <BentoBox>{resumeContent}</BentoBox>;
};

export default ResumeDisplayWrapper; 