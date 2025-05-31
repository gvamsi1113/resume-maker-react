'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SmallText } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/api/auth';
import { getBaseResume } from '@/api/resume';
import { useResumeData } from '@/context/ResumeDataContext';
import { type EnhancedResumeData } from '@/types/resume';
import ResumeDisplayWrapper from './components/ResumeDisplayWrapper';
import RecentApplications from './components/RecentApplications';
import Header from './components/Header';
import BentoBox from '@/components/ui/BentoBox';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();
    const { user, isLoading: authIsLoading, isAuthenticated, logout } = useAuth();
    const { resumeData: contextResumeData, setResumeData } = useResumeData();

    const {
        data: fetchedBaseResumeData,
        isLoading: baseResumeIsLoading,
        isError: baseResumeIsError,
        error: baseResumeFetchError
    } = useQuery<EnhancedResumeData, Error>({
        queryKey: ['baseResume', user?.id],
        queryFn: getBaseResume,
        enabled: !contextResumeData?.enhanced_resume_data && !!user && isAuthenticated,
        staleTime: 1000 * 60 * 15,
        retry: (failureCount, error: any) => {
            if (error && error.response && error.response.status === 404) {
                return false;
            }
            return failureCount < 3;
        },
    });

    useEffect(() => {
        if (!authIsLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authIsLoading, isAuthenticated, router]);

    const handleLogout = async () => {
        try {
            await logoutUser();
            logout();
            setResumeData(null);
            router.push('/login');
        } catch (error: any) {
            console.error('Logout failed:', error);
            alert(error.message || 'Logout failed. Please try again.');
        }
    };

    if (authIsLoading) {
        return (
            <BentoBox className="min-h-screen max-h-screen bg-black">
                <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                <SmallText className="text-blue-600">Loading...</SmallText>
            </BentoBox>
        );
    }

    if (!user && isAuthenticated) {
        return (
            <BentoBox className="min-h-screen max-h-screen bg-black">
                <SmallText className="text-blue-600">Preparing your dashboard...</SmallText>
            </BentoBox>
        );
    }

    if (!user) {
        return (
            <BentoBox className="min-h-screen max-h-screen bg-black">
                <SmallText className="text-blue-600">Redirecting to login...</SmallText>
            </BentoBox>
        );
    }

    return (
        <BentoBox splitConfig={{ direction: 'vertical', fractions: [1, 10] }} className="p-[var(--main-gap)] h-screen bg-black">
            <Header userEmail={user?.email} onLogout={handleLogout} />
            <BentoBox splitConfig={{ direction: 'horizontal', fractions: [2, 1] }} >
                <ResumeDisplayWrapper
                    user={user}
                    contextResumeData={contextResumeData}
                    fetchedBaseResumeData={fetchedBaseResumeData}
                    baseResumeIsLoading={baseResumeIsLoading}
                    baseResumeIsError={baseResumeIsError}
                    baseResumeFetchError={baseResumeFetchError}
                    isAuthenticated={isAuthenticated}
                />
                <RecentApplications />
            </BentoBox>
        </BentoBox>
    );
} 