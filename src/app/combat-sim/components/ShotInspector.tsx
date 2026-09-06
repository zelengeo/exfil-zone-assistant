'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Slider from '@/components/ui/slider';
import ItemIcon from '@/components/items/ItemIcon';
import { useFetchItems } from '@/hooks/useFetchItems';
import { resolveBone } from '@/lib/protection/bodyModel';
import { armorClassLabel } from '@/lib/protection/armorClassScale';
import type { Ammunition, Armor, Item } from '@/types/items';
import { explainShot, type ShotExplanation } from '../utils/damage-calculations';
import { ammoProperties } from '../utils/props';
import { LABEL_OF_BONE } from '../utils/target-model';
import { isAmmunition, isArmor, RANGE_VALUES } from '../utils/types';
import { AmmoRow, ammoFigures } from './AmmoDisplay';
import ArmorPicker from './ArmorPicker';
import ClassLadder from './ClassLadder';
import PanelNote from './PanelNote';

/**
 * One shot, opened up: the guide's calculator.
 *
 * `ZoneReadout`'s ladder answers *what* a round did and refuses to answer *why* — its own comment
 * calls a three-line version of this chain "a simplification presented as a derivation". This is
 * where the chain is allowed its room. Every figure below comes from `explainShot`, which runs the
 * same private helpers `calculateShotDamage` does, so the page cannot drift from the model it is
 * describing: there is no second implementation here to go stale.
 *
 * **Both branches are always drawn.** The simulator has to commit to one and takes the likelier
 * half of the roll; a reader who came here asking where a number came from is owed the other half
 * too, because near a 50% chance they are far apart and "the game rolls" is the true answer.
 *
 * Three things the inspector does not model, stated rather than quietly skipped:
 *
 *  - **Coverage.** Whether a plate is between the muzzle and the bone is geometry — a vest's
 *    `ProtectionAngle` wedge, a helmet's cone regions — and it is the simulator's question, not
 *    this page's. Pick a piece here and it covers the hit; the arithmetic that follows is what
 *    happens once it does.
 *  - **`PenetrationUsed`.** Penetration already spent on a surface the bullet crossed first.
 *  - **The seed.** The roll travels with the shot so client and server agree, and cannot be
 *    reproduced from published data.
 */

/**
 * The bones worth offering. Mirrored limbs are dropped — a left thigh and a right thigh resolve to
 * the same scalar, the same pool size and the same armour zone, so listing both is two rows for one
 * reading. The four torso bones stay separate because a vest routinely rates them differently: a
 * 6B45 carries class 5 on the chest and class 4 on the pelvis under one class-5 badge.
 */
const BONES = [
    'head', 'spine_03', 'spine_02', 'spine_01', 'pelvis',
    'upperarm_l', 'lowerarm_l', 'thigh_l', 'calf_l',
] as const;

/** Mirrored bones lose the side in the label; the reading is the same on either. */
const BONE_LABEL: Record<string, string> = {
    ...LABEL_OF_BONE,
    upperarm_l: 'Upper arm', lowerarm_l: 'Forearm', thigh_l: 'Thigh', calf_l: 'Calf',
};

/**
 * Firing power, in the units the player actually reads.
 *
 * The gunsmith screen shows `90 + 20*base + 100*sum`, which is exactly `100 * (0.9 + 0.2 * fp)`.
 * So the percentage on the bench *is* the damage factor, and asking for it directly beats asking a
 * reader for a raw `FiringPower` nobody is ever shown. See `lib/gunsmith/assembly.ts`.
 */
const fpFromDisplay = (percent: number): number => (percent - 90) / 20;
const displayFromFp = (fp: number): number => 90 + 20 * fp;

/**
 * What the page opens on when no link seeds it.
 *
 * Not arbitrary: this is the pairing the 2026-09-05 in-game capture used, so the figures a reader
 * meets first are ones that were checked against the game. It is also the case the guide's own
 * prose leans on — the 6B45 rates its chest class 5 and its pelvis class 4 under one class-5 badge,
 * so tapping between those two bones demonstrates the zone-not-badge rule in a single tap.
 */
const DEFAULT_ROUND = 'ammo-556x45-tracerv2';
const DEFAULT_PLATE = 'armor-6b45';

/** What the plate rates on this bone: the matched zone, never the item's headline badge. */
function zoneFor(item: Armor | null, bone: string): { armorClass: number; blunt: number } | null {
    if (!item) return null;
    const zones = item.stats.protectiveData ?? [];
    const exact = zones.find((zone) => zone.bodyPart === bone);
    // Head gear publishes its zone as `head_top` rather than as the `head` bone the rig names.
    const matched = exact
        ?? (bone === 'head' ? zones.find((zone) => zone.bodyPart.startsWith('head')) : undefined);
    if (!matched) return null;
    return { armorClass: matched.armorClass, blunt: matched.bluntDamageScalar };
}

