'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';
import { LargeText } from '@/components/ui/Typography';

/**
 * ChecklistItem component displaying a feature with a check icon
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Feature text content
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Individual checklist item with checkmark
 */
const ChecklistItem: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className }) => (
    <div
        className={twMerge(
            `flex flex-row items-center gap-[var(--main-gap)] w-full h-[4rem] rounded-b-[var(--small-rounding)] bg-gradient-to-b from-[var(--color-transparent)] from-0% to-[var(--color-neutral-800-transparent-20)] to-100% pl-[2rem]`,
            className
        )}
    >
        <svg className="w-5 h-5 text-[var(--color-green-400)] flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path
                className="checkmark-path"
                d="M5 13l4 4L19 7"
            ></path>
        </svg>
        <LargeText fontSizeClass="text-[1.4rem]">{children}</LargeText>
    </div>
);

export default ChecklistItem; 