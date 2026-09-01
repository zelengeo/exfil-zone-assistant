'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
    /** Trigger chrome. `dashed` is the standard hoverable-figure affordance; `bare` opts out. */
    triggerStyle?: 'dashed' | 'bare';
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    /** Accessible name for the trigger, when the visible text is not enough on its own. */
    label?: string;
    className?: string;
    contentClassName?: string;
}

/** Long enough to cross the gap into the panel, short enough not to feel stuck open. */
const CLOSE_DELAY_MS = 120;

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
                        'inline-flex items-baseline gap-1 text-left align-baseline',
                        triggerStyle === 'dashed' &&
                            'border-b border-dashed border-line-500 cursor-help hover:border-ink-600',
                        'transition-colors',
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
