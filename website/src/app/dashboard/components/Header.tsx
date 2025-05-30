'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Bell, UserCircle2 } from 'lucide-react';
import BentoBox from '@/components/ui/BentoBox';
import { LargeText, SmallText } from '@/components/ui/Typography'; // Assuming these might be useful
import Logo from '@/components/ui/Logo';

interface HeaderProps {
    userEmail: string | undefined;
    onLogout: () => Promise<void>;
}

const Header = ({ userEmail, onLogout }: HeaderProps) => {

    return (
        <BentoBox className="flex flex-row justify-between bg-transparent">
            <Logo />
            <BentoBox className="flex flex-row justify-around bg-transparent p-0 gap-[var(--menu-gap)]">
                <a href="#"><SmallText>Dashboard</SmallText></a>
                <a href="#"><SmallText>Resumes</SmallText></a>
                <a href="#"><SmallText>Payments</SmallText></a>

                <Button className="border">Download Extension</Button>
                <UserCircle2 className="w-8 h-8" />
                <Button onClick={onLogout} className="text-red-600 px-[1rem]">Logout</Button>
            </BentoBox>
        </BentoBox>
    );
};

export default Header; 