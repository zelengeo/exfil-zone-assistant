'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import InfoPopover, { InfoDot } from './info-popover';
import { PopoverHeading, PopoverNote, PopoverRow } from './popover';

/**
 * How far to trust a figure, and where it came from.
 *
 * Almost everything this wiki prints is read out of the game's own files and has been seen to hold
 * in a raid. That is the floor, it is what a reader assumes, and it carries no label — a badge on
 * every verified number is a badge on nothing. This module is for the rest: the figures that are
 * real data and still cannot be stated flatly.
 *
 * There are two of those, and naming them is the point of this file. Before this existed each site
 * invented its own wording and its own chrome — combat-sim wrote "estimate · models the player, not
 * the game" in loose ember text, the hideout pane hand-rolled a bordered tag — so two figures with
 * the same standing looked like different kinds of claim.
 *
 * ## The vocabulary
 *
 * | Level | Means | Live at |
 * |---|---|---|
 * | *(none)* | read from the game and confirmed | everything else |
 * | `unverified` | read from the game's files, never confirmed in play | hideout perks |
 * | `estimated` | computed by this app's model; the game never states it | the spray estimate |
 *
 * The two are genuinely different and must not be collapsed. An `unverified` figure is the game's
 * own number that nobody has watched work; the fix is to go and test it, and the tag comes off. An
 * `estimated` figure is ours and the game has no counterpart to check it against, so the tag is
 * permanent. A reader deciding whether to trust a number wants to know which of those they have.
 *
 * Add a third level only when a real figure needs one — not in advance. Two levels each with a live
 * call site is a vocabulary; six with four unused is decoration.
 *
 * ## Which tier it sits at
 *
 * This module supplies the parts. It does not decide where they go: that is the disclosure ladder
 * in `components/ui/AGENTS.md`, and the two live cases land on opposite sides of it on purpose.
 *
 * - The spray estimate is **tier 1**. Reading it as the game's own number changes how a player
 *   picks a gun, so its tag is on the page and `tone="loud"` is what that looks like.
 * - The hideout perks are **tier 3**. The effect line is on the page because it is data a reader
 *   came for; that the applied number has never been checked is provenance, so it rides inside the
 *   reveal on `SourceNote`'s heading and costs the panel no space.
 *
 * Ask the ladder's question, not this file's: would a reader who has used the panel ten times need
 * to be told again? If no, the tag belongs in the reveal.
 *
 * ## Why not `Badge`
 *
 * `ui/badge.tsx` is stock shadcn — `rounded-md`, and its default variant fills with `primary`,
 * which is ember. Cold Steel is radius 0, and ember is the one-action colour, so a passive
 * provenance chip must not wear it. The app's real chip idiom is `micro-label` inside a hairline
 * border, which is what these draw.
 */

export type Confidence = 'unverified' | 'estimated';

interface Level {
    /** The word on the chip. One word: it sits in a 9px mono face. */
    tag: string;
    /** The accessible name of the reveal's trigger, for a reader who cannot see what it sits beside. */
    triggerLabel: string;
}

const LEVELS: Record<Confidence, Level> = {
    unverified: { tag: 'Unverified', triggerLabel: 'Where these numbers come from' },
    estimated: { tag: 'Estimate', triggerLabel: 'How this is estimated' },
};

/**
 * The chip.
 *
 * `quiet` is the default and the only one legal inside a reveal: popover rule 2 keeps ember out of
 * a surface that is read rather than pressed, and a tag in there is a caption on a ledger, not an
 * alarm. `loud` is for a tier-1 tag on the page, and uses `ember-soft` on `ember-edge` — which is
 * exactly what those two tokens are for ("text inside ember-bordered chips").
 *
 * **`loud` is page-only, and never in a route that spends ember elsewhere.** The hideout gives
 * ember to the selected zone and to Level Up and to nothing else, so a loud tag there would read as
 * a third action. If a route needs page-level emphasis and cannot spare ember, keep `quiet` and let
 * placement carry the weight.
 */
export function ConfidenceTag({
    level,
    tone = 'quiet',
    className,
}: {
    level: Confidence;
    tone?: 'quiet' | 'loud';
    className?: string;
}) {
    return (
        <span
            className={cn(
                'micro-label flex-none border px-1.5 py-0.5',
                tone === 'loud'
                    ? 'border-ember-edge text-ember-soft'
                    : 'border-line-700 text-ink-600',
                className,
            )}
        >
            {LEVELS[level].tag}
        </span>
    );
}

/** One figure behind the reveal. */
export interface SourceRow {
    label: string;
    value: React.ReactNode;
    /** Rows present for completeness rather than for reading — an absent value, a zero that is real. */
    dim?: boolean;
}

export interface SourceNoteProps {
    level: Confidence;
    /** The eyebrow over the ledger, naming what the figures are. */
    heading: string;
    /** The raw figures. Omit for a source note that is prose only. */
    rows?: readonly SourceRow[];
    /**
     * Where the numbers come from and what is shaky about them, in plain words. Two sentences is
     * the working cap — the ladder allows three, and a source note that needs all three is usually
     * restating the ledger above it.
     */
    children: React.ReactNode;
    /** Defaults to the info dot. Pass a term or an eyebrow to make that the trigger instead. */
    trigger?: React.ReactNode;
    triggerStyle?: 'dashed' | 'icon' | 'bare';
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    className?: string;
}

/**
 * A reveal that carries figures the reader should not take flatly: the tag, the numbers, the source.
 *
 * The shape is fixed on purpose — heading and tag on one line, the ledger, then the source sentence
 * under a rule. Every site that reveals a shaky figure should look like every other one, because
 * the reader is learning a convention, and a convention that changes per route is not one.
 *
 * The tag rides on the heading rather than being repeated per row: it describes the whole ledger,
 * and a column of identical chips is noise. A ledger whose rows differ in standing is two notes.
 */
export default function SourceNote({
    level,
    heading,
    rows,
    children,
    trigger,
    triggerStyle = 'icon',
    side = 'bottom',
    align = 'end',
    className,
}: SourceNoteProps) {
    return (
        <InfoPopover
            triggerStyle={triggerStyle}
            trigger={trigger ?? <InfoDot />}
            label={LEVELS[level].triggerLabel}
            side={side}
            align={align}
            className={className}
        >
            <div className="mb-2 flex items-baseline justify-between gap-3">
                <PopoverHeading className="mb-0">{heading}</PopoverHeading>
                <ConfidenceTag level={level} />
            </div>
            {rows?.map((row) => (
                <PopoverRow key={row.label} label={row.label} value={row.value} dim={row.dim} />
            ))}
            <PopoverNote>{children}</PopoverNote>
        </InfoPopover>
    );
}
