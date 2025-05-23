'use client';

import React, { useState, useEffect, useRef } from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedResumeData } from '@/types/resume';
import { LargeText, SmallText } from '@/components/ui/Typography';

interface RegistrationFormProps {
    resumeData?: EnhancedResumeData | null;
}

export default function RegistrationForm({ resumeData }: RegistrationFormProps) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const firstNameInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (resumeData) {
            setFirstName(resumeData.first_name || '');
            setLastName(resumeData.last_name || '');
            setEmail(resumeData.email || '');
            setPhone(resumeData.phone || '');
            passwordInputRef.current?.focus();
        } else {
            firstNameInputRef.current?.focus();
        }
    }, [resumeData]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        // Handle registration logic here
        console.log('Registration submitted:', { firstName, lastName, email, password });
        alert('Registration form submitted! Check the console for details.');
        // Reset form or redirect after successful registration
    };

    return (
        <BentoBox className="flex flex-col p-6 md:p-8 gap-6 max-w-md w-full !items-stretch !text-left bg-black h-full">
            <div>
                <LargeText
                    className={`text-[2rem] ${resumeData ? 'text-left' : 'text-center'}`}>
                    Create Account
                </LargeText>
                <SmallText
                    className={`${resumeData ? 'text-left' : 'text-center'}`}>
                    Please fill your details to <span className="text-gray-600">Register for Free</span>.
                </SmallText>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                        placeholder="John"
                        required
                        className="mt-1 w-full"
                        ref={firstNameInputRef}
                    />
                </div>
                <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                        placeholder="Doe"
                        required
                        className="mt-1 w-full"
                    />
                </div>
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="mt-1 w-full"
                    />
                </div>
                <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                        placeholder="123-456-7890"
                        required
                        className="mt-1 w-full"
                    />
                </div>
                <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="mt-1 w-full"
                        ref={passwordInputRef}
                    />
                </div>
                <div>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="mt-1 w-full"
                    />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                    Register
                </Button>
            </form>
        </BentoBox>
    );
} 