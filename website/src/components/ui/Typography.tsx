'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * LargeText component for displaying emphasized text with customizable styling
 * @param className - Additional CSS classes
 * @param fontSizeClass - Tailwind font size class (default: text-5xl)
 * @param colorClass - Text color class (default: bg-gradient-to-t from-[var(--color-gray-medium)] to-[var(--color-white)] bg-clip-text text-[var(--color-transparent)]
 * @param children - Text content
 * @param as - HTML element to render (default: p)
 */
const LargeText: React.FC<{ className?: string, fontSizeClass?: string, colorClass?: string, children: React.ReactNode, as?: React.ElementType }> =
    ({ className, fontSizeClass = 'text-3xl', colorClass = 'bg-gradient-to-t from-[var(--color-gray-medium)] to-[var(--color-white)] bg-clip-text text-[var(--color-transparent)]', children, as: Component = 'p' }) => (
        <Component className={twMerge(
            fontSizeClass,
            colorClass,
            'font-semibold',
            'leading-none',
            'pb-[0.1rem]',
            className
        )}>{children}</Component>
    );

/**
 * SmallText component for displaying secondary text with standardized styling
 * @param className - Additional CSS classes
 * @param children - Text content
 * @param as - HTML element to render (default: p)
 */
const SmallText: React.FC<{ className?: string, children: React.ReactNode, as?: React.ElementType }> =
    ({ className, children, as: Component = 'p' }) => (
        <Component className={twMerge(
            'text-[1.1rem] text-[var(--color-gray-dark)] font-normal leading-none pb-[.1rem] tracking-[-.05em]',
            className
        )}>{children}</Component>
    );

export { LargeText, SmallText };