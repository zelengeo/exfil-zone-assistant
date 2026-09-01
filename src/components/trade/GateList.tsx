import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import TaskChip from '@/components/tasks/TaskChip';
import type { Gate } from '@/lib/gates';

/**
 * What an offer is waiting on — the tasks, and the DLC.
 *
 * A DLC row is tagged, because the two gates are not the same wall: a task costs playtime and a
 * player can see a route to it, while a DLC costs money and no amount of playing gets there. The
 * tag is the cheapest way to say which one a reader is looking at.
 *
 * A task renders as a `TaskChip` — its corporation's mark and its name, linked to the task page.
 * Anything that does not resolve prints its raw id in mono, which reads as an id rather than a
 * name; see `lib/gates.ts` for when that happens.
 *
 * Nothing is ever disabled: the wiki tracks neither a player's progress nor their purchases, so a
 * gate is information.
 */

export interface GateListProps {
    gates: Gate[];
    className?: string;
}

function RawId({ id }: { id: string }) {
    return <span className="font-mono text-[11px] text-ink-600 break-all min-w-0">{id}</span>;
}

export default function GateList({ gates, className }: GateListProps) {
    if (!gates.length) return null;

    return (
        <div className={cn('space-y-1.5', className)}>
            <span className="eyebrow inline-flex items-center gap-1.5 text-warn">
                <Lock size={10} aria-hidden="true" className="shrink-0" />
                Locked by
            </span>
            <ul className="space-y-1">
                {gates.map((gate) => (
                    <li key={gate.id} className="flex items-center gap-1.5 min-w-0">
                        {gate.kind === 'task' ? (
                            gate.task ? (
                                <TaskChip task={gate.task} />
                            ) : (
                                <RawId id={gate.id} />
                            )
                        ) : (
                            <>
                                <span className="micro-label border border-line-600 text-ink-600 px-1 py-0.5 shrink-0">
                                    DLC
                                </span>
                                {gate.label ? (
                                    <span className="text-xs text-ink-300 min-w-0 truncate">
                                        {gate.label}
                                    </span>
                                ) : (
                                    <RawId id={gate.id} />
                                )}
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
