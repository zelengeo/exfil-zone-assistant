'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

/**
 * A reveal that works for every input device.
 *
 * A Radix tooltip opens on hover and focus and closes on touch, and it may not contain a link —
 * which rules it out for everything the trade components need to reveal, all of which is either a
 * small table or a list of item links. So the app has one reveal instead: a popover that a mouse
 * opens by hovering, and a finger or a keyboard opens by pressing.
 *
 * Rule 3 of the popover rules lives here: the trigger carries the affordance. `dashed` (the
 * default) gives it the dashed hairline and `cursor-help` that every hoverable figure in the app
 * shares, so a reader can tell what will answer a question before they point at it.
 *
 * See `components/ui/popover.tsx` for the surface rules.
 */

export interface InfoPopoverProps {
    /** What the reader sees and points at. */
    trigger: React.ReactNode;
    children: React.ReactNode;
    /**
     * Trigger chrome. `dashed` is the standard hoverable-figure affordance for a term inside text
     * or a cell; `icon` is the header affordance and carries its own 44px hit target; `bare` opts
     * out, for a trigger that is already an affordance on its own. The whole vocabulary — there is
     * no fourth. See `components/ui/AGENTS.md`.
     */
    triggerStyle?: 'dashed' | 'icon' | 'bare';
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    /** Accessible name for the trigger, when the visible text is not enough on its own. */
    label?: string;
    className?: string;
    contentClassName?: string;
}

/** Long enough to cross the gap into the panel, short enough not to feel stuck open. */
const CLOSE_DELAY_MS = 120;

/**
 * The header affordance: the glyph that goes in `trigger` under `triggerStyle="icon"`.
 *
 * Small on purpose. A column header carrying one of these is still a header, and a row of four
 * should read as texture rather than as four buttons — the colour step on hover and focus is what
 * says it answers a question. The hit target is on the trigger, not on the glyph.
 */
export function InfoDot({ className }: { className?: string }) {
    return <Info aria-hidden="true" className={cn('w-3 h-3 shrink-0', className)} />;
}

export default function InfoPopover({
    trigger,
    children,
    triggerStyle = 'dashed',
    side = 'top',
    align = 'center',
    label,
    className,
    contentClassName,
}: InfoPopoverProps) {
    const [open, setOpen] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Hover is a mouse affordance. A touch pointer emits enter/leave too, and honouring it makes
    // the panel flash open and shut under the finger that is trying to tap the trigger.
    const hovering = useRef(false);
    // Whether this opening began as a hover. A hover must neither take focus on open nor hand it
    // back on close — doing so leaves an ember focus ring on a figure the reader merely passed over.
    const byHover = useRef(false);

    const cancelClose = useCallback(() => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    }, []);

    const scheduleClose = useCallback(() => {
        cancelClose();
        closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
    }, [cancelClose]);

    useEffect(() => cancelClose, [cancelClose]);

    const onPointerEnter = (event: React.PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        hovering.current = true;
        byHover.current = true;
        cancelClose();
        setOpen(true);
    };

    const onPointerLeave = (event: React.PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        hovering.current = false;
        scheduleClose();
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label={label}
                    onClick={() => {
                        byHover.current = false;
                    }}
                    onPointerEnter={onPointerEnter}
                    onPointerLeave={onPointerLeave}
                    className={cn(
                        'text-left transition-colors',
                        triggerStyle !== 'icon' && 'inline-flex items-baseline gap-1 align-baseline',
                        // A dashed trigger's usual home is a dense table header, where the label is
                        // ~11px tall. The hit area grows UPWARD from just under the label rather
                        // than centring on it: centred, a box big enough to tap reaches into the
                        // first data row and swallows taps meant for it, and what sits above a
                        // header is a legend or a caption that takes no clicks. 32px, not the 44px
                        // asked for elsewhere, for the same reason — it has one direction to grow.
                        triggerStyle === 'dashed' &&
                            'relative border-b border-dashed border-line-500 cursor-help hover:border-ink-600 ' +
                                "before:content-[''] before:absolute before:inset-x-[-0.25rem] " +
                                'before:bottom-[-0.25rem] before:h-8',
                        // The 44px target the VR and touch rules ask for, without letting it set
                        // the height of the dense header row the dot usually sits in.
                        triggerStyle === 'icon' &&
                            'relative inline-flex items-center justify-center align-middle cursor-help ' +
                                'text-ink-700 hover:text-ink-400 focus-visible:text-ink-400 ' +
                                "before:content-[''] before:absolute before:left-1/2 before:top-1/2 " +
                                'before:w-11 before:h-11 before:-translate-x-1/2 before:-translate-y-1/2',
                        className,
                    )}
                >
                    {trigger}
                </button>
            </PopoverTrigger>
            <PopoverContent
                side={side}
                align={align}
                className={contentClassName}
                // Opened by hover, focus must stay where the reader left it.
                onOpenAutoFocus={(event) => {
                    if (byHover.current) event.preventDefault();
                }}
                onCloseAutoFocus={(event) => {
                    if (byHover.current) event.preventDefault();
                }}
                onPointerEnter={cancelClose}
                onPointerLeave={(event) => {
                    if (event.pointerType !== 'mouse') return;
                    scheduleClose();
                }}
            >
                {children}
            </PopoverContent>
        </Popover>
    );
}
