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

    return (
        <PageLayout> {/* Used PageLayout component */}
            {resumeData ? (
                <BentoBox
                    splitConfig={{ direction: 'horizontal', fractions: [1, 1] }}
                    className="max-w-6xl w-full" // Wider container for side-by-side view
                >
                    {/* Column 1: Registration Form */}
                    <RegistrationForm />

                    {/* Column 2: Resume View with its own BentoBox for consistent styling */}
                    <BentoBox className="flex flex-col p-[1rem] md:p-8 gap-5 w-full h-full !items-stretch !text-left overflow-y-auto">
                        <ResumeView resumeData={resumeData} />
                    </BentoBox>
                </BentoBox>
            ) : (
                // If no resume data, show only the registration form (centered by PageLayout)
                <RegistrationForm />
            )}
        </PageLayout>
    );
} 