const fmt = (value: number, places = 3): string =>
    value.toLocaleString('en-US', { minimumFractionDigits: places, maximumFractionDigits: places });

/** One line of the derivation: what it is, how it is computed, and what it came to. */
function Step({
    label, expression, value, unit, children,
}: {
    label: string;
    expression: string;
    value: string;
    unit?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="py-3 border-b border-line-800 last:border-b-0">
            <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm text-ink-300">{label}</span>
                <span className="font-mono tabular text-base text-ink-100 shrink-0">
                    {value}
                    {unit && <span className="text-ink-600 text-xs ml-1">{unit}</span>}
                </span>
            </div>
            <div className="mt-1 font-mono text-xs text-ink-600 break-words">{expression}</div>
            {children}
        </div>
    );
}

/** A chooser that reads as one: the picture, the name, and the figure that decides the outcome. */
function SetupButton({
    eyebrow, onClick, children,
}: {
    eyebrow: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <div>
            <span className="eyebrow block mb-1">{eyebrow}</span>
            <button
                type="button"
                onClick={onClick}
                className={cn(
                    'w-full min-h-14 px-3 py-2 flex items-center gap-3 text-left',
                    'bg-steel-800 border border-line-700 hover:bg-steel-750 transition-colors',
                )}
            >
                {children}
            </button>
        </div>
    );
}

