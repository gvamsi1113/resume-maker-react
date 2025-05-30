'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={`px-4 py-2 rounded-[.7rem] transition-colors cursor-pointer ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button }; 