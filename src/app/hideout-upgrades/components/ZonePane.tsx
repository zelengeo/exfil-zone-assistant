'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, ArrowUp, Check, ChevronDown, ChevronLeft, ChevronUp, Flag, Info, Lock, Undo, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatEZD } from '@/lib/trade';
import type { Item } from '@/types/items';
import SourceNote from '@/components/ui/confidence';
import {
    type AreaLevels,
    type Built,
    type Upgrade,
    areaName,
    canBuild,
    canUndo,
    gatesOf,
    maxLevelOf,
    perkRowsOf,
    roomName,
    upgradeId,
} from '../utils/hideout';

/**
 * One zone, and what it asks for.
 *
 * The route used to open this as a full-screen modal over the map, so choosing between two zones
 * meant closing one to look at the other. It is a pane beside the plate on desktop and a full-height
 * sheet on the phone — one tree either way, positioned by CSS, because a second copy of a panel this
 * detailed is a second copy to keep correct.
 */

export interface ZonePaneProps {
    upgrade: Upgrade | null;
    levels: AreaLevels;
    built: Built;
    questNames: Record<string, string>;
    getItemById: (id: string) => Item | undefined;
    onClose: () => void;
    onLevel: (level: number) => void;
    onBuild: (build: boolean) => void;
    /** Jump to the area standing in this one's way. */
    onGoToArea: (areaId: string) => void;
}

export default function ZonePane({
    upgrade, levels, built, questNames, getItemById, onClose, onLevel, onBuild, onGoToArea,
}: ZonePaneProps) {
    return (
        <section
            className={cn(
                'min-h-0 flex-col border border-line-900 bg-steel-900',
                upgrade ? 'fixed inset-0 z-50 flex' : 'hidden',
                'shell:static shell:z-auto shell:flex',
            )}
            aria-label="Zone detail"
        >
            {upgrade
                ? <ZoneDetail
                    upgrade={upgrade}
                    levels={levels}
                    built={built}
                    questNames={questNames}
                    getItemById={getItemById}
                    onClose={onClose}
                    onLevel={onLevel}
                    onBuild={onBuild}
                    onGoToArea={onGoToArea}
                />
                : <Empty />}
        </section>
    );
}

function Empty() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="block h-2 w-2 bg-line-500" aria-hidden="true" />
            <p className="eyebrow">No zone selected</p>
            <p className="max-w-[26ch] text-sm leading-relaxed text-ink-700">
                Pick a pin on the plate to see what its next level costs and what stands in the way.
            </p>
        </div>
    );
}

