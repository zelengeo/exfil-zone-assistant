import React, { useState } from 'react';
import { Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ButtonProps = React.ComponentProps<typeof Button>;

interface ShareButtonProps {
    getShareLink: () => string;
    title: string;
    className?: string;
    variant?: ButtonProps['variant'];
    size?: ButtonProps['size'];
}

/** The skin the pre-Cold-Steel call sites still expect. Rewritten views pass a variant instead. */
const LEGACY_SKIN =
    'bg-military-800 hover:bg-military-700 border-military-600 hover:border-olive-600 text-tan-300 hover:text-olive-400';

export default function ShareButton({
                                        getShareLink,
                                        className,
                                        title,
                                        variant = 'outline',
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
            variant={variant}
            size={size}
            className={cn(
                variant === 'outline' && !className && LEGACY_SKIN,
                className,
                copied && 'bg-good hover:bg-good text-ember-ink border-good',
            )}
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