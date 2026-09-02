'use client';

import { useEffect, useState } from 'react';
import { loadDataFile } from '@/services/dataFiles';
import type { BodyModel } from '@/lib/protection/bodyModel';

/**
 * The shipped body model: 69 bones and the 13 collision capsules bullets actually hit.
 *
 * About 15 KB, static, and identical for every viewer, so it is fetched once per session and held
 * at module scope rather than bundled — no page that never draws a body pays for it.
 *
 * Lives in `src/hooks` rather than under either route because the combat simulator needs the same
 * model as the items route.
 */

let cache: BodyModel | null = null;
let inFlight: Promise<BodyModel> | null = null;

export function getBodyModel(): Promise<BodyModel> {
    if (cache) return Promise.resolve(cache);
    if (!inFlight) {
        inFlight = loadDataFile<BodyModel>('body-model.json')
            .then((model) => {
                cache = model;
                inFlight = null;
                return model;
            })
            .catch((cause: unknown) => {
                inFlight = null;
                throw cause;
            });
    }
    return inFlight;
}

export interface BodyModelState {
    model: BodyModel | null;
    error: Error | null;
}

export function useBodyModel(): BodyModelState {
    const [state, setState] = useState<BodyModelState>(() => ({ model: cache, error: null }));

    useEffect(() => {
        if (cache) return;
        let cancelled = false;

        getBodyModel()
            .then((model) => {
                if (!cancelled) setState({ model, error: null });
            })
            .catch((cause: unknown) => {
                if (!cancelled) {
                    setState({
                        model: null,
                        error: cause instanceof Error ? cause : new Error('Could not load the body model.'),
                    });
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}
