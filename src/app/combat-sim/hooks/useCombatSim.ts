'use client';

/**
 * The whole simulator's state: what is being fired, what is being shot at, and from how far.
 *
 * Replaces `useCombatSimulation`, which debounced its own arithmetic by 100 ms and then wrote the
 * result into state. The engine is pure and synchronous, so it belongs in a `useMemo` — a state
 * write was a second render for a number that was already known during the first.
 *
 * Three asynchronous things have to arrive before anything can be drawn: the item catalogue (via
 * `useFetchItems`, which suspends), the shipped body model, and the gunsmith part index. The
 * catalogue suspends the tree; the other two are reported through `ready`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Ammunition, BodyArmor, FaceShield, Helmet, Item, Weapon } from '@/types/items';
import { getGunsmithData, type GunsmithData } from '@/services/GunsmithService';
import { useBodyModel } from '@/hooks/useBodyModel';
import { useFetchItems } from '@/hooks/useFetchItems';
import {
    DEFAULT_PRESET_ID,
    MAX_LOADOUTS,
    encodeLoadout,
    loadoutFromEncoded,
    loadoutFromPreset,
    type Loadout,
} from '../utils/loadout';
import { buildTargetModel, EMPTY_DEFENDER, FACINGS, type Defender, type Facing, type TargetModel } from '../utils/target-model';
import { runScenarios, type LoadoutOutcome } from '../utils/scenario';
import { isAmmunition, isBodyArmor, isFaceShield, isHelmet } from '../utils/types';
import { RANGE_VALUES } from '../utils/types';

export type SimView = 'read' | 'compare' | 'numbers';

const VIEWS: SimView[] = ['read', 'compare', 'numbers'];
const isView = (value: string | null): value is SimView =>
    value !== null && (VIEWS as string[]).includes(value);

export interface CombatSimState {
    /** Both async loads have landed and a target can be drawn. */
    ready: boolean;
    error: string | null;

    view: SimView;
    setView: (view: SimView) => void;

    loadouts: Loadout[];
    selectedId: string;
    selectLoadout: (id: string) => void;
    setLoadout: (id: string, loadout: Loadout | null) => void;
    addLoadout: () => void;

    defender: Defender;
    setDefender: (patch: Partial<Defender>) => void;

    /** Where the shot comes from. Front and rear agree — the wedge test is two-sided. */
    facing: Facing;
    setFacing: (facing: Facing) => void;

    range: number;
    setRange: (range: number) => void;

    /** The zone whose readout is open. Null shows the verdict's own recommendation instead. */
    selectedZoneId: string | null;
    selectZone: (zoneId: string | null) => void;

    target: TargetModel | null;
    outcomes: LoadoutOutcome[];
    selected: LoadoutOutcome | null;
    /** The same loadouts re-run at each preset range, for the Numbers view's second table. */
    byRange: { range: number; outcomes: LoadoutOutcome[] }[];

    /** Everything the pickers offer. */
    catalogue: {
        presets: Weapon[];
        ammo: Ammunition[];
        vests: BodyArmor[];
        helmets: Helmet[];
        shields: FaceShield[];
    };
    data: GunsmithData | null;

    shareLink: () => string;
}

/** The round a preset is offered with when a link does not name one: the first that fits. */
function defaultAmmo(caliber: string | null, ammo: Ammunition[]): Ammunition | null {
    if (!caliber) return null;
    return ammo.find((round) => round.stats.caliber === caliber) ?? null;
}

/**
 * The link, read back.
 *
 * The parameter names are the old ones on purpose. `a0w` was a weapon id and a preset *is* a
 * weapon, so every link the guides already carry resolves unchanged; `a0b` and `a0n` are the two
 * new ones, and they reuse the gunsmith's own build encoding rather than inventing a second.
 */
