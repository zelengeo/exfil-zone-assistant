'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SavedBuild } from '@/types/gunsmith';

interface SavedBuildsRailProps {
    builds: SavedBuild[];
    ready: boolean;
    activeId?: string | null;
    onOpen: (build: SavedBuild) => void;
    onDelete: (id: string) => void;
    onNew: () => void;
    className?: string;
}

/**
 * The player's builds.
 *
 * They live in this browser and nowhere else — there is no account behind them — so the rail says
 * so once rather than implying a sync that does not exist.
 */
export default function SavedBuildsRail({
    builds,
    ready,
    activeId,
    onOpen,
    onDelete,
    onNew,
    className,
}: SavedBuildsRailProps) {
    return (
        <aside className={cn('bg-steel-900 border border-line-900 flex flex-col', className)}>
            <div className="px-3 py-2.5 border-b border-line-900 flex items-center justify-between gap-2">
                <h2 className="eyebrow">My builds</h2>
                <button
                    type="button"
                    onClick={onNew}
                    className="micro-label text-ink-500 hover:text-ember transition-colors inline-flex items-center gap-1"
                >
                    <Plus size={11} />
                    New
                </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-line-900">
                {ready && builds.length === 0 && (
                    <p className="px-3 py-4 text-[11px] text-ink-700 leading-snug">
                        Nothing saved yet. Build a gun and press Save — it stays in this browser.
                    </p>
                )}

                {builds.map((build) => (
                    <div
                        key={build.id}
                        className={cn(
                            'flex items-center group',
                            build.id === activeId && 'bg-steel-700',
                        )}
                    >
                        {/* globals.css centres every button's children; a two-line row says otherwise. */}
                        <button
                            type="button"
                            onClick={() => onOpen(build)}
                            className="flex-1 min-w-0 flex flex-col items-start text-left px-3 py-2 hover:bg-steel-800 transition-colors"
                        >
                            <span className="block text-sm text-ink-200 truncate">{build.name}</span>
                            <span className="block font-mono text-[10px] text-ink-700 mt-0.5">
                                {`${build.parts.length} part${build.parts.length === 1 ? '' : 's'}`}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(build.id)}
                            aria-label={`Delete ${build.name}`}
                            className="px-2 py-2 text-ink-800 hover:text-ember transition-colors"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                ))}
            </div>
        </aside>
    );
}
