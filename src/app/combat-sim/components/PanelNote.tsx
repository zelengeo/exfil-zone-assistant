'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import InfoPopover from '@/components/ui/info-popover';

/**
 * The explanation, folded away.
 *
 * Every panel on this page used to end in a paragraph explaining how to read it — how the pips
 * work, which of the six bench figures reach the damage model, why the head is split in two. All of
 * it true, and all of it permanently occupying the panel it explained. On a phone held beside a
 * headset that prose was costing more rows than the figures it described, and it charged the same
 * rent on the hundredth visit as on the first.
 *
 * So the note keeps its text and gives up its space: an `i` beside the panel heading, opening the
 * same words on demand. Nothing is deleted — a reader who needs the explanation is one tap from it,
 * and a reader who does not never pays for it again.
 *
 * Anything a reader needs *without* asking is not a note. It belongs in the panel, as a figure or a
 * label.
 */

export interface PanelNoteProps {
    /** Names what the note explains, for a reader who cannot see the panel it sits in. */
    label: string;
    children: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    className?: string;
}

export default function PanelNote({
    label, children, side = 'bottom', align = 'end', className,
}: PanelNoteProps) {
    return (
        <InfoPopover
            triggerStyle="bare"
            side={side}
            align={align}
            label={`How to read ${label}`}
            className={cn(
                'shrink-0 w-8 h-8 items-center justify-center text-ink-700',
                'hover:text-ink-300 transition-colors',
                className,
            )}
            contentClassName="max-w-xs"
            trigger={<Info size={14} aria-hidden="true" />}
        >
            <div className="text-sm text-ink-400 leading-relaxed space-y-2">{children}</div>
        </InfoPopover>
    );
}
