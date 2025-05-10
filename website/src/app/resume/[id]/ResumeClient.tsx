'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Download } from 'lucide-react';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText, SmallText } from '@/components/ui/Typography';
import { useRouter } from 'next/navigation';

interface ResumeData {
    analysis: any;
    pdfUrl: string;
}

export default function ResumeClient({ id }: { id: string }) {
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchResumeData = async () => {
            try {
                const response = await fetch(`/api/resume/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch resume data');
                }
                const data = await response.json();
                setResumeData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load resume');
            } finally {
                setLoading(false);
            }
        };

        fetchResumeData();
    }, [id]);

    const handleDownload = () => {
        if (resumeData?.pdfUrl) {
            window.open(resumeData.pdfUrl, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="upload-page-background flex items-center justify-center min-h-screen p-4">
                <BentoBox className="upload-page-content flex flex-col items-center justify-center p-6 md:p-10 gap-4 md:gap-6 max-w-4xl w-full !text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-primary" />
                    <LargeText className="!text-2xl md:!text-3xl">Loading your resume...</LargeText>
                </BentoBox>
            </div>
        );
    }

    if (error) {
        return (
            <div className="upload-page-background flex items-center justify-center min-h-screen p-4">
                <BentoBox className="upload-page-content flex flex-col items-center justify-center p-6 md:p-10 gap-4 md:gap-6 max-w-4xl w-full !text-center">
                    <LargeText className="!text-2xl md:!text-3xl text-red-500">Error</LargeText>
                    <SmallText>{error}</SmallText>
                    <button
                        onClick={() => router.push('/upload')}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Back to Upload
                    </button>
                </BentoBox>
            </div>
        );
    }

    return (
        <div className="upload-page-background flex items-center justify-center min-h-screen p-4">
            <BentoBox className="upload-page-content flex flex-col items-center justify-center p-6 md:p-10 gap-4 md:gap-6 max-w-4xl w-full !text-center">
                <div className="w-full flex justify-between items-center mb-4">
                    <LargeText className="!text-2xl md:!text-3xl">Your Perfect Resume</LargeText>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Download className="h-5 w-5" />
                            Download
                        </button>
                    </div>
                </div>

                <div className="w-full h-[800px] bg-white rounded-lg shadow-lg overflow-hidden">
                    <iframe
                        src={resumeData?.pdfUrl}
                        className="w-full h-full"
                        title="Resume PDF"
                    />
                </div>
            </BentoBox>
        </div>
    );
} 