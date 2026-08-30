'use client';

/**
 * The build state machine.
 *
 * Everything it does is a call into `src/lib/gunsmith` — the hook owns *when* the build changes,
 * never *how* a gun is assembled. That split is what lets the weapon detail page render the same
 * build with no hook at all.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GunsmithPart, SavedBuild } from '@/types/gunsmith';
import type { Weapon } from '@/types/items';
import { getGunsmithData, type GunsmithData } from '@/services/GunsmithService';
import {
    findPart,
    parseUniversalSlotId,
    universalKindOf,
    UNIVERSAL_SLOT_LABELS,
    type UniversalSlotKind,
} from '@/lib/gunsmith/compatibility';
import {
    assembleBuild,
    clearSlot,
    fitPart,
    nextUniversalSlotId,
    presetToFitted,
    savedToFitted,
    type AssembledBuild,
    type FittedMap,
} from '@/lib/gunsmith/build';
import { weaponClassOf } from '@/lib/gunsmith/bands';
import type { PartPreview } from '@/components/gunsmith/PartPicker';
import { assembleGun } from '@/lib/gunsmith/assembly';

/** The slot a picker is open on: a real slot id, or `add/<kind>` for a new rail attachment. */
export type SelectedSlot = string | null;

export interface GunsmithBuildState {
    data: GunsmithData | null;
    loading: boolean;
    error: string | null;

    preset: Weapon | null;
    receiver: GunsmithPart | null;
    build: AssembledBuild | null;
    /** The preset the build started from, assembled — what the deltas are measured against. */
    baseline: AssembledBuild | null;
    weaponClass: string | null;
    name: string;
    dirty: boolean;

    selectedSlot: SelectedSlot;
    selectSlot: (slotId: SelectedSlot) => void;
    fit: (part: GunsmithPart) => void;
    clear: (slotId: string) => void;
    rename: (name: string) => void;
    loadPreset: (weapon: Weapon) => void;
    loadSaved: (saved: SavedBuild) => void;
    resetToPreset: () => void;
    fitted: FittedMap;
}

/** Opened on nothing in particular, the route starts here. */
const DEFAULT_PRESET_ID = 'weapon-ak74n-factory';

export function useGunsmithBuild(): GunsmithBuildState {
    const [data, setData] = useState<GunsmithData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [preset, setPreset] = useState<Weapon | null>(null);
    const [receiver, setReceiver] = useState<GunsmithPart | null>(null);
    const [fitted, setFitted] = useState<FittedMap>(new Map());
    const [selectedSlot, setSelectedSlot] = useState<SelectedSlot>(null);
    const [name, setName] = useState('New build');
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        let cancelled = false;
        getGunsmithData()
            .then((loaded) => {
                if (cancelled) return;
                setData(loaded);
                const first = loaded.presets.find((w) => w.id === DEFAULT_PRESET_ID) ?? loaded.presets[0];
                if (!first) return;
                const root = findPart(loaded.index, first.receiverId);
                if (!root) return;
                setPreset(first);
                setReceiver(root);
                setFitted(presetToFitted(first, loaded.index));
                setName(first.name);
            })
            .catch((cause: unknown) => {
                if (!cancelled) setError(cause instanceof Error ? cause.message : 'Could not load the gunsmith data.');
            });
        return () => { cancelled = true; };
    }, []);

    const build = useMemo(
        () => (data && receiver ? assembleBuild(receiver, fitted, data.index) : null),
        [data, receiver, fitted],
    );

    const baseline = useMemo(() => {
        if (!data || !preset) return null;
        const root = findPart(data.index, preset.receiverId);
        if (!root) return null;
        return assembleBuild(root, presetToFitted(preset, data.index), data.index);
    }, [data, preset]);

    const weaponClass = useMemo(() => weaponClassOf(receiver ?? undefined), [receiver]);

    const fit = useCallback((part: GunsmithPart) => {
        if (!data || !receiver || !selectedSlot) return;
        // `add/<kind>` is the row that creates a new rail attachment rather than filling a slot.
        const adding = /^add\/([a-z]+)$/.exec(selectedSlot);
        const slotId = adding
            ? nextUniversalSlotId(fitted, adding[1] as UniversalSlotKind)
            : selectedSlot;
        setFitted((current) => fitPart(receiver, current, slotId, part, data.index));
        if (adding) setSelectedSlot(slotId);
        setDirty(true);
    }, [data, receiver, selectedSlot, fitted]);

    const clear = useCallback((slotId: string) => {
        if (!data || !receiver) return;
        setFitted((current) => clearSlot(receiver, current, slotId, data.index));
        setSelectedSlot((current) => (current === slotId ? null : current));
        setDirty(true);
    }, [data, receiver]);

    const loadPreset = useCallback((weapon: Weapon) => {
        if (!data) return;
        const root = findPart(data.index, weapon.receiverId);
        if (!root) return;
        setPreset(weapon);
        setReceiver(root);
        setFitted(presetToFitted(weapon, data.index));
        setName(weapon.name);
        setSelectedSlot(null);
        setDirty(false);
    }, [data]);

    const loadSaved = useCallback((saved: SavedBuild) => {
        if (!data) return;
        const root = findPart(data.index, saved.receiverId);
        if (!root) return;
        setReceiver(root);
        setFitted(savedToFitted(saved, data.index));
        setName(saved.name);
        setPreset(data.presets.find((w) => w.id === saved.basePresetId) ?? null);
        setSelectedSlot(null);
        setDirty(false);
    }, [data]);

    const resetToPreset = useCallback(() => {
        if (!data || !preset) return;
        setFitted(presetToFitted(preset, data.index));
        setName(preset.name);
        setDirty(false);
    }, [data, preset]);

    const rename = useCallback((next: string) => {
        setName(next);
        setDirty(true);
    }, []);

    return {
        data,
        loading: !data && !error,
        error,
        preset,
        receiver,
        build,
        baseline,
        weaponClass,
        name,
        dirty,
        selectedSlot,
        selectSlot: setSelectedSlot,
        fit,
        clear,
        rename,
        loadPreset,
        loadSaved,
        resetToPreset,
        fitted,
    };
}

