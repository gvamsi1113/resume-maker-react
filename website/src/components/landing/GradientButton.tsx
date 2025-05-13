'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * GradientButton component for primary call-to-action elements
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 * @param {() => void} [props.onClick] - Click event handler
 * @returns {JSX.Element} Styled gradient button component
 */
const GradientButton: React.FC<{ className?: string, children: React.ReactNode, onClick?: () => void }> =
    ({ className, children, onClick }) => (
        <button
            onClick={onClick}
            className={twMerge(
                'cta-primary flex items-center justify-center w-full h-full',
                className
            )}
        >
            {children}
        </button>
    );

export default GradientButton; 