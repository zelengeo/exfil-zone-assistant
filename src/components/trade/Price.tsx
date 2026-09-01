'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import InfoPopover from '@/components/ui/info-popover';
import { PopoverHeading, PopoverNote, PopoverRow } from '@/components/ui/popover';
import { baseValue, formatAmount, isPriced, payersByAmount } from '@/lib/trade';
import { vendorOrg } from '@/lib/vendors';
import type { TradeStats } from '@/types/trade';

/**
 * Money, in the one shape the app writes it.
 *
 * `Price` is the figure itself — a mono tabular number with EZD as a micro-label, at three sizes.
 * Every place that was hand-assembling `formatEZD()` into a span uses it, so a price is the same
 * object on a card, in a ledger row, in a build summary and in the combat simulator.
 *
 * `ItemValue` is that figure applied to an item's sell value, with the answer to the question the
 * figure provokes attached: `basePrice` is the best of six vendor columns, and hovering it says
 * which vendors pay it and what the other five offer. That was previously answerable only by
 * opening the detail page and reading the ledger.
 */

export interface PriceProps {
    amount: number;
    size?: 'sm' | 'md' | 'lg';
    /** `hi` is the figure a block is about; `body` is a figure among others; `dim` is a footnote. */
    tone?: 'hi' | 'body' | 'dim';
    /** Drop the unit where a column header or a nearby label already carries it. */
    unit?: boolean;
    className?: string;
}

const FIGURE: Record<NonNullable<PriceProps['size']>, string> = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
};

const TONE: Record<NonNullable<PriceProps['tone']>, string> = {
    hi: 'text-ink-hi',
    body: 'text-ink-200',
    dim: 'text-ink-500',
};

export function Price({ amount, size = 'md', tone = 'hi', unit = true, className }: PriceProps) {
    return (
        <span className={cn('inline-flex items-baseline gap-1.5', className)}>
            <span className={cn('font-mono tabular leading-none', FIGURE[size], TONE[tone])}>
                {formatAmount(amount)}
            </span>
            {unit && <span className="font-mono text-[10px] uppercase text-ink-700">EZD</span>}
        </span>
    );
}

export interface ItemValueProps {
    stats: TradeStats;
    size?: PriceProps['size'];
    /**
     * Whether the figure reveals who pays it. Off inside a card or a row: both are already one big
     * link, and a popover trigger is a button, which may not live inside one.
     */
    breakdown?: boolean;
    className?: string;
}

export function ItemValue({ stats, size = 'md', breakdown = true, className }: ItemValueProps) {
    const value = baseValue(stats);
    const payouts = payersByAmount(stats);

    if (!isPriced(stats) || value <= 0) {
        return (
            <span className={cn('font-mono text-ink-700', size === 'sm' ? 'text-xs' : 'text-sm', className)}>
                Not traded
            </span>
        );
    }

    const figure = <Price amount={value} size={size} className={breakdown ? undefined : className} />;
    if (!breakdown || !payouts.length) return figure;

    const best = payouts[0].amount;
    const matching = payouts.filter((payout) => payout.amount === best).length;

    return (
        <InfoPopover
            trigger={figure}
            label={`${formatAmount(value)} EZD — see what each vendor pays`}
            className={className}
            side="bottom"
            align="start"
        >
            <PopoverHeading>Pays you</PopoverHeading>
            {payouts.map((payout) => (
                <PopoverRow
                    key={payout.vendor}
                    label={vendorOrg(payout.vendor)}
                    value={formatAmount(payout.amount)}
                    dim={payout.amount < best}
                />
            ))}
            <PopoverNote>
                {matching > 1
                    ? `${matching} vendors match the best price. The figure is that best price.`
                    : 'The figure is the best of the six vendor columns.'}
            </PopoverNote>
        </InfoPopover>
    );
}

export default Price;
