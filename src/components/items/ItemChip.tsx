'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Item } from '@/types/items';

/**
 * One item, named and linked — the app's smallest reference to something in the catalogue.
 *
 * Every route was inventing this: a 48px bordered tile that opens a new tab in
 * `ItemLinkIcon`, a bare underlined name in `BarterCosts`, a name over a mono sub-line in
 * `WantedInBarter`, and a rounded olive square with a hover-scale in `taskHelpers`. Four
 * appearances for one idea, and only one of them said what it linked to.
 *
 * A link rather than a hover card, deliberately: the detail page already exists and is better than
 * any summary a popover could hold. The chip's whole job is to get someone there while telling
 * them enough to decide whether to go.
 */

/** All a chip needs. Callers holding a whole `Item` pass it; the rest pass what they have. */
export interface ItemRef {
    id: string;
    name?: string;
    images?: Item['images'];
}

export interface ItemChipProps {
    item?: ItemRef | null;
    /** Used when the item did not resolve — the chip still links, and prints the id. */
    id?: string;
    /** How many of it. Rendered as a mono prefix, the way a barter cost reads. */
    count?: number;
    /** A second line under the name: a vendor, a loyalty level, whatever the caller is listing. */
    sub?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    /** `tile` drops the name and leaves the icon square on its own, for grids of many items. */
    layout?: 'chip' | 'tile';
    newTab?: boolean;
    className?: string;
}

const TILE: Record<NonNullable<ItemChipProps['size']>, string> = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
};

const NAME: Record<NonNullable<ItemChipProps['size']>, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm',
};

function Icon({ item, size }: { item: ItemRef | null; size: NonNullable<ItemChipProps['size']> }) {
    const [failed, setFailed] = useState(false);
    const src = item?.images?.icon;

    return (
        <span
            className={cn(
                'relative shrink-0 bg-steel-850 border border-line-800 overflow-hidden',
                'group-hover/chip:border-line-500 transition-colors',
                TILE[size],
            )}
        >
            {src && !failed ? (
                <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized
                    sizes="48px"
                    className="object-contain p-px"
                    onError={() => setFailed(true)}
                />
            ) : (
                // No placeholder art exists in `public/`, and the three files the old components
                // pointed at were never there. A letter is honest and costs no request.
                <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-ink-700">
                    {(item?.name ?? item?.id ?? '?').charAt(0).toUpperCase()}
                </span>
            )}
        </span>
    );
}

export default function ItemChip({
    item,
    id,
    count,
    sub,
    size = 'md',
    layout = 'chip',
    newTab = false,
    className,
}: ItemChipProps) {
    const ref: ItemRef | null = item ?? (id ? { id } : null);
    const itemId = ref?.id ?? id;
    const label = ref?.name ?? itemId ?? 'Unknown item';

    const body =
        layout === 'tile' ? (
            <Icon item={ref} size={size} />
        ) : (
            <>
                <Icon item={ref} size={size} />
                <span className="min-w-0">
                    <span className={cn('flex items-baseline gap-1.5 min-w-0', NAME[size])}>
                        {typeof count === 'number' && (
                            <span className="font-mono tabular text-ink-600 shrink-0">{count}×</span>
                        )}
                        <span
                            className={cn(
                                'truncate transition-colors',
                                ref?.name ? 'text-ink-300 group-hover/chip:text-ink-hi' : 'text-ink-700',
                            )}
                        >
                            {label}
                        </span>
                    </span>
                    {sub && <span className="micro-label text-ink-700 block mt-0.5">{sub}</span>}
                </span>
            </>
        );

    const shell = cn('group/chip inline-flex items-center gap-2 min-w-0 max-w-full', className);

    // An unresolved id has nowhere to go. It still renders — a cost that names an item the
    // catalogue does not publish is worth seeing, and a dead link is not.
    if (!itemId || !ref?.name) {
        return (
            <span className={shell} title={itemId}>
                {body}
            </span>
        );
    }

    return (
        <Link
            href={`/items/${itemId}`}
            {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={shell}
        >
            {body}
        </Link>
    );
}
