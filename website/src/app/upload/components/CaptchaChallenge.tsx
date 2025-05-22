import React, { useState } from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { SmallText } from '@/components/ui/Typography';

/**
 * Props for the {@link CaptchaChallenge} component.
 */
interface CaptchaChallengeProps {
    /** The CAPTCHA challenge question or text to be displayed to the user. */
    challenge: string;
    /** Callback function triggered when the user submits their answer to the CAPTCHA. */
    onSubmit: (answer: string) => void;
}

/**
 * @component CaptchaChallenge
 * @description A component that displays a CAPTCHA challenge to the user and provides
 * an input field and a submit button for them to enter their answer.
 * @param {CaptchaChallengeProps} props - The props for the component.
 * @returns {React.ReactElement} The CAPTCHA challenge form.
 */
export function CaptchaChallenge({ challenge, onSubmit }: CaptchaChallengeProps): React.ReactElement {
    const [answer, setAnswer] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (answer.trim()) {
            onSubmit(answer);
        }
    };

    return (
        <BentoBox className="flex flex-col items-start p-6 gap-2">
            <SmallText className="text-[var(--color-gray-light)] p-0 pl-1 pt-1 pb-3">Please solve this CAPTCHA to continue</SmallText>
            <p className="text-xl text-[var(--color-white)] pl-2">{challenge}</p>
            <form onSubmit={handleSubmit} className="flex w-full rounded-[calc(var(--large-rounding)/2)] bg-[var(--color-glass-border)] overflow-hidden">
                <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="flex-1 px-4 py-2 bg-[var(--color-glass-background)] outline-none rounded-l-[calc(var(--large-rounding)/2)] text-xl w-full"
                    placeholder="Enter your answer"
                    aria-label={`CAPTCHA challenge: ${challenge}. Enter your answer here.`}
                    autoFocus
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-[var(--color-mockup-gradient-dark-blue)] text-white rounded-l-none hover:bg-blue-500"
                    aria-label="Submit CAPTCHA answer"
                >
                    Submit
                </button>
            </form>
        </BentoBox>
    );
} 