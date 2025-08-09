import React, { useState } from 'react';
import { Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
    getShareLink: () => string;
    title: string;
    className?: string;
    size?: 'sm' | 'default' | 'lg' | 'icon';
}

export default function ShareButton({
                                        getShareLink,
                                        className = 'bg-military-800 hover:bg-military-700 border-military-600 hover:border-olive-600 text-tan-300 hover:text-olive-400',
                                        title,
                                        size = 'sm'
                                    }: ShareButtonProps) {
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
            alert('Failed to copy link. Please copy manually from the address bar.');
        }
    };

    return (
        <Button
            onClick={handleCopyLink}
            variant={'outline'}
            size={size}
            className={`${className} ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}
            title="Copy link to this setup"
        >
            {copied ? (
                <>
                    <Check />
                    <span>Copied!</span>
                </>
            ) : (
                <>
                    <Link2/>
                    <span className="hidden sm:inline">{title}</span>
                    <span className="sm:hidden">Share</span>
                </>
            )}
        </Button>
    );
}