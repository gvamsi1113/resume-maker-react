import React, { useState } from 'react';

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
        <div className="captcha-container p-4 bg-white/5 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Please solve this CAPTCHA to continue</h3>
            <p className="text-xl mb-4">{challenge}</p>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 rounded border border-white/20"
                    placeholder="Enter your answer"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Submit
                </button>
            </form>
        </div>
    );
} 