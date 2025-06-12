import React, { useState } from 'react';
import { Link2, Check } from 'lucide-react';

interface ShareButtonProps {
    getShareLink: () => string;
    className?: string;
}

export default function ShareButton({ getShareLink, className = '' }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            const link = getShareLink();
            await navigator.clipboard.writeText(link);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
            // Fallback for older browsers
            alert('Failed to copy link. Please copy manually from the address bar.');
        }
    };

    return (
        <button
            onClick={handleCopyLink}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm
                ${copied
                ? 'bg-green-800 border-green-600 text-green-100'
                : 'bg-military-800 hover:bg-military-700 border-military-600 hover:border-olive-600 text-tan-300 hover:text-olive-400'
            }
                border rounded-sm transition-all ${className}`}
            title="Copy link to this setup"
        >
            {copied ? (
                <>
                    <Check size={14} />
                    <span>Copied!</span>
                </>
            ) : (
                <>
                    <Link2 size={14} />
                    <span>Share Setup</span>
                </>
            )}
        </button>
    );
}