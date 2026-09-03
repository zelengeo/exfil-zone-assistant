'use client';

import React, { Suspense, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    ArrowRight, Award, Check, CheckCircle2, DollarSign, ExternalLink, Lock, MapPin, Play, Share2, TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { tasksData, getTasksRequiring } from '@/data/tasks';
import { communityCreatorMap } from '@/data/community';
import { useFetchItems } from '@/hooks/useFetchItems';
import type { Item } from '@/types/items';
import type { Task, TaskProgress, TaskReward } from '@/types/tasks';
import { locate } from '../utils/chain';
import { canComplete, gatesFor, isDone, nextUpIn, objectiveTicks, stateOf } from '../utils/progress';
import { type ChainOwner, ownerFace, ownerOf } from '../utils/vendors';
import { getTaskTypeIcon, getYouTubeUrl, quickHighlight, RenderTipsContent } from '../utils/taskText';

/**
 * Everything one task asks of you, and everything it pays.
 *
 * Two columns, split by who the information is for: what you have to do on the left — objectives,
 * what unlocked this, tips — and what you get on the right. The two blocks the artboards have no
 * slot for live here too: the kit handed over before the job ("provided upfront", 34 tasks carry
 * it) and the level and loyalty gates, which no screen in the app has ever shown.
 *
 * Objective ticks are real controls, not indicators. The rule that a locked task cannot be recorded
 * lives in `progress.ts`, so this component only has to disable the affordance, not enforce it.
 */

export interface TaskDetailPaneProps {
    task: Task;
    progress: TaskProgress;
    /** False until storage has been read; controls are inert rather than wrong until it is. */
    hydrated: boolean;
    onToggleObjective: (task: Task, index: number) => void;
    onSetDone: (task: Task, done: boolean) => void;
    /**
     * Move the selection within the chain column. Absent on the standalone task page, where the
     * same rows are links to another route instead.
     */
    onSelectTask?: (taskId: string) => void;
    variant?: 'pane' | 'page';
}

type ChipTone = 'ember' | 'good' | 'neutral' | 'info' | 'warn' | 'muted';

const CHIP_TONES: Record<ChipTone, string> = {
    ember: 'text-ember-soft border-ember-edge bg-steel-750',
    good: 'text-good border-good/40 bg-steel-750',
    neutral: 'text-ink-400 border-line-600',
    info: 'text-info border-line-700',
    warn: 'text-warn border-line-600',
    muted: 'text-ink-700 border-line-800',
};

function Chip({ tone, children }: { tone: ChipTone; children: React.ReactNode }) {
    return (
        <span className={cn(
            'inline-flex items-center gap-1 border px-1.5 py-1 font-mono text-[9px] tracking-micro uppercase leading-none',
            CHIP_TONES[tone],
        )}>
            {children}
        </span>
    );
}

function Section({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={className}>
            <span className="eyebrow">{label}</span>
            <div className="mt-2.5">{children}</div>
        </div>
    );
}

/* --------------------------------------------------------------------------
 * Rewards
 * ----------------------------------------------------------------------- */

interface RewardView {
    icon: React.ReactNode;
    value: string;
    valueClass: string;
    label: string;
    href?: string;
}

function monogram(text: string) {
    return <span className="font-mono text-[9px] font-bold tracking-wider text-ink-600">{text}</span>;
}

function rewardView(reward: TaskReward, getItemById?: (id: string) => Item | undefined): RewardView {
    switch (reward.type) {
        case 'money':
            return {
                icon: <DollarSign size={14} className="text-warn" />,
                value: `$${reward.quantity.toLocaleString()}`,
                valueClass: 'text-warn',
                label: 'Cash',
            };
        case 'experience':
            return {
                icon: monogram('XP'),
                value: reward.quantity.toLocaleString(),
                valueClass: 'text-ink-200',
                label: 'Experience',
            };
        case 'reputation': {
            const face = ownerFace((reward.corpId ?? '') as ChainOwner);
            return {
                icon: face.icon
                    ? <Image src={face.icon} alt="" width={20} height={20} unoptimized className="w-5 h-5 object-contain" />
                    : monogram(face.short.slice(0, 3)),
                value: `+${reward.quantity}`,
                valueClass: 'text-info-pale',
                label: `${face.org} reputation`,
            };
        }
        default: {
            const item = reward.item_id && getItemById ? getItemById(reward.item_id) : undefined;
            const icon = item?.images?.icon;
            return {
                icon: icon
                    ? <Image src={icon} alt="" width={26} height={26} unoptimized className="w-[26px] h-[26px] object-contain" />
                    : monogram((reward.item_name ?? '?').slice(0, 2).toUpperCase()),
                value: `×${reward.quantity}`,
                valueClass: 'text-ink-200',
                label: item?.name ?? reward.item_name ?? 'Unknown item',
                href: reward.item_id ? `/items/${reward.item_id}` : undefined,
            };
        }
    }
}

function RewardTile({ reward, getItemById }: { reward: TaskReward; getItemById?: (id: string) => Item | undefined }) {
    const view = rewardView(reward, getItemById);

    const body = (
        <>
            <span className="w-[30px] h-[30px] flex-none bg-steel-600 border border-line-600 flex items-center justify-center">
                {view.icon}
            </span>
            <span className="min-w-0 flex-1">
                <span className={cn('block font-mono text-[11px] font-semibold tabular leading-none', view.valueClass)}>
                    {view.value}
                </span>
                <span className="block text-[10px] text-ink-700 mt-1 truncate">{view.label}</span>
            </span>
        </>
    );

    const shell = 'flex items-center gap-2 bg-steel-850 border border-line-900 px-2 py-1.5';

    return view.href
        ? <Link href={view.href} className={cn(shell, 'hover:border-line-600 transition-colors')}>{body}</Link>
        : <div className={shell}>{body}</div>;
}

function RewardGrid({ rewards, getItemById }: { rewards: TaskReward[]; getItemById?: (id: string) => Item | undefined }) {
    return (
        <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-1.5">
            {rewards.map((reward, index) => (
                <RewardTile key={`${reward.type}-${reward.item_id ?? reward.corpId ?? index}`} reward={reward} getItemById={getItemById} />
            ))}
        </div>
    );
}

/** `useFetchItems` throws a promise until the catalogue lands, so this only renders under Suspense. */
function ResolvedRewards({ rewards }: { rewards: TaskReward[] }) {
    const { getItemById } = useFetchItems();
    return <RewardGrid rewards={rewards} getItemById={getItemById} />;
}

/**
 * Only item rewards need the catalogue — cash, XP and reputation are in the task record. The
 * fallback is the same grid with the names the task itself carries, so waiting for the fetch shifts
 * nothing on the page; the icons and the canonical names fill in behind it.
 */
function Rewards({ rewards }: { rewards: TaskReward[] }) {
    return (
        <Suspense fallback={<RewardGrid rewards={rewards} />}>
            <ResolvedRewards rewards={rewards} />
        </Suspense>
    );
}

/* --------------------------------------------------------------------------
 * Related tasks
 * ----------------------------------------------------------------------- */

function RelatedTask({
    taskId, progress, onSelectTask, trailing,
}: {
    taskId: string;
    progress: TaskProgress;
    onSelectTask?: (taskId: string) => void;
    trailing?: React.ReactNode;
}) {
    const task = tasksData[taskId];
    if (!task) return null;

    const done = isDone(progress, taskId);
    const found = locate(taskId);
    const owner = ownerOf(task);

    const body = (
        <>
            {done
                ? <CheckCircle2 size={13} className="text-good flex-none" />
                : <Lock size={13} className="text-ink-700 flex-none" />}
            {found && <span className="font-mono text-[10px] tabular text-ink-700 flex-none">{String(found.node.index + 1).padStart(2, '0')}</span>}
            <span className="flex-1 min-w-0 truncate text-[12px] text-ink-400">{task.name}</span>
            {trailing ?? <span className="micro-label flex-none">{ownerFace(owner).short}</span>}
        </>
    );

    const shell = 'w-full flex items-center justify-start gap-2 bg-steel-850 border border-line-900 px-2.5 py-2 text-left hover:border-line-600 transition-colors';

    return onSelectTask
        ? <button type="button" onClick={() => onSelectTask(taskId)} className={shell}>{body}</button>
        : <Link href={`/tasks/${taskId}`} className={shell}>{body}</Link>;
}

/* --------------------------------------------------------------------------
 * The pane
 * ----------------------------------------------------------------------- */

export default function TaskDetailPane({
    task, progress, hydrated, onToggleObjective, onSetDone, onSelectTask, variant = 'pane',
}: TaskDetailPaneProps) {
    const owner = ownerOf(task);
    const face = ownerFace(owner);
    const state = stateOf(task, progress);
    const found = locate(task.id);
    const nextId = found ? nextUpIn(found.chain, progress) : null;
    const isNext = face.hasChain && nextId === task.id;
    const ticks = objectiveTicks(task, progress);
    const gates = gatesFor(task);
    const editable = hydrated && canComplete(task, progress);
    const unlocks = getTasksRequiring(task.id);

    const share = useCallback(() => {
        const url = window.location.href;
        if (!navigator.clipboard) {
            toast.error('Copying is not available in this browser');
            return;
        }
        navigator.clipboard.writeText(url).then(
            () => toast.success('Link copied'),
            () => toast.error('Could not copy the link'),
        );
    }, []);

    const position = face.hasChain && found
        ? `task ${found.node.index + 1} of ${found.chain.nodes.length}`
        : 'daily contract';

    return (
        // The page variant is the same panel; it just does not scroll inside a fixed-height column.
        <article className="bg-steel-800 border border-line-800 flex flex-col min-h-0">
            <div className="flex-none flex items-center justify-between gap-3 bg-steel-900 border-b border-line-900 px-4 py-2.5">
                <span className="micro-label truncate">
                    {face.org}{face.merchant && ` / ${face.merchant}`} — {position}
                </span>
                <Button variant="quiet" size="micro" onClick={share} className="flex-none">
                    <Share2 />
                    Share
                </Button>
            </div>

            <div className={cn('px-4 pt-4 shell:px-5 shell:pt-5', variant === 'pane' && 'flex-1 min-h-0 overflow-y-auto')}>
                <div className="flex flex-wrap items-center gap-1.5">
                    {state === 'completed' && <Chip tone="good"><Check size={10} />Done</Chip>}
                    {state === 'locked' && <Chip tone="muted"><Lock size={10} />Locked</Chip>}
                    {state === 'open' && <Chip tone={isNext ? 'ember' : 'neutral'}>{isNext ? 'Next up' : 'Open'}</Chip>}

                    {task.map.map((map) => (
                        <Chip key={map} tone="neutral"><MapPin size={10} />{map}</Chip>
                    ))}
                    {task.type.map((type) => (
                        <Chip key={type} tone="info">{getTaskTypeIcon(type, 10)}{type}</Chip>
                    ))}

                    {/* Shown, never enforced: the app cannot see a player's level or loyalty. */}
                    {gates.playerLevel !== null && (
                        <Chip tone="warn"><TrendingUp size={10} />Level {gates.playerLevel}</Chip>
                    )}
                    {gates.trust !== null && (
                        <Chip tone="warn"><Award size={10} />{ownerFace(gates.trust.owner).short} loyalty {gates.trust.level}</Chip>
                    )}
                </div>

                <h2 className="mt-3.5 font-display text-2xl shell:text-3xl font-extrabold uppercase tracking-tight text-ink-hi leading-none">
                    {task.name}
                </h2>

                {task.description && (
                    <p className="mt-3 text-[12.5px] leading-relaxed text-ink-400 max-w-[70ch]">
                        {quickHighlight(task.description)}
                    </p>
                )}

                <div className="grid grid-cols-1 min-[900px]:grid-cols-2 gap-5 min-[900px]:gap-6 mt-5">
                    <div className="min-w-0 flex flex-col gap-5">
                        {task.objectives.length > 0 && (
                            <Section label={`Objectives · ${ticks.filter(Boolean).length}/${task.objectives.length}`}>
                                <ul className="flex flex-col gap-2">
                                    {task.objectives.map((objective, index) => (
                                        <li key={index}>
                                            <button
                                                type="button"
                                                disabled={!editable}
                                                onClick={() => onToggleObjective(task, index)}
                                                aria-pressed={ticks[index]}
                                                className="w-full flex items-center justify-start gap-2.5 text-left group disabled:cursor-default"
                                            >
                                                <span className={cn(
                                                    'w-[17px] h-[17px] flex-none border flex items-center justify-center transition-colors',
                                                    ticks[index] ? 'bg-good border-good' : 'border-ink-800',
                                                    editable && !ticks[index] && 'group-hover:border-ink-500',
                                                )}>
                                                    {ticks[index] && <Check size={12} className="text-steel-950" />}
                                                </span>
                                                <span className={cn(
                                                    'text-[12.5px] leading-snug',
                                                    ticks[index] ? 'text-ink-600 line-through decoration-line-500' : 'text-ink-300',
                                                )}>
                                                    {objective}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </Section>
                        )}

                        {task.requiredTasks.length > 0 && (
                            <Section label="Unlocked by">
                                <div className="flex flex-col gap-1.5">
                                    {task.requiredTasks.map((id) => (
                                        <RelatedTask key={id} taskId={id} progress={progress} onSelectTask={onSelectTask} />
                                    ))}
                                </div>
                            </Section>
                        )}

                        {task.tips && (
                            <Section label="Tips">
                                <div className="border-l-2 border-info bg-steel-850 px-3 py-2.5 text-[12px] leading-relaxed text-ink-400">
                                    <RenderTipsContent content={task.tips} />
                                </div>
                            </Section>
                        )}
                    </div>

                    <div className="min-w-0 flex flex-col gap-5">
                        {task.preReward.length > 0 && (
                            <Section label="Provided upfront">
                                <Rewards rewards={task.preReward} />
                            </Section>
                        )}

                        {task.reward.length > 0 && (
                            <Section label="Rewards">
                                <Rewards rewards={task.reward} />
                            </Section>
                        )}

                        {task.videoGuides.length > 0 && (
                            <Section label="Video guides">
                                <div className="flex flex-col gap-1.5">
                                    {task.videoGuides.map(({ author, ytId, startTs }, index) => {
                                        const creator = author in communityCreatorMap
                                            ? communityCreatorMap[author as keyof typeof communityCreatorMap]
                                            : null;
                                        return (
                                            <Link
                                                key={`${author}-${ytId}-${index}`}
                                                href={getYouTubeUrl(ytId, startTs)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2.5 bg-steel-850 border border-line-900 px-2.5 py-2 hover:border-line-600 transition-colors"
                                            >
                                                <span className="w-5 h-5 flex-none bg-steel-600 border border-line-600 flex items-center justify-center overflow-hidden">
                                                    {creator
                                                        ? <Image src={creator.logo} alt="" width={20} height={20} unoptimized className="w-full h-full object-cover" />
                                                        : <Play size={10} className="text-ink-600" />}
                                                </span>
                                                <span className="flex-1 min-w-0 truncate text-[12px] text-ink-300">
                                                    <span className="font-semibold">{creator?.name ?? author}</span>
                                                    <span className="text-ink-700"> — walkthrough</span>
                                                </span>
                                                <ExternalLink size={12} className="text-ink-700 flex-none" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </Section>
                        )}
                    </div>
                </div>
            </div>

            {/*
              * On a phone the panel is as tall as its content and the page scrolls, so the action
              * is pinned to the foot of the screen rather than to the end of the briefing — clearing
              * the bottom bar, which is fixed over it. On the desktop the column already ends here.
              */}
            <div className="sticky bottom-bottomnav z-10 shell:static flex-none flex flex-wrap items-center gap-3 bg-steel-800 border-t border-line-900 mt-4 px-4 py-3 shell:px-5">
                {/* What this leads to is worth a line on a desktop and a wrapped third row on a
                    phone, where the chain underneath already says it. */}
                {unlocks.length > 0 && (
                    <span className="hidden shell:flex items-center gap-2 min-w-0">
                        <span className="micro-label flex-none">Unlocks</span>
                        <ArrowRight size={11} className="text-ink-700 flex-none" />
                        <span className="text-[12px] text-ink-500 truncate">
                            {unlocks[0].name}
                            {unlocks.length > 1 && <span className="text-ink-700"> +{unlocks.length - 1} more</span>}
                        </span>
                    </span>
                )}

                <div className="flex-1" />

                <span className="micro-label">
                    {state === 'locked' ? 'Finish its prerequisites first' : `${ticks.filter(Boolean).length}/${task.objectives.length} objectives`}
                </span>
                <Button
                    variant="ember"
                    size="micro"
                    className="h-11 px-5 text-[10px] font-semibold"
                    disabled={!hydrated || (state !== 'completed' && !editable)}
                    onClick={() => onSetDone(task, state !== 'completed')}
                >
                    <Check />
                    {state === 'completed' ? 'Mark incomplete' : 'Mark complete'}
                </Button>
            </div>
        </article>
    );
}
