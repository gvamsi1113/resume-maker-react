'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                ref={ref}
                type={type}
                className={`border-2 border-[var(--color-glass-border)] rounded-[.7rem] px-3 py-2 focus:border-2 focus:border-blue-500 outline-none transition-colors placeholder-gray-700 ${className}`}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';

export { Input }; 