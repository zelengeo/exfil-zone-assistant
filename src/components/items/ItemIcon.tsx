'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Item } from '@/types/items';

/**
 * An item's picture, and nothing else.
 *
 * `ItemChip` draws one too, but a chip is a link to the item's page — which makes it unusable
 * inside a `<button>`, and the combat sim's pickers are lists of buttons. Rather than let those
 * grow a fourth private copy of the 48px bordered tile (the sprawl `ItemChip` was written to end),
 * the tile is its own component and the chip renders one.
 *
 * No placeholder art exists in `public/`, so a missing or broken icon falls back to the item's
 * initial: honest, and costs no request.
 */

export interface ItemIconRef {
    id?: string;
    name?: string;
    images?: Item['images'];
}

export interface ItemIconProps {
    item?: ItemIconRef | null;
    /** Edge length in pixels. The default matches `ItemChip`'s `lg`. */
    size?: number;
    className?: string;
}

export default function ItemIcon({ item, size = 48, className }: ItemIconProps) {
    const [failed, setFailed] = useState(false);
    const src = item?.images?.icon;

    return (
        <span
            className={cn(
                'relative shrink-0 block bg-steel-850 border border-line-800 overflow-hidden',
                className,
            )}
            style={{ width: size, height: size }}
        >
            {src && !failed ? (
                <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized
                    sizes={`${size}px`}
                    className="object-contain p-px"
                    onError={() => setFailed(true)}
                />
            ) : (
                <span
                    className="absolute inset-0 flex items-center justify-center font-mono text-ink-700"
                    style={{ fontSize: Math.max(9, Math.round(size / 3.4)) }}
                    aria-hidden="true"
                >
                    {(item?.name ?? item?.id ?? '?').charAt(0).toUpperCase()}
                </span>
            )}
        </span>
    );
}
