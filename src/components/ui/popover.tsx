'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';

/**
 * The reveal surface. One skin, one behaviour, everywhere.
 *
 * COLD STEEL POPOVER RULES — these are the design, not a suggestion:
 *
 *  1. ONE SURFACE. `steel-750` ground, a 1px `line-600` hairline, radius 0, no shadow, no arrow.
 *     Cold Steel separates planes with a line and a background step, never with elevation, and a
 *     popover is a plane like any other. The old shadcn default filled it with `bg-primary` —
 *     ember, the one-action colour — which made every passive hint look like a call to action.
 *  2. EMBER NEVER APPEARS INSIDE ONE. A popover is something you read, not something you press.
 *     Semantic colour is allowed where the app already means it (`warn` for a task gate, `good` /
 *     `bad` for a verdict); the accent is not.
 *  3. THE AFFORDANCE LIVES ON THE TRIGGER. A dashed border or dotted underline plus `cursor-help`,
 *     or a real button. Never a coloured trigger that only reveals itself on hover.
 *  4. TWO GENRES, BOTH CAPPED. A LEDGER is an eyebrow then a two-column grid with mono tabular
 *     figures on the right — `PopoverHeading` + `PopoverRow`. A NOTE is an eyebrow then at most
 *     three sentences of reading-face prose — `PopoverHeading` + `PopoverProse`. Past the note cap
 *     it is a guide section, and the popover keeps three sentences plus the link to it.
 *  5. 18REM MAX. Anything wider has outgrown the format.
 *  6. TOOLTIP vs POPOVER. `Tooltip` is one line of plain text, hover/focus only, never
 *     interactive. Anything with links, rows or figures is a `Popover` — see `InfoPopover`, which
 *     opens on hover for a mouse and on tap or Enter for everything else.
 *
 * Which of these a given piece of text belongs in at all — and when it is allowed to stay on the
 * page instead — is the disclosure ladder in `components/ui/AGENTS.md`.
 */

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
    return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
    return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
    return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverContent({
    className,
    align = 'center',
    sideOffset = 6,
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                data-slot="popover-content"
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    'z-50 w-auto max-w-72 origin-(--radix-popover-content-transform-origin)',
                    'bg-steel-750 border border-line-600 text-ink-300 p-3',
                    'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out',
                    'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                    'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
                    'data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1',
                    className,
                )}
                {...props}
            />
        </PopoverPrimitive.Portal>
    );
}

/** The eyebrow every structured popover opens with. Rule 4. */
function PopoverHeading({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={cn('eyebrow mb-2', className)} {...props} />;
}

/**
 * The two-column body: a label on the left, a mono tabular figure on the right. Rule 4 again —
 * a popover that lists amounts is a small ledger, and every ledger in the app lines its digits up.
 */
function PopoverRow({
    label,
    value,
    dim,
    className,
}: {
    label: React.ReactNode;
    value: React.ReactNode;
    /** Rows that are present for completeness rather than for reading. */
    dim?: boolean;
    className?: string;
}) {
    return (
        <div className={cn('flex items-baseline justify-between gap-4 py-0.5', className)}>
            <span className={cn('text-xs truncate', dim ? 'text-ink-700' : 'text-ink-400')}>{label}</span>
            <span
                className={cn(
                    'font-mono tabular text-xs shrink-0',
                    dim ? 'text-ink-700' : 'text-ink-200',
                )}
            >
                {value}
            </span>
        </div>
    );
}

/**
 * The note body: the sentences a panel used to close with. Rule 4's other genre.
 *
 * A reading face, deliberately — `micro-label` is 9px uppercase mono built for a four-word column
 * header, and the footnotes this replaces were setting whole paragraphs in it. Sized to stay
 * legible at VR viewing distance, which is a step larger than a desktop app would use.
 */
function PopoverProse({ className, ...props }: React.ComponentProps<'p'>) {
    return (
        <p
            className={cn('text-xs leading-relaxed text-ink-300 [&_em]:not-italic [&_em]:text-ink-100', className)}
            {...props}
        />
    );
}

/** The closing line — provenance, or the caveat a figure needs. */
function PopoverNote({ className, ...props }: React.ComponentProps<'p'>) {
    return (
        <p
            className={cn('text-[11px] leading-snug text-ink-600 mt-2 pt-2 border-t border-line-700', className)}
            {...props}
        />
    );
}

export {
    Popover,
    PopoverTrigger,
    PopoverAnchor,
    PopoverContent,
    PopoverHeading,
    PopoverRow,
    PopoverProse,
    PopoverNote,
};
