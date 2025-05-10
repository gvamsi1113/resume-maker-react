'use client';

import React from 'react';
import { UploadFileCardTest } from '../components/UploadFileCard.test';

export default function UploadTestPage() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Upload Component Test Page</h1>
                <p className="mb-4 text-gray-600">
                    Use the controls below to test different upload states and error scenarios.
                </p>
                <UploadFileCardTest />
            </div>
        </div>
    );
} 