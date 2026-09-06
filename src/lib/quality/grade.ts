/**
 * How good is this figure? — asked once, for the whole app.
 *
 * Three surfaces were answering it three different ways. The gunsmith ranked a stat against the
 * guns it competes with and drew a four-segment bar. The combat simulator ranked shots-to-kill
 * against authored thresholds and drew a swatch and a legend. The item detail pages did not answer
 * it at all, printing bare figures and leaving the reader to know from elsewhere whether 46 damage
 * is a lot. A reader who learned the gunsmith's bar learned nothing that helped them anywhere else.
 *
 * This is the vocabulary all three now share: **four grades, worst to best**, and one meter that
 * draws them. What differs between surfaces is only how a value earns its grade — a percentile
 * against a peer set, or a threshold somebody authored — and that difference is the two functions
 * below.
 *
 * ## Why four
 *
 * Quartiles are what the gunsmith's peer sets support and what a reader can hold: bottom quarter,
 * lower half, upper half, top quarter. More rungs would imply a precision the peer sets do not
 * have, and would cost the one rendering every surface shares.
 *
 * ## Colour never travels alone
 *
 * The same rule `armorClassScale` binds the protection surfaces to. The palette runs ember → warn →
 * info → good, which does not clear colourblind separation between non-adjacent rungs, so the
 * *count of lit segments* is the identity channel and the hue only the fast one. `GradeMeter` will
 * not render without a figure beside it, and no caller may draw a grade as colour alone.
 */

export const GRADE_TIERS = ['bottom', 'lower', 'upper', 'top'] as const;
export type GradeTier = typeof GRADE_TIERS[number];

/**
 * Ember for the worst rung, then warn, info, good — the Cold Steel semantic ramp, and the palette
 * the gunsmith's bands have used since they shipped.
 *
 * One surface deviates on the worst rung and says so: the combat simulator paints a body capsule in
 * these tones, and ember is already the selection colour on that canvas. Its own ramp is declared
 * in `combat-sim/utils/scenario.ts` with that reason attached — the tiers and the meter are shared,
 * a single hue is not.
 */
export const GRADE_COLORS: Record<GradeTier, string> = {
    bottom: '#FF4A24',
    lower: '#FFB020',
    upper: '#5B8CA8',
    top: '#4ADE80',
};

/** The empty half of a meter: lit segments are the reading, unlit ones are the scale. */
export const GRADE_TRACK_COLOR = '#28323B';

export interface Grade {
    tier: GradeTier;
    /** 0-3, matching `GRADE_TIERS` — the number of segments to light, so more is always better. */
    index: number;
    /** What this rung is called on this surface. A peer ranking and a threshold read differently. */
    label: string;
    color: string;
}

/** A grade from a rung index, for a caller that has already decided which rung a value sits on. */
export function gradeAt(index: number, label: string): Grade {
    const clamped = Math.min(GRADE_TIERS.length - 1, Math.max(0, Math.round(index)));
    const tier = GRADE_TIERS[clamped];
    return { tier, index: clamped, label, color: GRADE_COLORS[tier] };
}

/** The four labels a percentile ranking uses, worst rung first. */
export const PERCENTILE_LABELS: Record<GradeTier, string> = {
    bottom: 'Bottom 25%',
    lower: 'Lower half',
    upper: 'Upper half',
    top: 'Top 25%',
};

/**
 * Where a value sits among its peers, 0-1, as a grade.
 *
 * The caller computes the percentile, because only the caller knows what the peer set is and which
 * direction is better — an ergonomics figure and a recoil figure rank in opposite directions off
 * the same arithmetic.
 */
export function gradeFromPercentile(
    percentile: number,
    labels: Record<GradeTier, string> = PERCENTILE_LABELS,
): Grade {
    const index = percentile >= 0.75 ? 3 : percentile >= 0.5 ? 2 : percentile >= 0.25 ? 1 : 0;
    return gradeAt(index, labels[GRADE_TIERS[index]]);
}

/**
 * One rung of an authored scale. `max` is inclusive, and stops are given **best first** — the order
 * a legend is read in.
 */
export interface GradeStop {
    max: number;
    label: string;
    /** Overrides the shared hue for this rung. Used once, and the reason travels with the caller. */
    color?: string;
}

/**
 * A grade from thresholds somebody authored, for a scale where **less is better**.
 *
 * Shots-to-kill is the case: nobody can rank it against a peer set, because the peer set would be
 * every other loadout the reader has not assembled. The stops are a judgement, and they are written
 * down where a reader of the route can see them rather than buried here.
 */
export function gradeFromStops(value: number, stops: readonly GradeStop[]): Grade {
    const position = stops.findIndex((stop) => value <= stop.max);
    const found = position === -1 ? stops.length - 1 : position;
    // Stops run best first; grade indices run best last, so more lit segments is always better.
    const grade = gradeAt(stops.length - 1 - found, stops[found].label);
    const override = stops[found].color;
    return override ? { ...grade, color: override } : grade;
}
