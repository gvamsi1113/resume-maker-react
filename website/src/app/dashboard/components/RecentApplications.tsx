'use client';

import React from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { Button } from '@/components/ui/button';
import { LargeText, SmallText } from '@/components/ui/Typography';

const RecentApplications = () => {
    // Placeholder data - replace with actual data fetching and mapping
    const applications = [
        { id: 1, title: "Software Engineer", company: "Tech Solutions Inc.", date: "2024-07-15", status: "Applied" },
        { id: 2, title: "Frontend Developer", company: "Web Wizards LLC", date: "2024-07-10", status: "Interviewing" },
        { id: 3, title: "Product Manager", company: "Innovate Co.", date: "2024-07-05", status: "Offer Extended" },
        { id: 1, title: "Software Engineer", company: "Tech Solutions Inc.", date: "2024-07-15", status: "Applied" },
        { id: 2, title: "Frontend Developer", company: "Web Wizards LLC", date: "2024-07-10", status: "Interviewing" },
        { id: 3, title: "Product Manager", company: "Innovate Co.", date: "2024-07-05", status: "Offer Extended" },
        { id: 1, title: "Software Engineer", company: "Tech Solutions Inc.", date: "2024-07-15", status: "Applied" },
        { id: 2, title: "Frontend Developer", company: "Web Wizards LLC", date: "2024-07-10", status: "Interviewing" },
        { id: 3, title: "Product Manager", company: "Innovate Co.", date: "2024-07-05", status: "Offer Extended" },
        { id: 1, title: "Software Engineer", company: "Tech Solutions Inc.", date: "2024-07-15", status: "Applied" },
        { id: 2, title: "Frontend Developer", company: "Web Wizards LLC", date: "2024-07-10", status: "Interviewing" },
        { id: 3, title: "Product Manager", company: "Innovate Co.", date: "2024-07-05", status: "Offer Extended" },
    ];

    return (
        <BentoBox splitConfig={{ direction: 'vertical', fractions: [1, 10] }} className="rounded-none gap-0 bg-transparent p-0">
            <BentoBox className="flex flex-row w-full justify-between rounded-none bg-transparent p-3 custom-scrollbar">
                <LargeText>Recent Applications</LargeText>
                <Button><SmallText className="text-blue-600 hover:underline align-bottom pb-0">See all</SmallText></Button>
            </BentoBox>

            <BentoBox className="w-full flex flex-col items-start justify-start p-0 overflow-y-auto custom-scrollbar rounded-none bg-transparent gap-0">
                {applications.map(app => (
                    <div className="flex flex-row justify-between w-full p-0 border-b-2 border-[var(--color-glass-border)] bg-transparent">
                        <BentoBox className="flex flex-col items-start justify-start bg-transparent">
                            <LargeText className="text-xl">{app.title}</LargeText>
                            <SmallText>{app.company}</SmallText>
                        </BentoBox>
                        <BentoBox className="flex flex-col items-end justify-start bg-transparent">
                            <SmallText
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${app.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                                    app.status === 'Interviewing' ? 'bg-yellow-100 text-yellow-700' :
                                        app.status === 'Offer Extended' ? 'bg-green-100 text-green-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                {app.status}
                            </SmallText>
                            <SmallText className="text-xs text-gray-400">Applied: {app.date}</SmallText>
                        </BentoBox>
                    </div>
                ))}
                {applications.length === 0 && <SmallText>No recent applications to display.</SmallText>}
            </BentoBox>
        </BentoBox>
    );
};

export default RecentApplications; 