function seedFrom(
    params: URLSearchParams,
    data: GunsmithData,
    items: Item[],
    ammo: Ammunition[],
): { loadouts: Loadout[]; defender: Defender; range: number; facing: Facing; view: SimView } {
    const byId = new Map(items.map((item) => [item.id, item]));
    const ammoFor = (raw: string | null): Ammunition | null => {
        const item = raw ? byId.get(raw) : undefined;
        return item && isAmmunition(item) ? item : null;
    };

    const restored: Loadout[] = [];
    for (let slot = 0; slot < MAX_LOADOUTS; slot++) {
        const encoded = params.get(`a${slot}b`);
        const presetId = params.get(`a${slot}w`);
        const round = ammoFor(params.get(`a${slot}a`));
        const withRound = (loadout: Loadout): Loadout =>
            ({ ...loadout, ammo: round ?? defaultAmmo(loadout.build.sim.caliber, ammo) });

        const shared = encoded
            ? loadoutFromEncoded(String(slot), encoded, params.get(`a${slot}n`), data.index, round)
            : null;
        if (shared) {
            restored.push(withRound(shared));
            continue;
        }

        const preset = presetId ? data.presets.find((weapon) => weapon.id === presetId) : undefined;
        const fromPreset = preset ? loadoutFromPreset(String(slot), preset, data.index, round) : null;
        if (fromPreset) restored.push(withRound(fromPreset));
    }

    if (restored.length === 0) {
        const preset = data.presets.find((weapon) => weapon.id === DEFAULT_PRESET_ID) ?? data.presets[0];
        const loadout = preset ? loadoutFromPreset('0', preset, data.index, null) : null;
        if (loadout) restored.push({ ...loadout, ammo: defaultAmmo(loadout.build.sim.caliber, ammo) });
    }

    const vest = byId.get(params.get('da') ?? '');
    const helmet = byId.get(params.get('dh') ?? '');
    const shield = byId.get(params.get('df') ?? '');
    const percent = (raw: string | null, fallback: number): number => {
        const value = raw === null ? NaN : Number.parseInt(raw, 10);
        return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) / 100 : fallback;
    };

    const parsedRange = Number.parseInt(params.get('r') ?? '', 10);
    const parsedFacing = params.get('f');
    const parsedView = params.get('v');

    return {
        // Slots are renumbered so the ids stay 0..n-1 whatever the link left out.
        loadouts: restored.map((loadout, index) => ({ ...loadout, id: String(index) })),
        defender: {
            vest: vest && isBodyArmor(vest) ? vest : null,
            vestCondition: percent(params.get('dad'), 1),
            helmet: helmet && isHelmet(helmet) ? helmet : null,
            helmetCondition: percent(params.get('dhd'), 1),
            // A shield only ever fills a helmet's holes; worn alone it protects nothing at all.
            faceShield: shield && isFaceShield(shield) && helmet && isHelmet(helmet) ? shield : null,
        },
        range: Number.isFinite(parsedRange) ? Math.min(600, Math.max(0, parsedRange)) : 0,
        facing: FACINGS.some((entry) => entry.id === parsedFacing) ? (parsedFacing as Facing) : 'front',
        view: isView(parsedView) ? parsedView : 'read',
    };
}

