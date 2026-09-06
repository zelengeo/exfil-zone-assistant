/**
 * One loadout against one defender at one range: the whole answer the page draws.
 *
 * Replaces `combat-calculations.ts`, which walked a hand-authored zone table and resolved armour by
 * matching zone *ids* against `protectiveData[].bodyPart`. Both jobs now belong upstream — the
 * zones come off the shipped collision model and the armour off `Is Protected`, in
 * `target-model.ts` — so what is left here is the loop over them, the three verdict tiers, and the
 * two derived figures the shot model does not produce.
 *
 * The engine is pure and synchronous. It is called from a `useMemo`, not an effect: the old hook
 * debounced its own calculation by 100 ms and then wrote the result into state, which is a
 * re-render either way and one frame later than necessary.
 */

import { cheapestOffer } from '@/lib/trade';
import { gradeFromStops, type Grade, type GradeStop } from '@/lib/quality/grade';
import { LIMB_TIERS, ZONE_GROUP_PLURALS } from './target-model';
import type { ShotResultWithLeftovers } from './types';
import { simulateCombat } from './damage-calculations';
import { ammoProperties, armorProperties } from './props';
import { estimateSpray, type SprayEstimate } from './spray';
import { isReady, type Loadout } from './loadout';
import type { TargetModel, TargetZone } from './target-model';

/** A round of this build, landing on this zone, until the target is down. */
export interface ZoneOutcome {
    zone: TargetZone;
    /** Infinity when the target survives the safety limit — the round cannot do it. */
    shotsToKill: number;
    /** Seconds, from the first round to the last. One shot is instant. */
    ttk: number;
    /** EZD at the cheapest listed price for the round. */
    costToKill: number;
    /** The class actually resolved for this zone, 0 where nothing covers it. */
    armorClass: number;
    isProtected: boolean;
    /** Every shot, with the health and durability left after it — this is the shot ladder. */
    shots: ShotResultWithLeftovers[];
    finalArmorDurability: number;
    totalDamageDealt: number;
}

/**
 * The three tiers of the verdict bar, from what is possible to what actually happens.
 *
 * `bestCase` is the fewest rounds anywhere on the target, which is a head reading on essentially
 * every setup. `aimed` is the fewest rounds **off the head** — the honest recommendation, because
 * it is the shot a player can take repeatably. `spray` is the estimate.
 */
export interface Verdict {
    bestCase: ZoneOutcome | null;
    aimed: ZoneOutcome | null;
    spray: SprayEstimate | null;
}

export interface LoadoutOutcome {
    loadoutId: string;
    loadout: Loadout;
    /** Head readings first, then every other capsule, in the target model's order. */
    zones: ZoneOutcome[];
    head: ZoneOutcome[];
    body: ZoneOutcome[];
    byZoneId: Map<string, ZoneOutcome>;
    /**
     * One outcome per capsule, for the body figure. The head takes the reading a round is most
     * likely to arrive at — its largest share — and the figure bands the rest.
     */
    byCapsule: Map<number, ZoneOutcome>;
    verdict: Verdict;
}

const INFINITE = 99;

function outcomeFor(
    zone: TargetZone,
    loadout: Loadout,
    range: number,
): ZoneOutcome {
    const ammo = loadout.ammo!;
    const result = simulateCombat(
        ammoProperties(ammo),
        armorProperties(zone.armour),
        loadout.build.sim.firingPower,
        { scalar: zone.scalar, maxHealth: zone.maxHealth, vital: zone.vital },
        range,
    );

    // The safety limit is not an answer — a round that has not killed in 99 cannot.
    const shotsToKill = result.shotsToKill >= INFINITE ? Infinity : result.shotsToKill;
    const interval = 60 / loadout.build.sim.fireRate;
    const price = cheapestOffer(ammo.stats)?.price ?? 0;

    return {
        zone,
        shotsToKill,
        ttk: shotsToKill === Infinity ? Infinity : (shotsToKill - 1) * interval,
        costToKill: shotsToKill === Infinity ? Infinity : shotsToKill * price,
        armorClass: zone.armour?.armorClass ?? 0,
        isProtected: zone.armour !== null,
        shots: result.shots,
        finalArmorDurability: result.finalArmorDurability,
        totalDamageDealt: result.totalDamageDealt,
    };
}

const fewest = (outcomes: ZoneOutcome[]): ZoneOutcome | null =>
    outcomes.reduce<ZoneOutcome | null>(
        (best, outcome) => (!best || outcome.shotsToKill < best.shotsToKill ? outcome : best),
        null,
    );

/** Run one loadout against the target. Returns null when the loadout has no round, or a wrong one. */
export function runScenario(
    loadout: Loadout,
    target: TargetModel,
    range: number,
): LoadoutOutcome | null {
    if (!isReady(loadout) || !loadout.ammo) return null;

    const head = target.head.map((zone) => outcomeFor(zone, loadout, range));
    const body = target.body.map((zone) => outcomeFor(zone, loadout, range));
    const zones = [...head, ...body];

    const byZoneId = new Map(zones.map((outcome) => [outcome.zone.id, outcome]));
    const byCapsule = new Map<number, ZoneOutcome>();
    for (const outcome of body) byCapsule.set(outcome.zone.capsule, outcome);
    const dominantHead = head.reduce<ZoneOutcome | null>(
        (best, outcome) => (!best || (outcome.zone.headShare ?? 0) > (best.zone.headShare ?? 0) ? outcome : best),
        null,
    );
    if (dominantHead) byCapsule.set(dominantHead.zone.capsule, dominantHead);

    return {
        loadoutId: loadout.id,
        loadout,
        zones,
        head,
        body,
        byZoneId,
        byCapsule,
        verdict: {
            bestCase: fewest(zones),
            aimed: fewest(body),
            spray: estimateSpray({
                target,
                ammo: loadout.ammo,
                firingPower: loadout.build.sim.firingPower,
                fireRate: loadout.build.sim.fireRate,
                moa: loadout.build.sim.MOA,
                recoil: loadout.build.sim.recoilParameters,
                range,
            }),
        },
    };
}

