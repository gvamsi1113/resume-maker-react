'use client';

import React from 'react';
import { BlobProvider } from '@react-pdf/renderer';
import ResumeDocument from './ResumeDocument';
import { type EnhancedResumeData } from '@/types/resume';

/** Props for the CleanPdfEmbed component. */
interface CleanPdfEmbedProps {
    /** The enhanced resume data to be rendered in the PDF. */
    resume: EnhancedResumeData;
    /** The desired file name for the downloaded PDF. */
    fileName: string;
}

/**
 * CleanPdfEmbed component handles the rendering of the PDF preview.
 * It uses BlobProvider to generate the PDF and displays it in an iframe.
 * It also manages loading and error states during PDF generation.
 *
 * @param {CleanPdfEmbedProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered CleanPdfEmbed component.
 */
const CleanPdfEmbed: React.FC<CleanPdfEmbedProps> = ({ resume, fileName }) => {
    return (
        <BlobProvider document={<ResumeDocument resume={resume} />}>
            {({ url, loading, error }) => {
                if (loading) {
                    return <div className="flex items-center justify-center h-full">Loading PDF Preview...</div>;
                }
                if (error) {
                    return <div className="flex items-center justify-center h-full text-red-500">Error generating PDF preview.</div>;
                }
                if (url) {
                    const embedUrl = `${url}#toolbar=0&view=FitH`;
                    return (
                        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                            <iframe
                                src={embedUrl}
                                style={{ width: 'calc(100% + 20px)', height: '100%', border: 'none' }}
                                title={fileName || 'Resume Preview'}
                            />
                        </div>
                    );
                }
                return <div className="flex items-center justify-center h-full">Preparing PDF preview...</div>;
            }}
        </BlobProvider>
    );
};

export default CleanPdfEmbed; 