export function useCombatSim(): CombatSimState {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { items } = useFetchItems();
    const { model, error: modelError } = useBodyModel();

    const [data, setData] = useState<GunsmithData | null>(null);
    const [dataError, setDataError] = useState<string | null>(null);

    // Read once, at mount. After that the URL is written, never read back — otherwise every write
    // would re-seed the state it just came from.
    const [initialParams] = useState(() => new URLSearchParams(searchParams.toString()));

    const [loadouts, setLoadouts] = useState<Loadout[]>([]);
    const [selectedId, setSelectedId] = useState('0');
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [defender, setDefenderState] = useState<Defender>(EMPTY_DEFENDER);
    const [range, setRange] = useState(0);
    const [facing, setFacing] = useState<Facing>('front');
    const [view, setView] = useState<SimView>('read');

    const catalogue = useMemo(() => {
        const ammo = items.filter((item: Item): item is Ammunition => isAmmunition(item));
        return {
            presets: [] as Weapon[],
            ammo,
            vests: items.filter((item: Item): item is BodyArmor => isBodyArmor(item)),
            helmets: items.filter((item: Item): item is Helmet => isHelmet(item)),
            shields: items.filter((item: Item): item is FaceShield => isFaceShield(item)),
        };
    }, [items]);

    const presets = data?.presets ?? [];

    useEffect(() => {
        let cancelled = false;
        getGunsmithData()
            .then((loaded) => { if (!cancelled) setData(loaded); })
            .catch((cause: unknown) => {
                if (!cancelled) {
                    setDataError(cause instanceof Error ? cause.message : 'Could not load the gunsmith data.');
                }
            });
        return () => { cancelled = true; };
    }, []);

    /*
     * Seeding from the URL happens during render, not in an effect.
     *
     * The link is state this component *derives* rather than an external system it synchronises
     * with, so a setState in an effect would be a guaranteed second render — and React's own
     * guidance is to adjust state during render for exactly this case. The seed runs once, when
     * the part index lands.
     */
    const [seeded, setSeeded] = useState(false);
    if (!seeded && data) {
        const seed = seedFrom(initialParams, data, items, catalogue.ammo);
        setSeeded(true);
        setLoadouts(seed.loadouts);
        setSelectedId('0');
        setDefenderState(seed.defender);
        setRange(seed.range);
        setFacing(seed.facing);
        setView(seed.view);
    }

    /* --------------------------------------------------------------------- */

    const buildParams = useCallback((): URLSearchParams => {
        const params = new URLSearchParams();
        loadouts.forEach((loadout, index) => {
            if (loadout.source.kind === 'preset') {
                params.set(`a${index}w`, loadout.source.presetId);
            } else {
                params.set(`a${index}b`, encodeLoadout(loadout));
                params.set(`a${index}n`, loadout.name);
            }
            if (loadout.ammo) params.set(`a${index}a`, loadout.ammo.id);
        });
        if (defender.vest) {
            params.set('da', defender.vest.id);
            params.set('dad', String(Math.round(defender.vestCondition * 100)));
        }
        if (defender.helmet) {
            params.set('dh', defender.helmet.id);
            params.set('dhd', String(Math.round(defender.helmetCondition * 100)));
            if (defender.faceShield) params.set('df', defender.faceShield.id);
        }
        params.set('r', String(range));
        if (facing !== 'front') params.set('f', facing);
        if (view !== 'read') params.set('v', view);
        return params;
    }, [loadouts, defender, range, facing, view]);

    // Debounced, so dragging the range slider leaves one history entry rather than sixty.
    useEffect(() => {
        if (loadouts.length === 0) return;
        const timer = setTimeout(() => {
            router.replace(`${pathname}?${buildParams().toString()}`, { scroll: false });
        }, 400);
        return () => clearTimeout(timer);
    }, [buildParams, loadouts.length, pathname, router]);

    const target = useMemo(
        () => (model ? buildTargetModel(model, defender, facing) : null),
        [model, defender, facing],
    );

    const outcomes = useMemo(
        () => (target ? runScenarios(loadouts, target, range) : []),
        [loadouts, target, range],
    );

    const byRange = useMemo(
        () => (target
            ? RANGE_VALUES.map((value) => ({ range: value, outcomes: runScenarios(loadouts, target, value) }))
            : []),
        [loadouts, target],
    );

    const selected = outcomes.find((outcome) => outcome.loadoutId === selectedId) ?? outcomes[0] ?? null;

    const setLoadout = useCallback((id: string, loadout: Loadout | null) => {
        setLoadouts((current) => (loadout === null
            ? current.filter((entry) => entry.id !== id).map((entry, index) => ({ ...entry, id: String(index) }))
            : current.map((entry) => (entry.id === id ? { ...loadout, id } : entry))));
    }, []);

    const addLoadout = useCallback(() => {
        setLoadouts((current) => {
            if (current.length >= MAX_LOADOUTS || !data) return current;
            const preset = data.presets.find((weapon) => weapon.id === DEFAULT_PRESET_ID) ?? data.presets[0];
            const loadout = preset ? loadoutFromPreset(String(current.length), preset, data.index, null) : null;
            if (!loadout) return current;
            return [...current, { ...loadout, ammo: defaultAmmo(loadout.build.sim.caliber, catalogue.ammo) }];
        });
    }, [data, catalogue.ammo]);

    const setDefender = useCallback((patch: Partial<Defender>) => {
        setDefenderState((current) => {
            const next = { ...current, ...patch };
            // Dropping the helmet drops the shield with it — a shield worn alone protects nothing.
            if (!next.helmet) next.faceShield = null;
            return next;
        });
    }, []);

    const shareLink = useCallback(() => {
        const origin = typeof window === 'undefined' ? '' : window.location.origin;
        return `${origin}${pathname}?${buildParams().toString()}`;
    }, [buildParams, pathname]);

    return {
        ready: Boolean(model && data),
        error: modelError?.message ?? dataError,
        view,
        setView,
        loadouts,
        selectedId: selected?.loadoutId ?? selectedId,
        selectLoadout: setSelectedId,
        setLoadout,
        addLoadout,
        defender,
        setDefender,
        facing,
        setFacing,
        range,
        setRange,
        selectedZoneId,
        selectZone: setSelectedZoneId,
        target,
        outcomes,
        selected,
        byRange,
        catalogue: { ...catalogue, presets },
        data,
        shareLink,
    };
}
