import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-3" />
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    );
}