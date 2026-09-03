import { RARITY_CONFIG, type ItemRarity } from '@/types/items';

/**
 * Armour class as colour: the rarity ladder, borrowed.
 *
 * Five things have to agree on this — the body viewer, the head viewer, the unrolled map, the two
 * zone tables and the card strip — so it lives here rather than as a constant in whichever
 * component happened to need it first.
 *
 * Rarity was the right thing to borrow because both scales are ordinal and the game already ties
 * them: class 4 gear is Rare or Epic, class 6 is Epic, Legendary or Ultimate. A reader fluent in
 * the card ladder reads a plate the same way round without learning a second vocabulary. Derived
 * from `RARITY_CONFIG` rather than copied out of it, so a retune of the tiers moves this with it.
 *
 * The borrowing stops at the hue. These are classes, never tiers: the legends and labels print
 * "Class 5", because a class 5 vest is not a Legendary item and saying so would be a lie the colour
 * then appears to confirm. And because the ladder is a *categorical* palette — `globals.css` records
 * that non-adjacent tiers do not clear colourblind separation, which is why `RarityBadge` always
 * prints the tier name — nothing here may be drawn as colour alone. Every surface using this scale
 * prints the figure too.
 */

/** Class 1 through 6, in order. */
const LADDER: readonly ItemRarity[] = [
    'Common',
    'Uncommon',
    'Rare',
    'Epic',
    'Legendary',
    'Ultimate',
];

/**
 * Worn, and rating nothing: a beanie, a cap, the TSh-4M. Deliberately a *light* neutral, because
 * these still cover you — the picture's rule is "lit means something is there", and a class 0 hat
 * drawn in the uncovered tone made the beanie's 73% coverage invisible against its own bare face.
 *
 * It sits close to class 1's grey, which is the one confusion this scale tolerates: adjacent rungs
 * may be close, both print their figure, and mistaking class 0 for class 1 costs a reader nothing.
 */
export const UNRATED_COLOR = '#7E909F';

/** Nothing covers this at all — an empty pip, a bone no plate reaches. A different fact. */
export const UNCOVERED_COLOR = '#28323B';

/** The scale's rungs, for a legend that wants to show the whole ramp. */
export const ARMOR_CLASS_STEPS: readonly number[] = [1, 2, 3, 4, 5, 6];

/**
 * The rung a class sits on. The catalogue is not all integers — the TSh-4M rates 0.3, a beret 1.6,
 * the JPC's shoulders 3.5 — so anything positive rounds to a rung and anything below half a class
 * still gets rung 1 rather than falling into "unrated".
 */
export function armorClassStep(value: number): number {
    if (!(value > 0)) return 0;
    return Math.min(6, Math.max(1, Math.round(value)));
}

/**
 * The tone for a piece rating `value`. A class of 0 or null is a piece that covers but rates
 * nothing, NOT an absence — callers describing an absence want `UNCOVERED_COLOR` instead.
 */
export function armorClassColor(value: number | null | undefined): string {
    const step = typeof value === 'number' ? armorClassStep(value) : 0;
    return step === 0 ? UNRATED_COLOR : RARITY_CONFIG[LADDER[step - 1]].color;
}

/** `0.3` on the TSh-4M is real data; `4.0` on everything else is noise. */
export function armorClassLabel(value: number): string {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}
