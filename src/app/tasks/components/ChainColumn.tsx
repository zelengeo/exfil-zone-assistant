'use client';

import React, { useCallback, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { loadedTasks } from '@/services/TaskService';
import type { TaskProgress } from '@/types/tasks';
import { type Chain, buildChains, rowTextX, visibleRows } from '../utils/chain';
import { countsFor, isDone, nextUpIn, stateOf } from '../utils/progress';
import { type ChainOwner, ownerFace, tasksForOwner } from '../utils/vendors';
import { useRowHeight } from '../hooks/useRowHeight';
import ChainRow from './ChainRow';
import ChainSpine, { type SpineEdge } from './ChainSpine';

/**
 * One vendor's work, drawn as the sequence it actually is.
 *
 * The old route sorted by `order` and split the tasks across three tabs — available, locked,
 * completed — which threw away the only thing a chain has to say: what follows what. Here position
 * is the information and status is how a row is painted.
 *
 * A vendor can run more than one chain (four of them do), so this renders a group per chain rather
 * than one flat list.
 */

export interface ChainColumnProps {
    owner: ChainOwner;
    progress: TaskProgress;
    /** Task ids surviving the filter bar, or null when nothing is narrowing the view. */
    visible: Set<string> | null;
    selectedTaskId?: string;
    onSelect: (taskId: string) => void;
}

function ChainGroup({
    chain, label, progress, visible, selectedTaskId, onSelect, numbered, rowH,
}: {
    chain: Chain;
    label: string | null;
    progress: TaskProgress;
    visible: Set<string> | null;
    selectedTaskId?: string;
    onSelect: (taskId: string) => void;
    numbered: boolean;
    rowH: number;
}) {
    const [open, setOpen] = useState(false);

    const nodes = visible ? chain.nodes.filter((node) => visible.has(node.taskId)) : chain.nodes;
    if (nodes.length === 0) return null;

    // Only a sequence has a next task. The dailies are all available at once, and singling one out
    // would invent an order the game does not have.
    const nextId = numbered ? nextUpIn(chain, progress) : null;

    // Collapsing only makes sense on a whole chain. Under a filter the rows are already a subset,
    // and hiding part of that subset would give two different answers to "what matched".
    const collapsible = !visible && !open;
    const { shown, hidden } = collapsible
        ? visibleRows(nodes, (taskId) => stateOf(loadedTasks()[taskId], progress) === 'locked', selectedTaskId)
        : { shown: nodes, hidden: 0 };

    const rowOf = new Map(shown.map((node, row) => [node.taskId, row]));
    const edges: SpineEdge[] = [];
    for (const edge of chain.edges) {
        const fromRow = rowOf.get(edge.from);
        const toRow = rowOf.get(edge.to);
        if (fromRow === undefined || toRow === undefined) continue;
        edges.push({
            fromRow,
            toRow,
            fromLane: edge.fromLane,
            toLane: edge.toLane,
            travelled: isDone(progress, edge.from),
        });
    }

    return (
        <div>
            {label && (
                <div className="px-3 py-2 bg-steel-850 border-b border-line-900">
                    <span className="eyebrow">{label}</span>
                </div>
            )}

            <div className="relative" style={{ height: shown.length * rowH }}>
                <ul>
                    {shown.map((node) => {
                        const task = loadedTasks()[node.taskId];
                        if (!task) return null;
                        return (
                            <li key={node.taskId}>
                                <ChainRow
                                    task={task}
                                    state={stateOf(task, progress)}
                                    lane={node.lane}
                                    position={numbered ? node.index + 1 : null}
                                    isNext={node.taskId === nextId}
                                    isSelected={node.taskId === selectedTaskId}
                                    rowH={rowH}
                                    onSelect={onSelect}
                                />
                            </li>
                        );
                    })}
                </ul>
                <ChainSpine edges={edges} rowCount={shown.length} rowH={rowH} />
            </div>

            {(hidden > 0 || open) && !visible && (
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    style={{ paddingLeft: rowTextX(0) }}
                    // `justify-start` is not redundant: the base stylesheet centres every button.
                    className="w-full h-[26px] flex items-center justify-start gap-2 pr-3 border-t border-line-900 text-left hover:bg-steel-800 transition-colors"
                >
                    <span className="micro-label">
                        {open ? 'Collapse the locked tail' : `+${hidden} more locked`}
                    </span>
                    {open
                        ? <ChevronUp size={11} className="text-ink-800" />
                        : <ChevronDown size={11} className="text-ink-800" />}
                </button>
            )}
        </div>
    );
}

export default function ChainColumn({
    owner, progress, visible, selectedTaskId, onSelect,
}: ChainColumnProps) {
    const face = ownerFace(owner);
    const { chains } = buildChains(owner);
    const counts = countsFor(tasksForOwner(owner), progress);
    const rowH = useRowHeight();

    const label = useCallback(
        (chain: Chain, index: number): string | null => {
            if (!face.hasChain) return 'Standalone contracts · no prerequisites';
            if (chains.length === 1) return null;
            // Named by the task it opens on: "chain 2" alone says nothing about which one it is.
            return `Chain ${index + 1} · ${loadedTasks()[chain.rootTaskId]?.name ?? chain.rootTaskId}`;
        },
        [chains.length, face.hasChain],
    );

    return (
        <section className="border-b border-line-900 last:border-b-0">
            <div className="sticky top-0 z-20 px-3 py-2.5 bg-steel-900 border-b border-line-900">
                <div className="font-display text-[15px] font-bold uppercase tracking-wide text-ink-100 leading-none">
                    {face.org}
                    {face.merchant && <span className="text-ink-700 font-medium"> / {face.merchant}</span>}
                </div>
                <div className="micro-label mt-1.5">
                    {counts.completed} done · {counts.open} open · {counts.locked} locked
                </div>
            </div>

            {chains.map((chain, index) => (
                <ChainGroup
                    key={chain.key}
                    chain={chain}
                    label={label(chain, index)}
                    progress={progress}
                    visible={visible}
                    selectedTaskId={selectedTaskId}
                    onSelect={onSelect}
                    numbered={face.hasChain}
                    rowH={rowH}
                />
            ))}
        </section>
    );
}
