'use client';

import { useSyncExternalStore } from 'react';
import { ROW_H, ROW_H_COMPACT } from '../utils/chain';

/**
 * How tall a chain row is: taller on a phone, where a row is a thumb target rather than a line.
 *
 * This is the one part of the phone layout that a breakpoint cannot deliver on its own. The spine is
 * an SVG whose path data is arithmetic on the row height, so the number has to reach JavaScript —
 * everything else about the narrow layout is a `shell:` class and stays in CSS.
 *
 * Read through `useSyncExternalStore` against the underside of the `shell` breakpoint, with the
 * desktop height as the server snapshot so the server's markup and the first client render agree.
 * The phone's own value arrives on the pass immediately after hydration.
 */

const PHONE = '(max-width: 899.98px)';

let query: MediaQueryList | null = null;

function media(): MediaQueryList {
    query ??= window.matchMedia(PHONE);
    return query;
}

function subscribe(onChange: () => void): () => void {
    const list = media();
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
}

const getSnapshot = (): number => (media().matches ? ROW_H_COMPACT : ROW_H);
const getServerSnapshot = (): number => ROW_H;

export function useRowHeight(): number {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
