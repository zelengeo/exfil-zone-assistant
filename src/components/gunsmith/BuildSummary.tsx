'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { GunsmithPart } from '@/types/gunsmith';
import VendorTag from '@/components/trade/VendorTag';
import { Price } from '@/components/trade/Price';
import { cheapestOffer } from './PartAvailability';

interface BuildSummaryProps {
    parts: GunsmithPart[];
    weight: number;
    className?: string;
}

/**
 * What it takes to own this build.
 *
 * Price is quiet on purpose — it is the least interesting number on the screen, and a build is not
 * a budget on the wiki. The loyalty levels are the part that changes a plan: a build a player
 * cannot buy for another ten hours is worth knowing about before they save it.
 */
export default function BuildSummary({ parts, weight, className }: BuildSummaryProps) {
    const summary = useMemo(() => {
        const levels = new Map<string, number>();
        let total = 0;
        let unpriced = 0;
        for (const part of parts) {
            const offer = cheapestOffer(part);
            if (!offer) {
                unpriced += 1;
                continue;
            }
            total += offer.price;
            levels.set(offer.vendor, Math.max(levels.get(offer.vendor) ?? 0, offer.level));
        }
        return {
            total,
            unpriced,
            vendors: [...levels.entries()].sort((a, b) => a[0].localeCompare(b[0])),
        };
    }, [parts]);

    return (
        <div className={cn('flex flex-wrap items-center gap-x-5 gap-y-2', className)}>
            <div>
                <div className="micro-label text-ink-700">Weight</div>
                <div className="font-mono tabular text-sm text-ink-200 mt-0.5">{`${weight.toFixed(2)} kg`}</div>
            </div>

            <div>
                <div className="micro-label text-ink-700">To buy this build</div>
                <div className="font-mono tabular text-sm text-ink-300 mt-0.5">
                    {summary.vendors.length ? (
                        <span className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            {summary.vendors.map(([vendor, level]) => (
                                <VendorTag key={vendor} vendor={vendor} level={level} />
                            ))}
                        </span>
                    ) : (
                        '—'
                    )}
                </div>
            </div>

            <div>
                <div className="micro-label text-ink-700">Parts cost</div>
                <div className="font-mono tabular text-sm text-ink-400 mt-0.5">
                    <Price amount={summary.total} size="sm" tone="dim" />
                    {summary.unpriced > 0 && (
                        <span className="text-ink-700">{` + ${summary.unpriced} not sold`}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