function AmmoDialog({
    rounds, selectedId, onSelect, onClose,
}: {
    rounds: Ammunition[];
    selectedId: string | null;
    onSelect: (round: Ammunition) => void;
    onClose: () => void;
}) {
    const [query, setQuery] = useState('');
    const filter = query.trim().toLowerCase();
    const matching = useMemo(() => {
        const list = filter ? rounds.filter((round) => round.name.toLowerCase().includes(filter)) : rounds;
        // Penetration descending: the figure the reader is shopping on, same as the armour picker.
        return [...list].sort((a, b) => b.stats.penetration - a.stats.penetration);
    }, [rounds, filter]);

    return (
        <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}>
            <DialogContent
                showCloseButton={false}
                className={cn(
                    'bg-steel-800 border-line-700 rounded-none p-0 gap-0 block',
                    'w-[calc(100%-1rem)] max-w-2xl sm:max-w-2xl max-h-[92vh] overflow-y-auto',
                )}
            >
                <div className="sticky top-0 z-10 bg-steel-800 border-b border-line-700 p-3">
                    <div className="flex items-center gap-2">
                        <DialogTitle className="text-ink-100 text-base flex-1">Round</DialogTitle>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="size-11 flex items-center justify-center text-ink-500 hover:text-ink-100"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="relative mt-2">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search rounds"
                            className="pl-9 h-11 bg-steel-850 border-line-700"
                        />
                    </div>
                </div>
                <div className="divide-y divide-line-800">
                    {matching.map((round) => (
                        <AmmoRow
                            key={round.id}
                            ammo={round}
                            selected={round.id === selectedId}
                            onSelect={() => { onSelect(round); onClose(); }}
                        />
                    ))}
                    {matching.length === 0 && (
                        <p className="p-6 text-center text-sm text-ink-500">No round matches that.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Inspector() {
    const { items } = useFetchItems();
    const params = useSearchParams();

    const rounds = useMemo(
        () => items.filter((item: Item): item is Ammunition => isAmmunition(item)),
        [items],
    );
    const plates = useMemo(
        () => items.filter((item: Item): item is Armor => isArmor(item)),
        [items],
    );

    /*
     * The seed. Every parameter is optional and a bad one simply does not apply: this link is built
     * by `ZoneReadout` for one row out of a ladder, and a guide that 404s its own examples is worse
     * than one that opens on a sensible default.
     */
    const seed = useMemo(() => {
        const byId = new Map(items.map((item) => [item.id, item]));
        const number = (key: string): number | null => {
            const raw = params.get(key);
            if (raw === null) return null;
            const parsed = Number(raw);
            return Number.isFinite(parsed) ? parsed : null;
        };
        const seededRound = byId.get(params.get('ammo') ?? '') ?? byId.get(DEFAULT_ROUND);
        const seededPlate = byId.get(params.get('armor') ?? '') ?? byId.get(DEFAULT_PLATE);
        const seededBone = params.get('bone');
        const seededRange = number('range');
        return {
            round: seededRound && isAmmunition(seededRound) ? seededRound : rounds[0] ?? null,
            plate: seededPlate && isArmor(seededPlate) ? seededPlate : null,
            bone: seededBone && (BONES as readonly string[]).includes(seededBone) ? seededBone : 'spine_03',
            durability: number('dur'),
            fp: number('fp'),
            range: seededRange !== null && RANGE_VALUES.includes(seededRange) ? seededRange : 0,
        };
        // Read once, on mount. After that the controls own the state and the URL is history.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    const [round, setRound] = useState<Ammunition | null>(seed.round);
    const [plate, setPlate] = useState<Armor | null>(seed.plate);
    const [bone, setBone] = useState<string>(seed.bone);
    const [range, setRange] = useState<number>(seed.range);
    const [firingPower, setFiringPower] = useState<number>(seed.fp ?? 0.5);
    const [wear, setWear] = useState<number | null>(seed.durability);
    const [picking, setPicking] = useState<'ammo' | 'armor' | null>(null);

    const maxDurability = plate?.stats.maxDurability ?? 0;
    const durability = wear === null ? maxDurability : Math.min(wear, maxDurability);

    const resolved = resolveBone(bone);
    const zone = useMemo(() => zoneFor(plate, bone), [plate, bone]);

    const explanation: ShotExplanation | null = useMemo(() => {
        if (!round) return null;
        return explainShot(
            ammoProperties(round),
            plate && zone
                ? {
                    armorClass: zone.armorClass,
                    bluntDamageScalar: zone.blunt,
                    maxDurability: plate.stats.maxDurability,
                    currentDurability: durability,
                    durabilityDamageScalar: plate.stats.durabilityDamageScalar,
                    penetrationChanceCurve: plate.stats.penetrationChanceCurve ?? [],
                    penetrationDamageScalarCurve: plate.stats.penetrationDamageScalarCurve ?? [],
                    antiPenetrationDurabilityScalarCurve: plate.stats.antiPenetrationDurabilityScalarCurve ?? [],
                }
                : null,
            plate && zone ? durability : null,
            firingPower,
            resolved.scalar,
            range,
        );
    }, [round, plate, zone, durability, firingPower, resolved.scalar, range]);

    if (!round || !explanation) {
        return <p className="text-sm text-ink-500">No ammunition data available.</p>;
    }

    const figures = ammoFigures(round);
    const armour = explanation.armour;

    return (
        <div className="bg-steel-850 border border-line-700 not-prose">
            <header className="px-4 py-3 border-b border-line-700 flex items-center justify-between gap-3">
                <h3 className="text-ink-100 text-lg">Shot inspector</h3>
                <PanelNote label="What the inspector does and does not model">
                    Every figure is produced by the simulator&rsquo;s own <em>explainShot</em>, so this
                    page cannot disagree with the model it describes. It assumes the piece you pick
                    covers the hit — whether it does is geometry, and the{' '}
                    <Link href="/combat-sim" className="text-ember underline">simulator</Link> answers
                    that. Penetration already spent crossing an earlier surface is not modelled.
                </PanelNote>
            </header>

            {/*
              * ---- setup ----
              * `[&>*]:min-w-0` is load-bearing, not tidiness. A grid item defaults to
              * `min-width: auto`, so it refuses to shrink below its content and the widest cell
              * silently sizes the track for all of them — which pushed this panel 29px past a
              * 390px viewport and gave the whole page a horizontal scrollbar.
              */}
            <div className="p-4 grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
                <SetupButton eyebrow="Round" onClick={() => setPicking('ammo')}>
                    <ItemIcon item={round} size={36} />
                    <span className="min-w-0 flex-1">
                        <span className="block text-sm text-ink-100 truncate">{round.name}</span>
                        <span className="block micro-label text-ink-700 mt-0.5">
                            {figures.damage} damage &middot; {figures.blunt}% if stopped
                        </span>
                    </span>
                    <ClassLadder value={figures.penetration} size="sm" className="shrink-0" />
                </SetupButton>

                <SetupButton eyebrow="Armour" onClick={() => setPicking('armor')}>
                    {plate ? (
                        <>
                            <ItemIcon item={plate} size={36} />
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm text-ink-100 truncate">{plate.name}</span>
                                <span className="block micro-label text-ink-700 mt-0.5">
                                    {zone
                                        ? `class ${armorClassLabel(zone.armorClass)} here · ${Math.round(zone.blunt * 100)}% blunt`
                                        : 'does not reach this bone'}
                                </span>
                            </span>
                            {zone && <ClassLadder value={zone.armorClass} size="sm" className="shrink-0" />}
                        </>
                    ) : (
                        <span className="text-sm text-ink-500">Bare flesh &mdash; pick a piece</span>
                    )}
                </SetupButton>

                <div>
                    <span className="eyebrow block mb-1">Where it lands</span>
                    <div className="flex flex-wrap gap-1">
                        {BONES.map((id) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setBone(id)}
                                aria-pressed={bone === id}
                                className={cn(
                                    'min-h-11 px-3 text-xs border transition-colors',
                                    bone === id
                                        ? 'bg-steel-700 border-ember text-ink-hi'
                                        : 'bg-steel-800 border-line-700 text-ink-400 hover:bg-steel-750',
                                )}
                            >
                                {BONE_LABEL[id] ?? id}
                            </button>
                        ))}
                    </div>
                    <p className="mt-1 micro-label text-ink-700">
                        multiplier {resolved.scalar} &middot; {resolved.part} pool
                    </p>
                </div>

                <div>
                    <span className="eyebrow block mb-1">Range</span>
                    <div className="flex flex-wrap gap-1">
                        {RANGE_VALUES.map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setRange(value)}
                                aria-pressed={range === value}
                                className={cn(
                                    'min-h-11 px-3 text-xs font-mono tabular border transition-colors',
                                    range === value
                                        ? 'bg-steel-700 border-ember text-ink-hi'
                                        : 'bg-steel-800 border-line-700 text-ink-400 hover:bg-steel-750',
                                )}
                            >
                                {value === 0 ? 'point blank' : `${value} m`}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-baseline justify-between">
                        <span className="eyebrow">Firing power</span>
                        <span className="font-mono tabular text-sm text-ink-200">
                            {Math.round(displayFromFp(firingPower))}%
                        </span>
                    </div>
                    <Slider
                        label="Firing power, as the gunsmith screen shows it"
                        value={Math.round(displayFromFp(firingPower))}
                        min={90}
                        max={115}
                        step={1}
                        onChange={(percent) => setFiringPower(fpFromDisplay(percent))}
                        valueText={(percent) => `${percent} percent`}
                        ticks={[100, 105]}
                    />
                </div>

                <div>
                    <div className="flex items-baseline justify-between">
                        <span className="eyebrow">Plate condition</span>
                        <span className="font-mono tabular text-sm text-ink-200">
                            {plate ? `${Math.round(durability)} of ${maxDurability}` : '—'}
                        </span>
                    </div>
                    <Slider
                        label="Durability the plate has left"
                        value={durability}
                        min={0}
                        max={maxDurability || 1}
                        step={1}
                        onChange={setWear}
                        disabled={!plate}
                        valueText={(value) => `${Math.round(value)} of ${maxDurability} durability`}
                    />
                </div>
            </div>

            {/* ---- the derivation ---- */}
            <div className="px-4 pb-4">
                <div className="bg-steel-900 border border-line-800 px-4">
                    <Step
                        label="Damage at this range"
                        expression={range === 0
                            ? `${round.stats.damage} — point blank reads the round's own figure`
                            : `DamageOverDistance read at ${range * 100} cm`}
                        value={fmt(explanation.rangeDamage, 2)}
                    />
                    <Step
                        label="Penetration at this range"
                        expression={range === 0
                            ? `${round.stats.penetration} — firing power never touches this`
                            : `PenetrationPowerOverDistance at ${range * 100} cm`}
                        value={fmt(explanation.rangePenetration, 2)}
                    />
                    <Step
                        label="Firing power factor"
                        expression={`0.9 + 0.2 × ${fmt(firingPower, 2)}`}
                        value={fmt(explanation.firePower, 3)}
                    />
                    <Step
                        label="Base damage"
                        expression={`${fmt(explanation.rangeDamage, 2)} × ${resolved.scalar} (${BONE_LABEL[bone]}) × ${fmt(explanation.firePower, 3)}`}
                        value={fmt(explanation.baseDamage)}
                        unit="HP"
                    >
                        <p className="mt-1 text-xs text-ink-500">
                            The plate is billed from this same number, not from a separate
                            pre-multiplier figure.
                        </p>
                    </Step>

                    {!armour && (
                        <Step
                            label="Nothing covers the hit"
                            expression="ProcessDamageReceived returns before it writes a damage figure"
                            value={fmt(explanation.bareDamage)}
                            unit="HP"
                        />
                    )}

                    {armour && zone && (
                        <>
                            <Step
                                label="Plate effectiveness"
                                expression={`AntiPenetrationDurabilityScalarCurve at ${fmt(1 - armour.durabilityFraction, 3)} (= 1 − ${Math.round(durability)}/${maxDurability})`}
                                value={fmt(armour.effectiveness, 3)}
                            />
                            <Step
                                label="Class it is actually rating"
                                expression={`${armorClassLabel(zone.armorClass)} × ${fmt(armour.effectiveness, 3)}`}
                                value={fmt(armour.effectiveArmorClass, 2)}
                            >
                                <p className="mt-1 text-xs text-ink-500">
                                    Durability scales the class itself. A worn plate does not merely
                                    run out — it rates lower every round.
                                </p>
                            </Step>
                            <Step
                                label="Gap"
                                expression={`${fmt(armour.effectiveArmorClass, 2)} − ${fmt(explanation.rangePenetration, 2)}`}
                                value={fmt(armour.delta, 2)}
                            />
                            <Step
                                label="Chance it goes through"
                                expression={armour.bypassed
                                    ? 'DurabilityLevel ≤ 0 — GetIsPenetrated returns true without consulting the curve'
                                    : `PenetrationChanceCurve read at ${fmt(armour.delta, 2)}`}
                                value={`${(armour.penetrationChance * 100).toFixed(1)}%`}
                            />
                        </>
                    )}
                </div>

                {/* ---- the two outcomes ---- */}
                {armour && zone && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
                        {([
                            [
                                'stopped', 'Stopped', armour.stopped, 1 - armour.penetrationChance,
                                `${figures.blunt}% (round) × ${Math.round(zone.blunt * 100)}% (this zone)`,
                            ],
                            [
                                'through', 'Goes through', armour.through, armour.penetrationChance,
                                `PenetrationDamageScalarCurve at ${fmt(armour.clampedDelta, 2)}`,
                            ],
                        ] as const).map(([key, title, data, chance, source]) => (
                            <div
                                key={key}
                                className={cn(
                                    'p-4 border',
                                    armour.likelier === key
                                        ? 'bg-steel-800 border-ember'
                                        : 'bg-steel-900 border-line-800',
                                )}
                            >
                                <div className="flex items-baseline justify-between gap-2">
                                    <span className="eyebrow">{title}</span>
                                    <span className="font-mono tabular text-xs text-ink-500">
                                        {(chance * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <p className="mt-2 font-mono tabular text-2xl text-ink-100">
                                    {fmt(data.damage)}
                                    <span className="text-ink-600 text-sm ml-1">HP</span>
                                </p>
                                <p className="mt-1 font-mono text-xs text-ink-600 break-words">
                                    {fmt(explanation.baseDamage)} × {fmt(data.scalar, 3)} × {fmt(explanation.firePower, 3)}
                                </p>
                                <p className="mt-1 text-xs text-ink-500">scalar from {source}</p>
                                <p className="mt-3 pt-3 border-t border-line-800 font-mono tabular text-sm text-ink-200">
                                    {fmt(data.durabilityLoss, 2)}
                                    <span className="text-ink-600 text-xs ml-1">durability off the plate</span>
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <p className="mt-4 text-sm text-ink-500">
                    The same round on bare flesh here does{' '}
                    <span className="font-mono tabular text-ink-200">{fmt(explanation.bareDamage)}</span> HP.
                    {armour && ' A hit the armour covers is scaled by firing power twice; a bare one, once.'}
                    {armour && !armour.bypassed && (armour.likelier === 'through'
                        ? ' The simulator draws the “goes through” figure, as the likelier half of the roll.'
                        : ' The simulator draws the “stopped” figure, as the likelier half of the roll.')}
                    {armour && armour.bypassed
                        && ' A broken plate is bypassed outright, so there is no roll to lose.'}
                </p>
            </div>

            {picking === 'ammo' && (
                <AmmoDialog
                    rounds={rounds}
                    selectedId={round.id}
                    onSelect={setRound}
                    onClose={() => setPicking(null)}
                />
            )}
            {picking === 'armor' && (
                <ArmorPicker
                    title="Armour"
                    items={plates}
                    emptyLabel="Bare flesh"
                    selectedId={plate?.id ?? null}
                    onSelect={(item) => { setPlate(item); setWear(null); }}
                    onClose={() => setPicking(null)}
                />
            )}
        </div>
    );
}

export default function ShotInspector() {
    return (
        <Suspense
            fallback={
                <div className="bg-steel-850 border border-line-700 p-8 flex items-center justify-center gap-3 text-ink-500">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-sm">Loading the catalogue…</span>
                </div>
            }
        >
            <Inspector />
        </Suspense>
    );
}
