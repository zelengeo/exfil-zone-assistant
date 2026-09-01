import type { ProtectiveZone } from '@/types/items';
import { BODY_PART } from './bodyModel';

/**
 * Head gear names its zones rather than its bones — `head_top`, `head_eyes`, `head_chin` are the
 * three parts of the head the game splits helmets and face shields across, and none of them is a
 * bone in the skeleton. `BODY_PART` is the decompiled map and must not gain invented entries, so
 * the translation lives here.
 */
const HEAD_ZONES: Record<string, string> = {
    head_top: 'Head',
    head_eyes: 'Head',
    head_chin: 'Head',
};

/**
 * Coverage, reduced to something a card can draw.
 *
 * A card cannot run the real test: it would mean a projection loop per card, forty times a screen,
 * for a picture five millimetres tall. So the strip is derived from the zone list alone — which
 * body parts the gear names at all, and at what class — and the honest picture stays on the detail
 * page where there is room for it.
 */

/** The seven pips, left to right, laid out to read as a body. */
export const PIP_PARTS = [
    'Head', 'UpperChest', 'LowerChest', 'LeftArm', 'RightArm', 'LeftLeg', 'RightLeg',
] as const;

export type PipPart = typeof PIP_PARTS[number];

export const PIP_LABELS: Record<PipPart, string> = {
    Head: 'Head',
    UpperChest: 'Upper chest',
    LowerChest: 'Lower chest',
    LeftArm: 'Left arm',
    RightArm: 'Right arm',
    LeftLeg: 'Left leg',
    RightLeg: 'Right leg',
};

export interface Pip {
    part: PipPart;
    label: string;
    /** Armour class covering this part, 0 where nothing does. */
    armorClass: number;
    /**
     * True when the covering zone is a partial wedge rather than the whole bone.
     *
     * `protectionAngle` of 90 can never fail the test, so anything below it covers only part of the
     * way round — which the strip shows as a half-height pip rather than claiming full cover.
     */
    partial: boolean;
}

/**
 * The strip for one piece of gear.
 *
 * Always seven pips: an absent part is a pip at class 0, because "this vest does not cover your
 * legs" is exactly as informative as which parts it does cover, and a variable-length strip would
 * not line up down a column of cards.
 */
export function coveragePips(protectiveData: ProtectiveZone[] | undefined): Pip[] {
    const best = new Map<string, { armorClass: number; angle: number }>();

    for (const zone of protectiveData ?? []) {
        const key = zone.bodyPart.toLowerCase();
        const part = BODY_PART[key] ?? HEAD_ZONES[key];
        if (!part) continue;
        const existing = best.get(part);
        if (!existing || zone.armorClass > existing.armorClass) {
            best.set(part, { armorClass: zone.armorClass, angle: zone.protectionAngle });
        }
    }

    return PIP_PARTS.map((part): Pip => {
        const hit = best.get(part);
        return {
            part,
            label: PIP_LABELS[part],
            armorClass: hit?.armorClass ?? 0,
            partial: hit ? hit.angle < 90 : false,
        };
    });
}

/** Whether a strip is worth drawing at all. */
export function hasAnyCoverage(pips: Pip[]): boolean {
    return pips.some((pip) => pip.armorClass > 0);
}
