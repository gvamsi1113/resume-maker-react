'use client';

import React from 'react';
import BentoBox from '@/components/ui/BentoBox';
import Image from 'next/image';

/**
 * Displays browser extension mockup image
 * @returns {JSX.Element} Box containing browser extension preview
 */
const BrowserMockupBox: React.FC = () => (
    <BentoBox className='relative p-[.1rem] overflow-hidden bg-extension-mockup-gradient'>
        <Image
            src="/extension_mockup.png"
            alt="Browser Mockup"
            width={1200}
            height={800}
            className="relative z-10 w-full h-full object-cover object-[center_20%] rounded-[1.4rem]"
            priority
        />
    </BentoBox>
);

export default BrowserMockupBox; 