import React from 'react';
import { cn } from '@/lib/utils';
import type { Coverage } from '@/lib/protection/coverage';
import { armorClassColor, armorClassLabel, UNCOVERED_COLOR } from '@/lib/protection/armorClassScale';
import InfoPopover from '@/components/ui/info-popover';
import { PopoverHeading, PopoverProse } from '@/components/ui/popover';

/**
 * The numbers behind the picture, one row per collision body the piece actually covers.
 *
 * Shares its selection with the viewer beside it — hovering a row lights its capsule and the other
 * way round — the same way `BuildSlotList` is the gunsmith's one selection model rather than each
 * panel keeping its own idea of what is chosen.
 */

export interface ZoneTableProps {
    coverage: Coverage;
    selected?: number | null;
    onSelect?: (capsuleIndex: number) => void;
    onHover?: (capsuleIndex: number | null) => void;
    className?: string;
}

/**
 * Header and rows share one template so a label sits over its own digits.
 *
 * The narrow set is not the wide set scaled down, it is measured. At 375px this table has about
 * 202px to spend, and the wide tracks plus their gaps come to roughly 192 of it before the zone
 * column has asked for anything — so `minmax(0,1fr)` resolved to nearly zero and every zone name
 * wrapped a character at a time. Chrome's mobile text boosting makes it exactly zero, but the
 * squeeze is there on a real phone too.
 *
 * Below `sm` the numeric tracks are sized to their DATA (22 / 25 / 33px measured) rather than to
 * their headers, and the headers give up `tracking-eyebrow` to fit — see `ColumnHead`. That leaves
 * the zone column ~78px, enough for the part name on one line with the bone wrapping under it.
 */
const COLUMNS =
    'grid gap-x-1.5 grid-cols-[minmax(0,1fr)_1.75rem_1.75rem_2.25rem] ' +
    'sm:gap-x-3 sm:grid-cols-[minmax(0,1fr)_3.25rem_3rem_3.5rem]';

const PART_LABELS: Record<string, string> = {
    Head: 'Head',
    UpperChest: 'Upper chest',
    LowerChest: 'Lower chest',
    LeftArm: 'Left arm',
    RightArm: 'Right arm',
    LeftLeg: 'Left leg',
    RightLeg: 'Right leg',
    None: '—',
};

/** `spine_03` reads as a bone, not as a place. Give the row both. */
function boneLabel(bone: string): string {
    return bone.replace(/_/g, ' ');
}

/** The same bone where the part beside it has already said which side: `lowerarm_l` -> `lowerarm`. */
function shortBone(bone: string): string {
    return bone.replace(/_[lr]$/i, '').replace(/_/g, ' ');
}

/**
 * A column header that answers what its column means.
 *
 * This table used to close with one four-sentence footnote defining all of its columns, set in
 * `micro-label` — 9px uppercase mono, a label face carrying paragraphs, permanently on screen for
 * a reader who needed it once. It is now a note per column, on the header that raises the
 * question. The disclosure ladder is in `components/ui/AGENTS.md`.
 *
 * The label itself is the trigger rather than a dot beside it. A dot costs about a rem of column
 * width, and three of them turned every row on a phone into three wrapped lines — the header here
 * is 3rem wide and has none to give.
 *
 * `.eyebrow-tight` for the same reason: the wide tracking is what makes a five-letter eyebrow 42px,
 * and 42 × 3 is more than this table can spend on headers at phone width. It gets the tracking back
 * at `sm`, where the wide tracks apply too.
 */
function ColumnHead({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <InfoPopover
            trigger={<span className="eyebrow-tight">{label}</span>}
            label={`What ${label} means`}
            side="bottom"
            align="end"
            className="justify-self-end"
        >
            <PopoverHeading>{label}</PopoverHeading>
            <PopoverProse>{children}</PopoverProse>
        </InfoPopover>
    );
}

