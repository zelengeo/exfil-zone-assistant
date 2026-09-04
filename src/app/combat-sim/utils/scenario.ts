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
 * Colour is spent on shots-to-kill and never on loadout identity. That is the whole reason the
 * body figure reads without a legend, and the reason the four-overlaid alternative had to be
 * dropped: once colour means "which gun", the picture can no longer say "this is the soft spot".
 *
 * The four steps are the app's own semantic tokens, so the words in the key are the words the
 * colours already mean elsewhere on the site.
 * ---------------------------------------------------------------------- */

export const SHOTS_RAMP = [
    { max: 2, color: '#4ADE80', label: 'drops them' },
    { max: 4, color: '#FFB020', label: 'workable' },
    { max: 7, color: '#5B8CA8', label: 'slow' },
    { max: Infinity, color: '#33414D', label: "don't" },
] as const;

export function shotsColor(shots: number): string {
    for (const step of SHOTS_RAMP) if (shots <= step.max) return step.color;
    return SHOTS_RAMP[SHOTS_RAMP.length - 1].color;
}

/** `∞` for a round that cannot do it, which is a real answer and reads better than a blank. */
export function formatShots(shots: number): string {
    return Number.isFinite(shots) ? String(shots) : '∞';
}

export function formatSeconds(seconds: number): string {
    return Number.isFinite(seconds) ? `${seconds.toFixed(2)}s` : '∞';
}
