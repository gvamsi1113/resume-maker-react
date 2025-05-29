'use client';

import React, { useEffect } from 'react';
import BentoBox from '@/components/ui/BentoBox';
import ResumeView from '../upload/components/ResumeView';
import RegistrationForm from './components/RegistrationForm';
import { useResumeData } from '@/context/ResumeDataContext';
import PageLayout from '@/components/layout/PageLayout';

export default function RegisterPage() {
    const { resumeData } = useResumeData();

    useEffect(() => {
        console.log('RegisterPage - resumeData from context:', resumeData);
    }, [resumeData]);

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