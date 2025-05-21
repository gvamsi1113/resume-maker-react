'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ResumeResponse } from '@/types/resume'; // Import the specific type

// Define the shape of your resume data using the existing ResumeResponse type
// interface ResumeData { // No longer needed, using ResumeResponse directly
//    [key: string]: any;
// }

interface ResumeDataContextType {
    resumeData: ResumeResponse | null;
    setResumeData: (data: ResumeResponse | null) => void;
}

const ResumeDataContext = createContext<ResumeDataContextType | undefined>(undefined);

export const ResumeDataProvider = ({ children }: { children: ReactNode }) => {
    const [resumeData, setResumeData] = useState<ResumeResponse | null>(null);

    return (
        <ResumeDataContext.Provider value={{ resumeData, setResumeData }}>
            {children}
        </ResumeDataContext.Provider>
    );
};

export const useResumeData = () => {
    const context = useContext(ResumeDataContext);
    if (context === undefined) {
        throw new Error('useResumeData must be used within a ResumeDataProvider');
    }
    return context;
}; 