import {Item, getWeaponFamilyLabel} from '@/types/items';
import {isWeapon} from '@/app/combat-sim/utils/types';
import {baseValue} from '@/lib/trade';

/**
 * One weapon family within one caliber - "AR15, 5.56x45mm, 17 variants".
 *
 * A family is keyed with its caliber rather than on its own, because four families ship presets in
 * two calibers (AUG, Malyuk, SCAR-LH, Vector). Grouping on family alone would put a 9x19mm AUG
 * under the 5.56x45mm shelf; grouping on the pair lets the family appear under each caliber it
 * actually has presets for, showing only those.
 */
export interface WeaponFamily {
    key: string;
    family: string;
    label: string;
    caliber: string;
    items: Item[];
    /** Distinct receivers in the group - same receiver means an identical simulation model. */
    receiverCount: number;
}

/**
 * Split a filtered item list into family groups and loose items.
 *
 * A group of one is not a group: 16 of the 47 (family, caliber) pairs have a single preset, and so
 * do the wiki-only weapons that carry no family at all. Those render as plain cards.
 */
export function groupWeaponsByFamily(items: Item[]): { groups: WeaponFamily[]; singles: Item[] } {
    const byKey = new Map<string, Item[]>();
    const singles: Item[] = [];

    for (const item of items) {
        if (!isWeapon(item) || !item.family) {
            singles.push(item);
            continue;
        }
        const key = `${item.family}|${item.subcategory}`;
        const bucket = byKey.get(key);
        if (bucket) bucket.push(item);
        else byKey.set(key, [item]);
    }

    const groups: WeaponFamily[] = [];
    for (const [key, groupItems] of byKey) {
        if (groupItems.length < 2) {
            singles.push(...groupItems);
            continue;
        }
        const first = groupItems[0];
        const family = isWeapon(first) && first.family ? first.family : '';
        const receivers = new Set(
            groupItems.map(item => (isWeapon(item) ? item.receiverId : undefined)).filter(Boolean)
        );
        groups.push({
            key,
            family,
            label: getWeaponFamilyLabel(family),
            caliber: first.subcategory,
            items: [...groupItems].sort((a, b) => a.name.localeCompare(b.name)),
            receiverCount: receivers.size,
        });
    }

    groups.sort((a, b) => a.label.localeCompare(b.label) || a.caliber.localeCompare(b.caliber));
    singles.sort((a, b) => a.name.localeCompare(b.name));
    return {groups, singles};
}

/** The variant a collapsed row shows: the cheapest one, which is the plainest build of the family. */
export function representativeVariant(items: Item[]): Item {
    return items.reduce((cheapest, item) => {
        const value = baseValue(item.stats) || Infinity;
        const best = baseValue(cheapest.stats) || Infinity;
        return value < best ? item : cheapest;
    });
}
