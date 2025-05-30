'use client';

import React, { useState, useEffect, useCallback } from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { Button } from '@/components/ui/button';
import { LargeText, SmallText } from '@/components/ui/Typography';
import { getRecentApplications } from '@/api/resume'; // Import the API function
import { type RecentApplicationItem } from '@/types/applications'; // Import the type

const RecentApplications = () => {
    const [applications, setApplications] = useState<RecentApplicationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Start true, first load is in progress
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false); // Initialize hasMore to false

    const fetchApplications = useCallback(async (currentPage: number) => {
        setIsLoading(true); // Set loading true for any fetch operation
        try {
            const response = await getRecentApplications(currentPage, 5);
            setApplications(prev => currentPage === 1 ? response.results : [...prev, ...response.results]);
            setHasMore(response.next !== null);
        } catch (error) {
            console.error("Error fetching recent applications:", error);
            setHasMore(false); // On error, assume no more data can be loaded
            if (currentPage === 1) {
                setApplications([]); // Clear applications on initial load error to show "No applications"
            }
            // Optionally, display an error message to the user here
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array as it doesn't rely on props/state from outside its scope

    useEffect(() => {
        // isLoading is already true from initial useState(true)
        // fetchApplications will manage isLoading internally for its duration
        fetchApplications(1); // Fetch initial page
    }, [fetchApplications]);

    const handleLoadMore = () => {
        // Button is only rendered if !isLoading && hasMore
        if (hasMore) { // isLoading check is implicitly handled by button visibility
            const nextPage = page + 1;
            setPage(nextPage);
            fetchApplications(nextPage);
        }
    };

    // Function to format date string (YYYY-MM-DD HH:MM:SS -> YYYY-MM-DD)
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD
    };

    return (
        <BentoBox splitConfig={{ direction: 'vertical', fractions: [1, 10] }} className="rounded-none gap-0 bg-transparent p-0 h-full flex flex-col">
            <BentoBox className="flex flex-row w-full justify-between rounded-none bg-transparent p-3 custom-scrollbar">
                <LargeText>Recent Applications</LargeText>
                {/* <Button><SmallText className="text-blue-600 hover:underline align-bottom pb-0">See all</SmallText></Button> */}
            </BentoBox>

            <BentoBox className="w-full flex flex-col items-start justify-start p-0 overflow-y-auto custom-scrollbar rounded-none bg-transparent gap-0 flex-grow">
                {isLoading && applications.length === 0 && (
                    // Show main loading spinner only on initial load when no applications are yet shown
                    <SmallText className="p-3 text-center w-full">Loading applications...</SmallText>
                )}

                {!isLoading && applications.length === 0 && (
                    <SmallText className="p-3 text-center w-full">No recent applications to display.</SmallText>
                )}

                {applications.map(app => (
                    <div key={app.resume_id} className="flex flex-row justify-between w-full p-3 border-b border-[var(--color-glass-border)] bg-transparent hover:bg-[var(--color-glass-border-muted)] cursor-pointer">
                        <BentoBox className="flex flex-col items-start justify-start bg-transparent">
                            <LargeText className="text-lg font-semibold">{app.job_post.job_title || 'N/A'}</LargeText>
                            <SmallText className="text-sm text-gray-600 dark:text-gray-400">{app.job_post.company_name || 'N/A'}</SmallText>
                            <SmallText className="text-xs text-gray-500 dark:text-gray-500">Resume: {app.resume_name}{app.is_base_resume ? " (Base)" : ""}</SmallText>
                        </BentoBox>
                        <BentoBox className="flex flex-col items-end justify-start bg-transparent min-w-[120px]">
                            {/* Placeholder for status - adapt if status is added to API response */}
                            {/* <SmallText
                                className={`text-xs font-medium px-2 py-0.5 rounded-full mb-1 ${app.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                                    app.status === 'Interviewing' ? 'bg-yellow-100 text-yellow-700' :
                                        app.status === 'Offer Extended' ? 'bg-green-100 text-green-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                {app.status}
                            </SmallText> */}
                            <SmallText className="text-xs text-gray-400 dark:text-gray-500">Updated: {formatDate(app.resume_updated_at)}</SmallText>
                            {app.job_post.source_url &&
                                <Button className="p-0 h-auto text-xs text-blue-600 hover:underline" onClick={() => { if (app.job_post.source_url) window.open(app.job_post.source_url, '_blank'); }}>
                                    View Job Post
                                </Button>
                            }
                        </BentoBox>
                    </div>
                ))}

                {hasMore && !isLoading && (
                    <div className="flex justify-center w-full p-2">
                        <Button onClick={handleLoadMore} className="px-4 py-2 border border-gray-300 rounded-md">
                            Load More
                        </Button>
                    </div>
                )}
                {/* Optional: Show a smaller loading indicator when loading more items */}
                {isLoading && applications.length > 0 && (
                    <SmallText className="p-3 text-center w-full">Loading more...</SmallText>
                )}
            </BentoBox>
        </BentoBox>
    );
};

export default RecentApplications; 