/** Every ready loadout, in slot order. */
export function runScenarios(
    loadouts: Loadout[],
    target: TargetModel,
    range: number,
): LoadoutOutcome[] {
    return loadouts
        .map((loadout) => runScenario(loadout, target, range))
        .filter((outcome): outcome is LoadoutOutcome => outcome !== null);
}

/* -------------------------------------------------------------------------
 * The ramp
 *
 * Colour is spent on shots-to-kill and never on loadout identity. That is the reason the
 * four-overlaid alternative had to be dropped: once colour means "which gun", the picture can no
 * longer say "this is the soft spot".
 *
 * These are the app's four shared grades (`src/lib/quality/grade.ts`), so the meter here is the
 * meter on a weapon stat and on an item page. What is local is the wording — a rung is called
 * "workable" rather than "upper half", because nobody can rank a shots-to-kill figure against a
 * peer set: the peers would be every loadout the reader has not assembled.
 *
 * The worst rung deviates from the shared palette, and this is the one place that happens. Ember
 * is `BodyViewer`'s selection colour, and these tones are painted onto the same capsules a reader
 * selects — a body filled with the selection colour cannot then show which capsule is selected. It
 * is also the wrong semantics: a zone that will not die is a dead end, not an alert.
 *
 * The rungs are named for **what the shot actually is**, not for a verdict on it. A rung called
 * "workable" is the page telling the reader what to think; "burst" is the page telling them what
 * they will be doing, which is the thing they can feel in the headset. The boundaries follow the
 * same logic — one round is a tap, two or three is a burst, anything up to about nine is holding
 * the trigger, and past that you are emptying the magazine into them.
 *
 * The last rung still runs to the ninety-nine-shot safety limit and `∞`, which is far too wide to
 * be read as a colour. That is why the figure is printed on every capsule, and why `∞` is drawn
 * hollow rather than merely darker.
 * ---------------------------------------------------------------------- */

export const SHOTS_RAMP: readonly GradeStop[] = [
    { max: 1, color: '#4ADE80', label: 'tap' },
    { max: 3, color: '#FFB020', label: 'burst' },
    { max: 9, color: '#5B8CA8', label: 'spray' },
    { max: Infinity, color: '#33414D', label: 'mag dump' },
];

/**
 * The span a rung covers, as a key reads it: `1`, `2–3`, `4–9`, `10+`.
 *
 * Derived from the stops rather than written beside them, so moving a boundary cannot leave the
 * legend claiming the old one.
 */
export function shotsRangeLabel(index: number): string {
    const step = SHOTS_RAMP[index];
    const from = index === 0 ? 1 : SHOTS_RAMP[index - 1].max + 1;
    if (!Number.isFinite(step.max)) return `${from}+`;
    return from === step.max ? String(step.max) : `${from}–${step.max}`;
}

/** The shared grade for a shots-to-kill figure — the meter, the rung name and the colour. */
export function shotsGrade(shots: number): Grade {
    return gradeFromStops(shots, SHOTS_RAMP);
}

export function shotsColor(shots: number): string {
    return shotsGrade(shots).color;
}

/**
 * What to call the aimed recommendation.
 *
 * "Left upper arm" is an arbitrary pick whenever its mirror — and often a thigh too — returns the
 * same number: `DETAIL_SCALAR` rates both upper limbs at 0.7 and both lower limbs at 0.5, so on a
 * bare target four capsules tie for the same recommendation and the reader is told to aim at one
 * of them for no reason.
 *
 * The set is measured, never assumed. Only zones that **actually return the same figure** are
 * folded into one name, so a vest that reaches a shoulder and not a thigh breaks the tie and the
 * verdict goes back to naming the single zone that wins. That is the same rule as the body figure's
 * thirteen numerals: a shared name is only honest where the readings behind it agree.
 */
export function aimedZoneLabel(aimed: ZoneOutcome, body: ZoneOutcome[]): string {
    const tied = body.filter((entry) => entry.shotsToKill === aimed.shotsToKill);
    if (tied.length < 2) return aimed.zone.label.toLowerCase();

    const groups = new Set(tied.map((entry) => entry.zone.group));

    // A whole tier only earns its name when every group in it ties, and nothing outside it does.
    for (const tier of LIMB_TIERS) {
        if (groups.size !== tier.groups.length) continue;
        if (tier.groups.every((group) => groups.has(group))) return tier.label;
    }

    // Otherwise name the winner's own group, which every tying member of it shares.
    return ZONE_GROUP_PLURALS[aimed.zone.group];
}

/** `∞` for a round that cannot do it, which is a real answer and reads better than a blank. */
export function formatShots(shots: number): string {
    return Number.isFinite(shots) ? String(shots) : '∞';
}

export function formatSeconds(seconds: number): string {
    return Number.isFinite(seconds) ? `${seconds.toFixed(2)}s` : '∞';
}
