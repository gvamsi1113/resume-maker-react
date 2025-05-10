import React, { useState } from 'react';
import { Loader2, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText, SmallText } from '@/components/ui/Typography';
import { useRouter } from 'next/navigation';

interface ProcessingStateProps {
    responseData?: {
        id: string;
        analysis: any;
        pdfUrl: string;
    };
}

/**
 * Component for displaying the processing state and response data
 * @param {ProcessingStateProps} props - Component props
 * @returns {JSX.Element} The processing state component
 */
export function ProcessingState({ responseData }: ProcessingStateProps) {
    const [showAnalysis, setShowAnalysis] = useState(false);
    const router = useRouter();

    const handleDownload = () => {
        if (responseData?.pdfUrl) {
            window.open(responseData.pdfUrl, '_blank');
        }
    };

    const handleViewResume = () => {
        if (responseData?.id) {
            router.push(`/resume/${responseData.id}`);
        }
    };

    return (
        <div className="upload-page-background flex items-center justify-center min-h-screen p-4">
            <BentoBox className="upload-page-content flex flex-col items-center justify-center p-6 md:p-10 gap-4 md:gap-6 max-w-4xl w-full !text-center">
                {!responseData ? (
                    <>
                        <Loader2 className="animate-spin h-12 w-12 text-primary" />
                        <LargeText className="!text-2xl md:!text-3xl">Perfecting your resume...</LargeText>
                        <SmallText className="!text-center">
                            Designing my way through the chaos, endless coffee refills, and late-night inspiration.
                        </SmallText>
                    </>
                ) : (
                    <>
                        <div className="w-full flex justify-between items-center mb-4">
                            <LargeText className="!text-2xl md:!text-3xl">Resume Analysis Complete!</LargeText>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAnalysis(!showAnalysis)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    {showAnalysis ? 'Show PDF' : 'Show Analysis'}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    <Download className="h-5 w-5" />
                                    Download
                                </button>
                            </div>
                        </div>

                        {showAnalysis ? (
                            <div className="w-full text-left">
                                <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-lg text-sm">
                                    {JSON.stringify(responseData.analysis, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <div className="w-full h-[800px] bg-white rounded-lg shadow-lg overflow-hidden">
                                <iframe
                                    src={responseData.pdfUrl}
                                    className="w-full h-full"
                                    title="Resume PDF"
                                />
                            </div>
                        )}

                        <button
                            onClick={handleViewResume}
                            className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium"
                        >
                            View Perfect Resume
                        </button>
                    </>
                )}
            </BentoBox>
        </div>
    );
} 