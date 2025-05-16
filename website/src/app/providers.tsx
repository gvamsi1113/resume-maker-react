    'use client'; // This directive is essential for client-side features

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Global default options for queries can go here
            // staleTime: 1000 * 60 * 5, // 5 minutes
            // refetchOnWindowFocus: false,
        },
    },
});

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        // Provide the client to your App
        <QueryClientProvider client={queryClient}>
            {children}
            {/* Optional: React Query Devtools for debugging */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
} 