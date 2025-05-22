'use client';

import React from 'react';

interface PageLayoutProps {
    children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
    return (
        <div className="bg-[#000000] flex items-center justify-center min-h-screen p-4">
            {children}
        </div>
    );
};

export default PageLayout; 