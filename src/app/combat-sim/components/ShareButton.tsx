import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareButtonProps {
    getShareLink: () => string;
    className?: string;
}

export default function ShareButton({ getShareLink, className = '' }: ShareButtonProps) {
    const [showCopied, setShowCopied] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);

    const handleCopyLink = async () => {
        try {
            const link = getShareLink();
            await navigator.clipboard.writeText(link);
            setShowCopied(true);
            setShowShareMenu(false);

            setTimeout(() => {
                setShowCopied(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    const handleShare = async () => {
        const link = getShareLink();

        // Check if Web Share API is available
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Combat Simulator Setup',
                    text: 'Check out this combat simulation setup',
                    url: link
                });
            } catch (err) {
                // User cancelled or error occurred
                console.log('Share cancelled or failed:', err);
            }
        } else {
            // Fallback to showing copy menu
            setShowShareMenu(!showShareMenu);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleShare}
                className={`flex items-center gap-2 px-4 py-2 bg-military-800 hover:bg-military-700 
                    border border-military-600 hover:border-olive-600 text-tan-200 hover:text-olive-400
                    rounded-sm transition-all ${className}`}
                title="Share this setup"
            >
                {showCopied ? (
                    <>
                        <Check size={16} className="text-green-500" />
                        <span>Copied!</span>
                    </>
                ) : (
                    <>
                        <Share2 size={16} />
                        <span>Share</span>
                    </>
                )}
            </button>

            {/* Copy Link Menu (for browsers without Web Share API) */}
            {showShareMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-military-900 border border-military-600
                    rounded-sm shadow-lg z-50">
                    <div className="p-3">
                        <p className="text-sm text-tan-300 mb-3">Share this combat setup:</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={getShareLink()}
                                readOnly
                                className="flex-1 px-2 py-1 bg-military-800 border border-military-600
                                    rounded-sm text-tan-200 text-sm"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <button
                                onClick={handleCopyLink}
                                className="px-3 py-1 bg-olive-700 hover:bg-olive-600 text-tan-100
                                    rounded-sm transition-colors flex items-center gap-1"
                            >
                                <Copy size={14} />
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close */}
            {showShareMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowShareMenu(false)}
                />
            )}
        </div>
    );
}