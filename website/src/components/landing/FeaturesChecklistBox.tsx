'use client';

import React from 'react';
import BentoBox from '@/components/ui/BentoBox';
import ChecklistItem from './ChecklistItem'; // Assuming ChecklistItem is in the same directory

/**
 * Displays a scrollable list of resume features with checkmarks
 * @returns {JSX.Element} Box containing feature checklist
 */
const FeaturesChecklistBox: React.FC = () => {
    const checklistItemsContent = ["Standard Titles", "File Labeling", "Custom Summary", "ATS-Friendly", "Action-Oriented", "Professional Font", "Consistent Format", "Culture Match", "No Jargon", "Active Voice", "STAR Method", "No Pronouns", "No Buzzwords", "Single Page", "Chronological Order", "Quantified Results", "Keyword Optimized", "Company Language"];

    return (
        <BentoBox className="overflow-y-auto custom-scrollbar p-0">
            <div
                className="w-full feature-checklist"
            >
                {[...checklistItemsContent, ...checklistItemsContent].map((item, index) => (
                    <ChecklistItem
                        key={`${item}-${index}`}
                    >
                        {item}
                    </ChecklistItem>
                ))}
            </div>
        </BentoBox>
    );
};

export default FeaturesChecklistBox; 