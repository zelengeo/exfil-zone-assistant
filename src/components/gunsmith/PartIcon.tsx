'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { GunsmithPart } from '@/types/gunsmith';

interface PartIconProps {
    part: GunsmithPart;
    size?: number;
    className?: string;
}

/**
 * A part's picture. 647 of the 651 gun parts have one; the four that do not are fixed scope mounts
 * the game itself references no image for, so the tile falls back to the part's initial.
 */
export default function PartIcon({ part, size = 40, className }: PartIconProps) {
    const [failed, setFailed] = useState(false);
    const src = part.images?.icon;

    return (
        <div
            className={cn('bg-steel-550 border border-line-800 flex items-center justify-center shrink-0', className)}
            style={{ width: size, height: size }}
        >
            {src && !failed ? (
                <Image
                    src={src}
                    alt=""
                    width={size}
                    height={size}
                    className="object-contain w-full h-full"
                    onError={() => setFailed(true)}
                    unoptimized
                />
            ) : (
                <span className="font-display text-ink-700 text-sm" aria-hidden="true">
                    {part.name.charAt(0)}
                </span>
            )}
        </div>
    );
}
