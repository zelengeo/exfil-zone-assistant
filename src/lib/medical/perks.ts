/**
 * What a medical item does to you while its perk is up.
 *
 * The item pages already print how long a stim lasts and what it costs to use. What they could not
 * say until the perk data arrived is the part a player actually picks a stim for: the KB-22 is
 * thirty percent more carry weight, and the P4 buys its stamina back with a comedown. This turns
 * the raw effect rows into lines a page can print.
 *
 * Everything here is pure and reads nothing but the stats it is handed, so `perks.test.ts` holds it
 * to the real eight items.
 *
 * ## Sign is not the same as good
 *
 * Two of the six targets are *drains* — energy and hydration count upward, so `+0.3/s` on one of
 * those is a cost, while `+0.3` on carry weight is the reason you took the thing. Nothing here can
 * be coloured by sign alone, which is what `cost` on each row is for.
 *
 * ## Names are derived, not mapped
 *
 * `RapidPulsePerk` becomes "Rapid Pulse" by stripping the suffix and splitting the camel case, and
 * every one of the five perks in the data lands correctly on that rule. A lookup table would need
 * an edit for a perk the next extraction adds; this does not. Target labels keep a small table
 * because `weightLimit` reads better as "Carry weight" than as "Weight limit", but they fall back
 * to the same derivation, so an unknown target prints readably instead of blank.
 */
import type { MedicinePerkStats, PerkEffect } from '@/types/items';

/** Targets that count upward, where a positive value is something you pay rather than gain. */
const DRAIN_TARGETS = new Set(['energyDrain', 'hydrationDrain']);

/** Only where the derived label reads worse than a written one. Everything else derives. */
const TARGET_LABELS: Record<string, string> = {
    weightLimit: 'Carry weight',
};

/** `RapidPulsePerk` -> `['Rapid', 'Pulse']`; `maxStamina` -> `['max', 'Stamina']`. */
const words = (raw: string): string[] =>
    raw.replace(/Perk$/, '').replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim().split(/\s+/);

const capitalise = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);

/**
 * A perk is a name, so it is title case: `RapidPulsePerk` -> `Rapid Pulse`.
 *
 * A target is a label rather than a name, so it takes sentence case instead — `maxStamina` reads as
 * "Max stamina", not "Max Stamina", which is the casing every other stat label on the page uses.
 */
export const perkName = (perk: string): string => words(perk).map(capitalise).join(' ');

export const targetLabel = (target: string): string =>
    TARGET_LABELS[target] ?? capitalise(words(target).join(' ').toLowerCase());

/**
 * One effect, ready to print.
 *
 * `value` is already signed and carries its unit, because a bare number is unreadable next to a
 * label that could mean a percentage or a rate.
 */
export interface PerkEffectRow {
    /** The game's own attribute id — unique within a perk, so it doubles as a React key. */
    attribute: string;
    label: string;
    value: string;
    /** Whether this line is something the item takes rather than gives. */
    cost: boolean;
}

/**
 * A signed, united figure.
 *
 * A scalar is a fraction of the base and prints as a percentage; a rate prints per second. An
 * unrecognised mode prints the raw number rather than guessing a unit onto it — a wrong unit is
 * worse than none.
 */
export function formatEffectValue(effect: PerkEffect): string {
    const sign = effect.value < 0 ? '−' : '+';
    const magnitude = Math.abs(effect.value);

    if (effect.mode === 'scalar') return `${sign}${Math.round(magnitude * 100)}%`;
    if (effect.mode === 'perSecond') return `${sign}${Number(magnitude.toPrecision(6))}/s`;
    return `${sign}${Number(magnitude.toPrecision(6))}`;
}

export const effectRow = (effect: PerkEffect): PerkEffectRow => ({
    attribute: effect.attribute,
    label: targetLabel(effect.target),
    value: formatEffectValue(effect),
    cost: DRAIN_TARGETS.has(effect.target) ? effect.value > 0 : effect.value < 0,
});

/** The comedown: its own window, with its own effects. */
export interface PerkAfter {
    duration: number | null;
    effects: PerkEffectRow[];
}

export interface MedicinePerk {
    /** The game's perk class, kept for the source reveal. */
    key: string;
    name: string;
    /** Seconds it is up, or null where the data names no duration. */
    duration: number | null;
    /** Empty for a perk that is a state rather than a set of modifiers — every painkiller. */
    effects: PerkEffectRow[];
    after: PerkAfter | null;
}

/**
 * The perk one medical item applies, or null where it applies none.
 *
 * Null for the ten items with no `perk` at all. A perk with no effects is *not* null — morphine
 * applying the painkiller perk is worth saying even when the data lists no modifiers for it, and
 * the caller decides how much room that deserves.
 */
export function medicinePerkOf(stats: MedicinePerkStats): MedicinePerk | null {
    if (!stats.perk) return null;

    const after = stats.perkAfterEffects?.length
        ? {
            duration: stats.perkAfterDuration ?? null,
            effects: stats.perkAfterEffects.map(effectRow),
        }
        : null;

    return {
        key: stats.perk,
        name: perkName(stats.perk),
        duration: stats.perkDuration ?? null,
        effects: (stats.perkEffects ?? []).map(effectRow),
        after,
    };
}

/**
 * Whether a perk has enough to say to earn a panel of its own.
 *
 * A perk with effects always does. One without is only worth the space when it tells the reader
 * something the item's own name does not: that morphine applies the painkiller perk is real news,
 * while a panel reading "Painkiller · 160s / no modifiers" on the item *called* Painkiller, directly
 * above the duration it already prints, is the same fact three times.
 *
 * The name test is deliberately literal rather than clever. It separates the four items in the data
 * correctly, and when it eventually misjudges one the cost is a small redundant panel rather than a
 * missing figure — the safe direction for a rule about screen space.
 */
export const perkEarnsPanel = (perk: MedicinePerk, itemName: string): boolean =>
    perk.effects.length > 0 || !itemName.toLowerCase().includes(perk.name.toLowerCase());
