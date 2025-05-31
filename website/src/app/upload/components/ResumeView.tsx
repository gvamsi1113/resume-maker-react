'use client';

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { type ResumeResponse } from '@/types/resume';
import BentoBox from '@/components/ui/BentoBox';
import ResumeDocument from './ResumeDocument';
import CleanPdfEmbed from './CleanPdfEmbed';

/* Props for the ResumeView component. */
interface ResumeViewProps {
    /* The resume data to display. */
    resumeData: ResumeResponse;
}

/**
 * ResumeView component displays the generated resume and provides a download link.
 * It handles cases where resume data might be missing or incomplete.
 *
 * @param {ResumeViewProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered ResumeView component.
 */
const ResumeView: React.FC<ResumeViewProps> = ({ resumeData }) => {
    if (!resumeData || !resumeData.enhanced_resume_data) {
        return <div className="text-red-500">Something went wrong. Please try again.</div>;
    }

    const structuredData = resumeData.enhanced_resume_data;
    const fileName = (structuredData.first_name || structuredData.last_name)
        ? `${(structuredData.first_name || '')}_${(structuredData.last_name || '')}_Resume.pdf`.replace(/_Resume.pdf$/, 'Resume.pdf').replace(/^_+|_+$/g, '')
        : 'resume.pdf';

    return (
        <BentoBox className="flex flex-col p-0 items-center justify-center w-full h-full bg-transparent">
            <div className="relative w-full h-full group">
                <div className="relative w-full h-full overflow-hidden after:content-[''] after:absolute after:inset-0 after:shadow-[inset_0_0_0_7px_#ffffff] after:pointer-events-none">
                    {typeof window !== 'undefined' && (
                        <CleanPdfEmbed resume={structuredData} fileName={fileName} />
                    )}
                </div>

                <PDFDownloadLink
                    document={<ResumeDocument resume={structuredData} />}
                    fileName={fileName}
                    className="absolute top-4 right-4 z-10 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
                >
                    {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
                </PDFDownloadLink>
            </div>
        </BentoBox>
    );
};

export default ResumeView; 