import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getVendor } from '@/lib/vendors';
import type { Task } from '@/types/tasks';

/**
 * One task, named and linked — the counterpart to `ItemChip`, and the same grammar.
 *
 * The mark is the issuing corporation's, not a generic quest glyph, because which trader wants a
 * thing done is half of what a reader needs: it tells them whose loyalty the task builds and
 * roughly where in their own progress it sits. Same reasoning as `ItemChip` for the link — the
 * task page already exists and beats any summary a hover could hold.
 */

export interface TaskChipProps {
    /**
     * Three fields, not a whole `Task`: a chip has never read more, and asking for the full shape
     * meant a gate could not name its task without the task database in the client.
     */
    task: Pick<Task, 'id' | 'name' | 'corpId'>;
    size?: 'sm' | 'md';
    className?: string;
}

const MARK: Record<NonNullable<TaskChipProps['size']>, number> = { sm: 14, md: 18 };
const NAME: Record<NonNullable<TaskChipProps['size']>, string> = { sm: 'text-xs', md: 'text-sm' };

export default function TaskChip({ task, size = 'sm', className }: TaskChipProps) {
    // Tasks key their corporation by the same id the vendor record does, so the two agree by
    // construction rather than by a second table of icons.
    const corp = getVendor(task.corpId);
    const mark = MARK[size];

    return (
        <Link
            href={`/tasks/${task.id}`}
            className={cn('group/task inline-flex items-center gap-1.5 min-w-0 max-w-full', className)}
        >
            {corp?.icon && (
                <Image
                    src={corp.icon}
                    alt={corp.org}
                    title={corp.org}
                    width={mark}
                    height={mark}
                    unoptimized
                    className="shrink-0 opacity-80 group-hover/task:opacity-100 transition-opacity"
                />
            )}
            <span
                className={cn(
                    'truncate text-ink-300 group-hover/task:text-ink-hi transition-colors',
                    NAME[size],
                )}
            >
                {task.name}
            </span>
        </Link>
    );
}
