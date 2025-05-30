'use client'; // If using Next.js App Router and client components like Image

import React from 'react';
import Image from 'next/image';

// Define props if you want to make it more configurable, e.g., altText, text
interface LogoProps {
    // Example: size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = (props) => {
    return (
        <div className="flex items-center gap-[1rem] h-full"> {/* p-[1.2rem] removed as it might be context-specific */}
            <Image
                src="/Rezoome.svg" // Assuming this path is correct from the root of `public`
                alt="Rezoome Logo"
                width={40}
                height={40}
                className="h-full w-auto object-contain" // h-full might need parent with defined height
                priority // Keep if this is often a LCP element
            />
            <span className="text-[1.5rem] font-bold">Rezoome</span>
        </div>
    );
};

export default Logo; 