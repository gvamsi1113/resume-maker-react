import React, { useState } from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { SmallText } from '@/components/ui/Typography';

interface CaptchaChallengeProps {
    challenge: string;
    onSubmit: (answer: string) => void;
}

/**
 * Component for displaying and handling a CAPTCHA challenge
 * @param {CaptchaChallengeProps} props - Component props
 * @returns {JSX.Element} The captcha challenge component
 */
export function CaptchaChallenge({ challenge, onSubmit }: CaptchaChallengeProps) {
    const [answer, setAnswer] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (answer.trim()) {
            onSubmit(answer);
        }
    };

    return (
        <BentoBox className="flex flex-col items-start p-[1.5rem] gap-[.5rem]">
            <SmallText className="text-[var(--color-gray-light)] p-0 pl-[.3rem] pt-[.2rem] pb-[.75rem]">Please solve this CAPTCHA to continue</SmallText>
            <p className="text-xl text-[var(--color-white)] pl-[.5rem]">{challenge}</p>
            <form onSubmit={handleSubmit} className="flex w-full rounded-[calc(var(--large-rounding)/2)] bg-[var(--color-glass-border)] overflow-hidden">
                <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="flex-1 px-[1rem] py-[.5rem] bg-[var(--color-glass-background)] outline-none rounded-l-[calc(var(--large-rounding)/2)] text-xl w-full"
                    placeholder="Enter your answer"
                    autoFocus
                />
                <button
                    type="submit"
                    className="px-[1rem] bg-[var(--color-mockup-gradient-dark-blue)] text-white rounded-l-none hover:bg-blue-500"
                >
                    Submit
                </button>
            </form>
        </BentoBox>
    );
} 