function ZoneDetail({
    upgrade, levels, built, questNames, getItemById, onClose, onLevel, onBuild, onGoToArea,
}: ZonePaneProps & { upgrade: Upgrade }) {
    const { areaId, level } = upgrade;
    const current = levels[areaId] ?? 0;
    const max = maxLevelOf(areaId);
    const isBuilt = current >= level;

    const buildable = canBuild(areaId, level, levels);
    const undoable = canUndo(areaId, level, built);

    const gates = gatesOf(upgrade, levels, questNames);
    const missingAreas = gates.filter((gate) => gate.kind === 'area' && !gate.met);
    const taskGates = gates.filter((gate) => gate.kind === 'task');
    const blocked = !isBuilt && !buildable;

    const materials = Object.entries(upgrade.exchange);
    const units = materials.reduce((sum, [, quantity]) => sum + quantity, 0);

    const perks = perkRowsOf(upgrade);

    /** The one area whose next level would unblock this one, when there is exactly one. */
    const blocker = missingAreas.length === 1 && missingAreas[0].kind === 'area' ? missingAreas[0] : null;

    return (
        <>
            {/* Phone gets a sheet handle and a back row; desktop closes from the artwork. */}
            <div className="flex-none shell:hidden">
                <div className="flex h-3.5 items-center justify-center">
                    <span className="block h-[3px] w-11 bg-line-500" aria-hidden="true" />
                </div>
                <div className="flex h-12 items-center gap-2.5 border-b border-line-900 px-3">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Back to the map"
                        className="flex h-11 w-11 flex-none items-center justify-center border border-line-700 text-ink-400"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="micro-label flex-1 truncate text-ink-600">
                        {roomName(upgrade.categoryId)} · {areaName(areaId)}
                    </span>
                </div>
            </div>

            <header className="relative h-[106px] flex-none overflow-hidden bg-black shell:h-[106px]">
                <Image
                    src={`/images/hideout/${upgrade.levelUpIcon}.webp`}
                    alt=""
                    fill
                    unoptimized
                    sizes="420px"
                    className="object-cover"
                />
                <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-steel-950/90 via-steel-950/70 to-steel-950/25"
                    aria-hidden="true"
                />
                <div className="absolute bottom-3 left-4 right-12">
                    <span className={cn('micro-label block', isBuilt ? 'text-good' : blocked ? 'text-ember-soft' : 'text-warn')}>
                        {isBuilt
                            ? `Built · level ${level} of ${max}`
                            : level === 1 ? `Not built · level 1 of ${max}` : `Level ${current} → ${level}`}
                    </span>
                    <h2 className="mt-2 truncate font-display text-[28px] font-extrabold uppercase leading-none tracking-[0.02em] text-ink-hi">
                        {upgrade.upgradeName}
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-2.5 top-2.5 hidden h-11 w-11 items-center justify-center border
                               border-line-700 bg-steel-950/70 text-ink-500 hover:text-ink-200 shell:flex shell:h-7 shell:w-7"
                >
                    <X size={14} />
                </button>
            </header>

            <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-4 pt-3.5">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'micro-label inline-flex items-center gap-1.5 border px-2 py-1',
                            isBuilt
                                ? 'border-good/60 bg-good/[0.07] text-good'
                                : blocked
                                    ? 'border-ember-edge bg-ember/[0.08] text-ember-soft'
                                    : 'border-warn bg-warn/[0.07] text-warn',
                        )}
                    >
                        {blocked && <Lock size={11} className="text-ember" aria-hidden="true" />}
                        {isBuilt ? 'Built' : blocked ? 'Locked' : 'Ready to build'}
                    </span>
                    <span className="micro-label hidden border border-line-700 px-2 py-1 text-ink-600 shell:inline-flex">
                        {roomName(upgrade.categoryId)}
                    </span>

                    <div className="flex-1" />

                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: max }, (_, i) => i + 1).map((step) => {
                            const id = upgradeId(areaId, step);
                            return (
                                <button
                                    key={step}
                                    type="button"
                                    disabled={!id}
                                    onClick={() => onLevel(step)}
                                    aria-current={step === level ? 'true' : undefined}
                                    aria-label={`Level ${step}`}
                                    className={cn(
                                        'tabular flex h-7 w-7 items-center justify-center font-mono text-[11px] font-bold',
                                        step === level
                                            ? 'border border-ember bg-ember text-ember-ink'
                                            : step <= current
                                                ? 'border border-line-500 bg-steel-700 text-good'
                                                : 'border border-line-700 bg-transparent text-ink-700',
                                    )}
                                >
                                    {step}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-500 text-pretty">
                    {upgrade.upgradeDesc}
                </p>

                <Perks perks={perks} />

                {(missingAreas.length > 0 || taskGates.length > 0 || gates.length > 0) && (
                    <div className="flex flex-col gap-2">
                        <Rule
                            dot={blocked ? 'bg-ember' : 'bg-ink-600'}
                            ink={blocked ? 'text-ember' : 'text-ink-600'}
                            label="Requires"
                            note={blocked
                                ? [missingAreas.length && `${missingAreas.length} zone${missingAreas.length > 1 ? 's' : ''}`,
                                   taskGates.length && `${taskGates.length} task${taskGates.length > 1 ? 's' : ''}`]
                                    .filter(Boolean).join(' · ')
                                : 'All met'}
                        />
                        {gates.map((gate) => (gate.kind === 'area' ? (
                            <div
                                key={`area-${gate.areaId}`}
                                className={cn(
                                    'flex items-center gap-2.5 border px-3 py-2.5',
                                    gate.met
                                        ? 'border-line-800 bg-steel-800'
                                        : 'border-ember-edge border-l-2 border-l-ember bg-steel-900',
                                )}
                            >
                                {gate.met
                                    ? <Check size={13} className="flex-none text-good" aria-hidden="true" />
                                    : <Lock size={13} className="flex-none text-ember" aria-hidden="true" />}
                                <span className={cn('min-w-0 flex-1 truncate text-[12.5px]', gate.met ? 'text-ink-400' : 'text-ember-soft')}>
                                    {gate.label} · Level {gate.level}
                                </span>
                                <span className={cn('micro-label flex-none', gate.met ? 'text-ink-700' : 'text-ember-soft')}>
                                    {gate.met ? 'Met' : 'Missing'}
                                </span>
                            </div>
                        ) : (
                            <div key={`task-${gate.questId}`} className="flex items-center gap-2.5 border border-line-800 bg-steel-800 px-3 py-2.5">
                                <Flag size={13} className="flex-none text-info" aria-hidden="true" />
                                <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-400">{gate.label}</span>
                                <span className="micro-label flex-none text-info">Task gate</span>
                            </div>
                        )))}
                    </div>
                )}

                <div className="flex items-center justify-between border border-line-700 bg-steel-750 px-3.5 py-3">
                    <span>
                        <span className="micro-label block">Cost</span>
                        <span className="mt-1.5 block text-[11px] text-ink-700">Money, on top of the materials below</span>
                    </span>
                    <span className="tabular flex-none font-mono text-xl font-bold tracking-[0.04em] text-warn">
                        {formatEZD(upgrade.price)}
                    </span>
                </div>

                {materials.length > 0 && (
                    <div className="flex flex-col gap-2.5">
                        <Rule label="Materials" note={`${materials.length} types · ${units} units`} />
                        <div className="grid grid-cols-2 gap-2">
                            {materials.map(([itemId, quantity]) => {
                                const item = getItemById(itemId);
                                return (
                                    <div key={itemId} className="flex min-w-0 items-center gap-2.5 border border-line-800 bg-steel-800 p-[7px] pr-2.5">
                                        <span className="relative block h-9 w-9 flex-none border border-line-700 bg-steel-550">
                                            <Image
                                                src={item?.images.icon || '/images/missing-item.png'}
                                                alt=""
                                                fill
                                                unoptimized
                                                sizes="38px"
                                                className="object-contain p-[3px]"
                                            />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[11.5px] text-ink-300">{item?.name ?? itemId}</span>
                                            {item?.subcategory && (
                                                <span className="micro-label mt-1 block text-ink-700">{item.subcategory}</span>
                                            )}
                                        </span>
                                        <span className="tabular flex-none font-mono text-[13px] font-bold text-ink-200">×{quantity}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex-1" />
            </div>

            <footer className="flex flex-none flex-col gap-2.5 border-t border-line-900 px-4 pb-4 pt-3">
                {blocker && (
                    <span className="flex items-start gap-2">
                        <Info size={13} className="mt-0.5 flex-none text-ink-700" aria-hidden="true" />
                        <span className="text-[11.5px] leading-snug text-ink-700 text-pretty">
                            {blocker.label} level {blocker.level} opens this one.
                        </span>
                    </span>
                )}

                <div className="flex gap-2.5">
                    {isBuilt ? (
                        <button
                            type="button"
                            onClick={() => onBuild(false)}
                            disabled={!undoable}
                            title={undoable ? undefined : 'Something built on top of this has to go first'}
                            className="micro-label inline-flex h-12 flex-1 items-center justify-center gap-2 border
                                       border-line-500 text-ink-400 transition-colors hover:bg-steel-800
                                       disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Undo size={14} aria-hidden="true" />
                            Undo
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => onBuild(true)}
                            disabled={!buildable}
                            className={cn(
                                'micro-label inline-flex h-12 flex-1 items-center justify-center gap-2 font-semibold transition-colors',
                                buildable
                                    ? 'bg-ember text-ember-ink hover:bg-ember-hover'
                                    : 'cursor-not-allowed border border-line-700 bg-steel-800 text-ink-800',
                            )}
                        >
                            <ArrowUp size={14} aria-hidden="true" />
                            Level up
                        </button>
                    )}

                    {blocker ? (
                        <button
                            type="button"
                            onClick={() => onGoToArea(blocker.areaId)}
                            className="micro-label inline-flex h-12 items-center justify-center gap-2 border
                                       border-line-500 px-4 font-semibold text-ink-400 transition-colors hover:bg-steel-800"
                        >
                            <span className="max-w-[14ch] truncate">{blocker.label}</span>
                            <ArrowRight size={14} aria-hidden="true" />
                        </button>
                    ) : (
                        <span className="flex flex-none items-center gap-1.5">
                            <LevelStep icon={ChevronUp} label="Next level" to={level + 1} areaId={areaId} onLevel={onLevel} />
                            <LevelStep icon={ChevronDown} label="Previous level" to={level - 1} areaId={areaId} onLevel={onLevel} />
                        </span>
                    )}
                </div>
            </footer>
        </>
    );
}

/**
 * What the level grants, under the description it refines.
 *
 * Secondary on purpose. `upgradeDesc` already says what the level is for in the game's own words;
 * these are the quantified versions of the same claim, so they read a step quieter and never take
 * a section rule of their own the way Requires and Materials do.
 *
 * The numbers are the problem this shape exists to handle. The game authors the menu line and the
 * applied value separately and they disagree often — Intelligent Lv2 prints "+5%" against an
 * applied 0.15, and Refrigerator counts in a unit the line never names — so the page carries the
 * line a player can act on and the reveal carries the raw figure with the caveat attached. That
 * split is the disclosure ladder's tier 1 / tier 3 test: the effect is data the reader came for,
 * the provenance is not.
 *
 * `SourceNote` draws the reveal, and `level="unverified"` is the claim: this is what the game's
 * table says, not what the game was seen to do. That standing is shared with every other shaky
 * figure in the app rather than described again here — `components/ui/confidence.tsx` owns the
 * vocabulary and the chrome, so a reader who has met the tag elsewhere already knows what it means.
 * Drop the level to nothing once the values have actually been tested in game.
 *
 * It is a popover rather than a `Tooltip` because a tooltip opens on hover only, and this route is
 * read on a phone and inside a headset. See `components/ui/AGENTS.md`.
 *
 * The 16 levels that grant access rather than a stat carry no perks and render nothing.
 */
function Perks({ perks }: { perks: ReturnType<typeof perkRowsOf> }) {
    if (perks.length === 0) return null;

    return (
        <div className="-mt-1 flex items-start gap-2.5">
            <span className="micro-label flex-none pt-[3px] text-ink-700">Grants</span>
            <ul className="flex min-w-0 flex-1 flex-col gap-1">
                {perks.map((perk) => (
                    <li key={perk.key} className="text-[12px] leading-snug text-ink-600 text-pretty">
                        {perk.label}
                        {/* A curated label names the stat but carries no figure, so it takes one. */}
                        {!perk.described && perk.value !== null && (
                            <span className="tabular ml-1.5 font-mono text-ink-500">{perk.value}</span>
                        )}
                    </li>
                ))}
            </ul>
            <SourceNote
                level="unverified"
                heading="Applied values"
                rows={perks.map((perk) => ({
                    label: perk.key,
                    value: perk.value ?? 'None',
                    dim: perk.value === null,
                }))}
                className="mt-px flex-none"
            >
                Read straight from the game files, never checked in a raid. The menu text and the
                number often disagree, and some levels set no number at all.
            </SourceNote>
        </div>
    );
}

/**
 * A step to an adjacent level. `upgradeId` answering null is what disables it — the one place the
 * pane depends on that function staying total.
 */
function LevelStep({
    icon: Icon, label, to, areaId, onLevel,
}: {
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    to: number;
    areaId: string;
    onLevel: (level: number) => void;
}) {
    const exists = upgradeId(areaId, to) !== null;
    return (
        <button
            type="button"
            onClick={() => onLevel(to)}
            disabled={!exists}
            aria-label={label}
            title={label}
            className="flex h-12 w-12 items-center justify-center border border-line-500 text-ink-400
                       transition-colors hover:bg-steel-800 disabled:cursor-not-allowed disabled:opacity-30 shell:h-12 shell:w-10"
        >
            <Icon size={16} />
        </button>
    );
}

/**
 * The route's section rule: a dot, a label, a hairline, and a count on the right. `action` takes a
 * control that belongs to the section rather than to any one row in it.
 */
export function Rule({ label, note, dot = 'bg-ink-600', ink = 'text-ink-600', action }: {
    label: string; note?: string | false; dot?: string; ink?: string; action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-none items-center gap-2.5">
            <span className={cn('block h-2 w-2 flex-none', dot)} aria-hidden="true" />
            <span className={cn('micro-label', ink)}>{label}</span>
            <span className="block h-px flex-1 bg-line-900" aria-hidden="true" />
            {note && <span className="micro-label text-ink-700">{note}</span>}
            {action}
        </div>
    );
}
