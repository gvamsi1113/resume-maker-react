'use client';

import React, { useState } from 'react';
import BentoBox from '@/components/ui/BentoBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegistrationForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        // Handle registration logic here
        console.log('Registration submitted:', { email, password });
        alert('Registration form submitted! Check the console for details.');
        // Reset form or redirect after successful registration
    };

    return (
        <BentoBox className="flex flex-col p-6 md:p-8 gap-6 max-w-md w-full !items-stretch !text-left">
            <h2 className="text-2xl font-semibold text-center text-white mb-4">Create Account</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="mt-1 w-full"
                    />
                </div>
                <div>
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="mt-1 w-full"
                    />
                </div>
                <div>
                    <Label htmlFor="confirm-password" className="text-gray-300">Confirm Password</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="mt-1 w-full"
                    />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Register
                </Button>
            </form>
        </BentoBox>
    );
} 