'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BentoBox from '@/components/ui/BentoBox';
import ResumeView from '../upload/components/ResumeView';
import RegistrationForm from './components/RegistrationForm';
import { useResumeData } from '@/context/ResumeDataContext';
import PageLayout from '@/components/layout/PageLayout';

export default function RegisterPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { resumeData } = useResumeData();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        console.log('RegisterPage - resumeData from context:', resumeData);
    }, [resumeData]);

    if (isLoading || isAuthenticated) {
        // You might want to show a loader here or return null
        return null; // Or a loading spinner
    }

    const enhancedData = resumeData?.enhanced_resume_data;

    return (
        <PageLayout>
            {enhancedData ? (
                <BentoBox
                    splitConfig={{ direction: 'horizontal', fractions: [2, 1] }}
                    className="w-full my-auto h-full rounded-none"
                >
                    <div className="h-full overflow-y-auto">
                        <ResumeView resumeData={resumeData} />
                    </div>
                    <RegistrationForm />
                </BentoBox>
            ) : (
                <div className="flex justify-center items-center h-full">
                    <RegistrationForm />
                </div>
            )}
        </PageLayout>
    );
} 