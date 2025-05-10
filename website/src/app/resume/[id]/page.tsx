import ResumeClient from '@/app/resume/[id]/ResumeClient';

export default function ResumePage({ params }: { params: { id: string } }) {
    return <ResumeClient id={params.id} />;
} 