/**
 * What the candidate list for a slot is, and what each candidate would do to the build.
 *
 * The preview assembles the whole gun with the candidate swapped in rather than reading its
 * modifier block, because a part can change the build in ways its own numbers do not show — a
 * barrel replaces the receiver's MOA outright, and swapping a rail-integrated dust cover for a
 * plain one takes the optic on it off the gun.
 */
export interface SlotCandidates {
    title: string;
    subtitle?: string;
    candidates: GunsmithPart[];
    fittedGameId: string | null;
    preview: (part: GunsmithPart) => PartPreview;
}

const NO_CHANGE: PartPreview = {
    ergonomics: 0,
    verticalRecoil: 0,
    horizontalRecoil: 0,
    spreadMOA: 0,
    weight: 0,
};

export function useSlotCandidates(state: GunsmithBuildState): SlotCandidates {
    const { data, receiver, fitted, selectedSlot, build } = state;

    return useMemo<SlotCandidates>(() => {
        const empty: SlotCandidates = { title: '', candidates: [], fittedGameId: null, preview: () => NO_CHANGE };
        if (!data || !receiver || !selectedSlot || !build) return empty;

        const adding = /^add\/([a-z]+)$/.exec(selectedSlot);
        const universal = parseUniversalSlotId(selectedSlot);
        const kind = (adding?.[1] ?? universal?.kind) as UniversalSlotKind | undefined;

        const slot = build.slots.find((candidate) => candidate.id === selectedSlot);
        const candidates = slot
            ? slot.candidates
            : kind
                ? data.index.universal.filter((part) => universalKindOf(part) === kind)
                : [];

        const targetSlotId = adding ? nextUniversalSlotId(fitted, kind as UniversalSlotKind) : selectedSlot;

        const preview = (part: GunsmithPart): PartPreview => {
            const next = fitPart(receiver, fitted, targetSlotId, part, data.index);
            const entries = [{ part: receiver }, ...[...next.values()]
                .map((gameId) => findPart(data.index, gameId))
                .filter((found): found is GunsmithPart => Boolean(found))
                .map((found) => ({ part: found }))];
            const assembled = assembleGun(receiver.stats.gunData ?? null, entries);
            const before = build.display;
            const after = assembled.display;
            const delta = (a: number | null, b: number | null) =>
                typeof a === 'number' && typeof b === 'number' ? a - b : 0;
            return {
                ergonomics: delta(after.ergonomics, before.ergonomics),
                verticalRecoil: delta(after.verticalRecoil, before.verticalRecoil),
                horizontalRecoil: delta(after.horizontalRecoil, before.horizontalRecoil),
                spreadMOA: delta(after.spreadMOA, before.spreadMOA),
                weight: assembled.sim.weight - build.sim.weight,
            };
        };

        return {
            title: slot?.label ?? (kind ? UNIVERSAL_SLOT_LABELS[kind] : 'Parts'),
            subtitle: slot?.required ? 'The gun does not work without this part.' : undefined,
            candidates,
            fittedGameId: fitted.get(selectedSlot) ?? null,
            preview,
        };
    }, [data, receiver, fitted, selectedSlot, build]);
}