export default function ZoneTable({ coverage, selected, onSelect, onHover, className }: ZoneTableProps) {
    // Only what the plate actually reaches. A vest covers four bones out of nineteen, so listing
    // the rest was fifteen rows of dashes for every one row of data — and the useful reading, "what
    // is left open", is a list of body parts rather than a list of collision bodies. The footer
    // names them; the picture beside this already draws them unfilled.
    const rows = [...coverage.zones]
        .filter((zone) => zone.fraction > 0.001)
        .sort((a, b) => b.fraction - a.fraction || a.capsule.bone.localeCompare(b.capsule.bone));

    // What is left open, by body part. A part that also appears above — the IOTV plates a shoulder
    // but not the forearm under it — is named with the bones that are actually bare, so the footer
    // never contradicts a 100% row two lines up.
    const coveredParts = new Set(rows.map((zone) => zone.part));
    const bare = new Map<string, string[]>();
    for (const zone of coverage.zones) {
        if (zone.fraction > 0.001 || zone.part === 'None') continue;
        const bones = bare.get(zone.part) ?? [];
        bones.push(shortBone(zone.capsule.bone));
        bare.set(zone.part, bones);
    }

    const uncovered = [...bare].map(([part, bones]) => {
        const label = PART_LABELS[part] ?? part;
        return coveredParts.has(part) ? `${label} (${[...new Set(bones)].join(', ')})` : label;
    });

    return (
        <div className={cn('min-w-0', className)}>
            <div className={cn(COLUMNS, 'px-2 pb-1.5 border-b border-line-900')}>
                {/* Zone carries no note. The footnote's opening sentence — "only the bodies this
                    piece reaches are listed" — is answered as data by the Unprotected line under
                    the table, so it was deleted rather than hidden. */}
                <span className="eyebrow-tight">Zone</span>
                <ColumnHead label="Class">
                    The plate&rsquo;s own rating for that spot, which need not match the vest&rsquo;s
                    headline &mdash; a vest rates its chest plate and its shoulder separately.
                </ColumnHead>
                <ColumnHead label="Wedge">
                    The protected arc, and it is two-sided: a 90&deg; plate covers front and back,
                    never the flank.
                </ColumnHead>
                <ColumnHead label="Cover">
                    The share of that collision body the plate actually protects, measured by running
                    the game&rsquo;s own <em>Is Protected</em> test over its surface.
                </ColumnHead>
            </div>

            <div className="divide-y divide-line-900">
                {rows.map((zone) => {
                    const isSelected = selected === zone.capsule.index;

                    return (
                        <div
                            key={zone.capsule.index}
                            role={onSelect ? 'button' : undefined}
                            tabIndex={onSelect ? 0 : undefined}
                            onClick={() => onSelect?.(zone.capsule.index)}
                            onKeyDown={(e) => {
                                if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
                                    e.preventDefault();
                                    onSelect(zone.capsule.index);
                                }
                            }}
                            onMouseEnter={() => onHover?.(zone.capsule.index)}
                            onMouseLeave={() => onHover?.(null)}
                            className={cn(
                                COLUMNS,
                                'items-baseline px-2 py-1.5 border-l-2 transition-colors',
                                isSelected ? 'border-l-ember bg-steel-800' : 'border-l-transparent',
                                onSelect && 'cursor-pointer hover:bg-steel-800',
                            )}
                        >
                            <span className="min-w-0">
                                <span className="text-xs text-ink-200">
                                    {PART_LABELS[zone.part] ?? zone.part}
                                </span>
                                {/* JSX drops the newline between these two spans, and a margin is
                                    not a break opportunity — so "chest" and its bone were one
                                    unbreakable 84px word, and the part name broke instead of it.
                                    `wbr` gives the line somewhere to break at no visual cost. */}
                                <wbr />
                                <span className="micro-label text-ink-700 ml-1.5">
                                    {boneLabel(zone.capsule.bone)}
                                </span>
                            </span>

                            {/* The swatch is the picture's tone for this class, so a reader can
                                match a row to a plate without counting limbs. */}
                            <span className="flex items-center justify-end gap-1">
                                <span
                                    className="w-2 h-2 shrink-0"
                                    style={{ backgroundColor: zone.zone ? armorClassColor(zone.zone.armorClass) : UNCOVERED_COLOR }}
                                    aria-hidden="true"
                                />
                                <span className="font-mono tabular text-xs text-ink-100">
                                    {zone.zone ? armorClassLabel(zone.zone.armorClass) : '—'}
                                </span>
                            </span>

                            <span className="font-mono tabular text-xs text-right text-ink-500">
                                {zone.zone ? `${zone.zone.angle}°` : '—'}
                            </span>

                            <span className="font-mono tabular text-xs text-right text-ink-100">
                                {Math.round(zone.fraction * 100)}%
                            </span>
                        </div>
                    );
                })}
            </div>

            {rows.length === 0 && (
                <p className="text-xs text-ink-600 px-2 py-3">
                    The zones this piece authors reach none of the body&apos;s collision shapes — no hit
                    anywhere is stopped by it.
                </p>
            )}

            {/* Data the reader came for, not an explanation of data — it stays on the page. */}
            {uncovered.length > 0 && (
                <p className="mt-3 text-xs leading-relaxed text-ink-600">
                    <span className="eyebrow">Unprotected</span> {uncovered.join(', ')}.
                </p>
            )}
        </div>
    );
}
