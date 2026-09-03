'use client';

import React from 'react';
import { ArrowRight, Check, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Task, TaskProgress } from '@/types/tasks';
import { locate } from '../utils/chain';
import { canComplete, objectivesDone } from '../utils/progress';

/**
 * The one task the phone opens on.
 *
 * A narrow screen cannot hold the chain and the briefing at once, so the top of it answers the
 * question a player actually arrives with — what am I doing next — and the chain underneath is
 * there to argue with that answer. The two controls are the two things you do with it: record it,
 * or read it.
 *
 * Marking complete from here deliberately does not pin the selection the way the detail pane does.
 * The card follows the chain; watching it advance to the next contract is the confirmation.
 */

export interface NextUpCardProps {
    task: Task;
    progress: TaskProgress;
    /** False until storage has been read; the controls stay inert rather than lie. */
    hydrated: boolean;
    onOpen: (taskId: string) => void;
    onSetDone: (task: Task, done: boolean) => void;
}

/** What the task is, in one line: how much of it is left, what kind of work, whether help exists. */
function summarise(task: Task, progress: TaskProgress): string {
    const parts: string[] = [];

    if (task.objectives.length > 0) {
        const done = objectivesDone(task, progress);
        parts.push(done > 0
            ? `${done}/${task.objectives.length} objectives`
            : `${task.objectives.length} objective${task.objectives.length === 1 ? '' : 's'}`);
    }
    if (task.type.length > 0) parts.push(task.type.join(', '));
    if (task.videoGuides.length > 0) {
        parts.push(`${task.videoGuides.length} video guide${task.videoGuides.length === 1 ? '' : 's'}`);
    }

    return parts.join(' · ');
}

export default function NextUpCard({ task, progress, hydrated, onOpen, onSetDone }: NextUpCardProps) {
    const found = locate(task.id);
    const editable = hydrated && canComplete(task, progress);

    return (
        <article className="bg-steel-850 border border-line-800 border-l-2 border-l-ember px-3 py-3">
            <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center border border-ember-edge bg-steel-750 px-1.5 py-1 font-mono text-[9px] tracking-micro uppercase leading-none text-ember-soft">
                    Next up
                </span>
                <span className="inline-flex items-center gap-1 border border-line-700 px-1.5 py-1 font-mono text-[9px] tracking-micro uppercase leading-none text-ink-400">
                    <MapPin size={10} />
                    {task.map[0]}
                </span>

                <div className="flex-1" />

                {found && (
                    <span className="font-mono text-[10px] tabular text-ink-700">
                        {String(found.node.index + 1).padStart(2, '0')}/{found.chain.nodes.length}
                    </span>
                )}
            </div>

            <h2 className="mt-3 font-display text-[22px] font-extrabold uppercase tracking-tight text-ink-hi leading-none">
                {task.name}
            </h2>

            <p className="mt-2 text-[12px] text-ink-500">{summarise(task, progress)}</p>

            <div className="flex gap-2 mt-3.5">
                <Button
                    variant="ember"
                    size="micro"
                    className="flex-1 h-11 text-[10px] font-semibold"
                    disabled={!editable}
                    onClick={() => onSetDone(task, true)}
                >
                    <Check />
                    Mark complete
                </Button>
                <Button
                    variant="quiet"
                    size="micro"
                    className="h-11 px-4"
                    onClick={() => onOpen(task.id)}
                >
                    Open
                    <ArrowRight />
                </Button>
            </div>
        </article>
    );
}
