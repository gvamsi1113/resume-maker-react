'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Array of top tech company domains for logo URLs
 */
const TOP_TECH_COMPANIES = [
    "google.com", "meta.com", "apple.com", "amazon.com", "microsoft.com",
    "openai.com", "nvidia.com", "tesla.com", "netflix.com", "adobe.com",
    "salesforce.com", "stripe.com", "airbnb.com", "palantir.com", "shopify.com",
    "linkedin.com", "atlassian.com", "bloomberg.com", "reddit.com", "databricks.com"
];

/**
 * LogoCarousel component for displaying a continuously scrolling strip of company logos
 * Uses CSS animation for smooth infinite scrolling
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes to apply
 * @returns {JSX.Element} A horizontally scrolling carousel of company logos
 */
const LogoCarousel: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={twMerge("relative w-full flex items-center overflow-hidden logo-carousel-mask-effect", className)}>
            <div className="logo-carousel-track flex items-center">
                {[...TOP_TECH_COMPANIES, ...TOP_TECH_COMPANIES].map((domain, i) => (
                    <img
                        key={`${domain}-${i}`}
                        src={`https://cdn.brandfetch.io/${domain}/h/200/theme/light/logo?c=1idz5n0_xXcEY0Cd2Zp`}
                        alt={domain.split('.')[0]}
                        className="h-8 max-w-23 object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all mr-25"
                    />
                ))}
            </div>

        </div>
    );
};

export default LogoCarousel; 