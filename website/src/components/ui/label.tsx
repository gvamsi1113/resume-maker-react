'use client';

import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
    className?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <label
                ref={ref}
                className={`block text-sm font-medium text-gray-500 pl-1 ${className}`}
                {...props}
            >
                {children}
            </label>
        );
    }
);

Label.displayName = 'Label';

export { Label }; 