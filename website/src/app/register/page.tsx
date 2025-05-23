'use client';

import React, { useEffect } from 'react';
// import { useSearchParams } from 'next/navigation'; // No longer needed
import { useRouter } from 'next/navigation'; // For potential redirection
import BentoBox from '@/components/ui/BentoBox';
import ResumeView from '../upload/components/ResumeView';
import RegistrationForm from './components/RegistrationForm'; // Import the new form
import { useResumeData } from '@/context/ResumeDataContext'; // Added import
import PageLayout from '@/components/layout/PageLayout'; // Added import

export default function RegisterPage() {
    // const searchParams = useSearchParams(); // No longer needed
    // const resumeDataString = searchParams.get('resumeData'); // No longer needed
    const { resumeData, setResumeData } = useResumeData(); // Get data and setter from context
    // const router = useRouter(); // No longer needed here if we are not redirecting

    // Log resumeData to see its content when the page loads
    useEffect(() => {
        console.log('RegisterPage - resumeData from context:', resumeData);
    }, [resumeData]);

    const enhancedData = resumeData?.enhanced_resume_data;

    return (
        <PageLayout> {/* Used PageLayout component */}
            {enhancedData ? (
                <BentoBox
                    splitConfig={{ direction: 'horizontal', fractions: [2, 1] }}
                    className="w-full my-auto h-full rounded-none"
                >
                    <div className="h-full overflow-y-auto">
                        <ResumeView resumeData={resumeData} />
                    </div>
                    <RegistrationForm resumeData={enhancedData} />

                </BentoBox>
            ) : (
                // If no resume data, show only the registration form (centered by PageLayout)
                <RegistrationForm /> // Pass nothing if no enhancedData
            )}
        </PageLayout>
    );
} 