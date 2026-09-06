/**
 * Ranking an item's figures against the items it actually competes with.
 *
 * The detail pages printed bare numbers. 46 damage, 5.5 penetration, 195 durability — every one of
 * them true, and none of them an answer, because the reader has to already know the catalogue for
 * a number to mean anything. That is exactly the question the gunsmith solved for weapon stats, and
 * this applies the same rule everywhere else: a figure is ranked against its peers, and the rank is
 * drawn with the app's one grade meter.
 *
 * The peer set is the whole design. A round is ranked against its own calibre, never against all
 * ammunition — a 9x19 that outranks a .338 LM on paper would be a fiction, because nobody chooses
 * between them. Armour is ranked within its shelf for the same reason: a helmet and a chest plate
 * do not compete.
 *
 * Nothing here is authored. Every ranking is the shipped catalogue counting itself.
 */

import type { Ammunition, Armor, Item } from '@/types/items';
import { gradeFromPercentile, type Grade } from './grade';

/**
 * Fewer peers than this and a quartile is noise, so nothing is graded at all.
 *
 * Six, the same figure `lib/gunsmith/bands.ts` has always used — the threshold is a property of
 * quartiles, not of guns. It leaves three calibres unranked (.338 LM and 6.8x51 ship four rounds
 * each, 12.7x55 three), and saying "only four in .338 LM" is the honest answer there.
 */
export const MIN_PEERS = 6;

export interface Ranking {
    /** Null when the peer set is too small to divide into quarters. */
    grade: Grade | null;
    /** What it was ranked against, for the meter's note and for a reader who asks. */
    peers: number;
    peerLabel: string;
}

/**
 * Where `value` sits among `peerValues`, as a grade.
 *
 * Ties count as half, the way `bandFor` counts them: three rounds sharing the top damage figure
 * should all read as the top quartile rather than one of them winning on catalogue order.
 */
export function rankAmong(
    value: number | null | undefined,
    peerValues: number[],
    direction: 1 | -1,
    peerLabel: string,
): Ranking {
    if (typeof value !== 'number' || !Number.isFinite(value) || peerValues.length < MIN_PEERS) {
        return { grade: null, peers: peerValues.length, peerLabel };
    }
    let beaten = 0;
    let ties = 0;
    for (const peer of peerValues) {
        if (peer === value) ties += 1;
        else if (direction < 0 ? peer > value : peer < value) beaten += 1;
    }
    const percentile = (beaten + ties / 2) / peerValues.length;
    return { grade: gradeFromPercentile(percentile), peers: peerValues.length, peerLabel };
}

/** What the meter says when there were not enough peers to rank against. */
export function rankingNote(ranking: Ranking): string {
    return ranking.peers === 0
        ? 'Not ranked'
        : `Only ${ranking.peers} in ${ranking.peerLabel}`;
}

const isAmmo = (item: Item): item is Ammunition => item.category === 'ammo';

/** Every round of the same calibre, including this one — a round is one of its own peers. */
export function ammoPeers(item: Ammunition, catalogue: Item[]): Ammunition[] {
    return catalogue.filter(
        (other): other is Ammunition => isAmmo(other) && other.stats.caliber === item.stats.caliber,
    );
}

/**
 * Every piece on the same shelf.
 *
 * `subcategory` rather than `category`: gear holds vests, helmets, face shields, eye protection,
 * backpacks and holsters, and only the first four rate a class at all. Goggles are kept apart from
 * face shields because the wiki keeps them apart — see the `FaceShield` docblock.
 */
export function armorPeers(item: Armor, catalogue: Item[]): Armor[] {
    return catalogue.filter(
        (other): other is Armor => other.category === item.category
            && other.subcategory === item.subcategory
            && typeof (other as Armor).stats?.armorClass === 'number',
    );
}

/** The three figures on an ammunition page that can be ranked. More is better on all three. */
export function ammoRankings(item: Ammunition, catalogue: Item[]) {
    const peers = ammoPeers(item, catalogue);
    const label = item.stats.caliber;
    return {
        damage: rankAmong(item.stats.damage, peers.map((p) => p.stats.damage), 1, label),
        penetration: rankAmong(
            item.stats.penetration,
            peers.map((p) => p.stats.penetration),
            1,
            label,
        ),
        muzzleVelocity: rankAmong(
            item.stats.muzzleVelocity,
            peers.map((p) => p.stats.muzzleVelocity),
            1,
            label,
        ),
    };
}

/**
 * The two figures on an armour page that can be ranked.
 *
 * Class and durability, and deliberately not blunt damage or the curve readings: those describe how
 * a piece fails rather than how good it is, and a "top quartile blunt scalar" would be ranking a
 * mechanism rather than a choice. The headline class is used even where the plates disagree, since
 * that is the figure the shelf is sorted by.
 */
export function armorRankings(item: Armor, catalogue: Item[]) {
    const peers = armorPeers(item, catalogue);
    const label = item.subcategory.toLowerCase();
    return {
        armorClass: rankAmong(
            item.stats.armorClass,
            peers.map((p) => p.stats.armorClass),
            1,
            label,
        ),
        maxDurability: rankAmong(
            item.stats.maxDurability,
            peers
                .map((p) => p.stats.maxDurability)
                .filter((value): value is number => typeof value === 'number'),
            1,
            label,
        ),
    };
}
