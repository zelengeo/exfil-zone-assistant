import React from 'react';
import Link from 'next/link';
import {
    BookUp2, Camera, Crosshair, Flag, MapPin, Package, Plane, Search, Sparkle, Target, Wrench,
} from 'lucide-react';
import type { TaskType } from '@/types/tasks';

/**
 * Turning a task's fields into something readable.
 *
 * Split out of the components so the chain row, the detail pane and the standalone task page all
 * spell a task the same way. Moved here from `taskHelpers.tsx`, which stage 08 deletes; the colours
 * are the only thing that changed — olive was the holding skin.
 */

/**
 * The mark for a task type.
 *
 * `gunsmith` is the one the old helper missed — the 19 bench tasks fell through to the generic
 * target, which is exactly the group that most needed telling apart from the story chain.
 */
export function getTaskTypeIcon(type: TaskType, size = 12): React.ReactElement {
    switch (type) {
        case 'reach': return <MapPin size={size} />;
        case 'extract': return <Plane size={size} />;
        case 'retrieve': return <Search size={size} />;
        case 'eliminate': return <Crosshair size={size} />;
        case 'submit': return <BookUp2 size={size} />;
        case 'mark': return <Flag size={size} />;
        case 'place': return <Package size={size} />;
        case 'photo': return <Camera size={size} />;
        case 'signal': return <Sparkle size={size} />;
        case 'gunsmith': return <Wrench size={size} />;
        default: return <Target size={size} />;
    }
}

/**
 * Place names in a task description are written in square brackets by the extraction — "investigate
 * the [Whitesails hospital]". Lifting them out of the sentence is most of what makes a briefing
 * skimmable, so they are the one thing in the pane allowed a second colour.
 */
export function quickHighlight(text: string): React.ReactNode[] {
    return text.split(/(\[[^\]]+\])/).map((part, index) => (
        part.match(/^\[[^\]]+\]$/)
            ? <span key={index} className="text-info-pale font-semibold">{part.slice(1, -1)}</span>
            : <React.Fragment key={index}>{part}</React.Fragment>
    ));
}

export type TextPart = string | { type: 'link'; text: string; url: string };

/** Splits `[label](url)` out of a tip, leaving the surrounding prose as plain strings. */
export function parseMarkdownLinks(text: string): TextPart[] {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: TextPart[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
        parts.push({ type: 'link', text: match[1], url: match[2] });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
}

export function RenderTipsContent({ content }: { content: string }) {
    return (
        <>
            {parseMarkdownLinks(content).map((part, index) => (
                typeof part === 'string'
                    ? <React.Fragment key={index}>{part}</React.Fragment>
                    : (
                        <Link
                            key={index}
                            href={part.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-info-light hover:text-info-pale underline transition-colors"
                        >
                            {part.text}
                        </Link>
                    )
            ))}
        </>
    );
}

/* --------------------------------------------------------------------------
 * Video guides
 * ----------------------------------------------------------------------- */

const UTM_SOURCE = 'exfil-zone-assistant.app';
const UTM_MEDIUM = 'web';

/** A watch link, tagged so the creators can see where the traffic came from. */
export function getYouTubeUrl(videoId: string, startTime?: number): string {
    const params = new URLSearchParams({ v: videoId });
    if (startTime && startTime > 0) params.set('t', `${startTime}s`);
    params.set('utm_source', UTM_SOURCE);
    params.set('utm_campaign', 'task-click');
    params.set('utm_medium', UTM_MEDIUM);
    return `https://www.youtube.com/watch?${params.toString()}`;
}

/** The cookie-free embed host, so watching a walkthrough does not set a third-party cookie. */
export function getYouTubeEmbedUrl(videoId: string, startTime?: number): string {
    const url = `https://www.youtube-nocookie.com/embed/${videoId}`;
    return startTime && startTime > 0 ? `${url}?start=${startTime}` : url;
}
