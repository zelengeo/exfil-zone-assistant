import React from 'react';
import { cn } from '@/lib/utils';

/**
 * One labelled figure on a detail page.
 *
 * The eight `*SpecificStats` components each hand-rolled this shape — an icon, a label, a value —
 * forty-odd times between them, which is why they all drifted slightly apart on spacing and on
 * which half of the pair was emphasised. One component, one answer: the label recedes, the number
 * is monospaced and tabular so a column of them lines up.
 */

export interface StatLineProps {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
    /** For prose values — a name, a mode, a list — which should not be tabular. */
    text?: boolean;
    className?: string;
}

export default function StatLine({ label, value, icon, text = false, className }: StatLineProps) {
    return (
        <div className={cn('flex items-baseline gap-2 min-w-0', className)}>
            {icon && (
                <span className="text-ink-700 shrink-0 self-center" aria-hidden="true">
                    {icon}
                </span>
            )}
            <span className="text-xs text-ink-600 truncate">{label}</span>
            <span
                className={cn(
                    'ml-auto shrink-0 text-sm text-ink-200',
                    text ? 'text-right' : 'font-mono tabular',
                )}
            >
                {value}
            </span>
        </div>
    );
}

/** The grid the stat lines sit in. Two columns from `sm` up, one below. */
export function StatGrid({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2', className)}>
            {children}
        </div>
    );
}

/**
 * A titled sub-panel inside the specifications section.
 *
 * The `*SpecificStats` components each grouped their figures under a heading; this is that grouping
 * with one border and one eyebrow instead of eight slightly different ones.
 */
export function StatPanel({
    title,
    icon,
    children,
    className,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={cn('bg-steel-850 border border-line-800 p-4', className)}>
            <div className="flex items-center gap-2 mb-3">
                {icon && (
                    <span className="text-ink-700" aria-hidden="true">
                        {icon}
                    </span>
                )}
                <h4 className="eyebrow">{title}</h4>
            </div>
            {children}
        </section>
    );
}

/** An empty-state line inside a panel, for "this item has none of those". */
export function StatEmpty({ children }: { children: React.ReactNode }) {
    return <p className="text-xs text-ink-600">{children}</p>;
}
