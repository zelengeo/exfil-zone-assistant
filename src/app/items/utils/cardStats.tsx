import React from 'react';
import { Cross, Crosshair, Info, ShieldIcon, Zap } from 'lucide-react';
import { FIRE_MODE_CONFIG, Item } from '@/types/items';
import {
    isAmmunition,
    isArmor,
    isAttachment,
    isBandage,
    isCompensator,
    isGrenade,
    isGrip,
    isLimbRestore,
    isMagazine,
    isMedicine,
    isPainkiller,
    isRail,
    isSight,
    isStim,
    isSuppressor,
    isSyringe,
    isTactical,
    isWeapon,
} from '@/app/combat-sim/utils/types';

/**
 * What the list shows about an item, in either density.
 *
 * Which three stats matter is a per-category judgement, and it lives here rather than in a
 * component so the grid card and the table row cannot drift apart. Both call `categoryStats`; the
 * only difference between the two densities is the layout around the answer.
 */

/** A stat as the card shows it: a label and an already-formatted value. */
export interface CardStat {
    label: string;
    value: string;
}

const pct = (scalar: number): string => `${(scalar * 100).toFixed(0)}%`;

/**
 * The three numbers that matter for this item's kind.
 *
 * Which three is a per-category judgement and stays exactly as it was; what changed is that they
 * come back as data instead of as markup, so every card lays them out the same way.
 */
export function categoryStats(item: Item): CardStat[] {
    switch (item.category) {
        case 'weapons': {
            if (!isWeapon(item)) break;
            const stats: CardStat[] = [
                { label: 'Fire rate', value: item.stats.fireRate ? `${item.stats.fireRate} RPM` : 'N/A' },
            ];
            if (item.stats.ergonomics) stats.push({ label: 'Ergonomics', value: `${item.stats.ergonomics}` });
            if (item.stats.MOA) stats.push({ label: 'Accuracy', value: `${item.stats.MOA.toFixed(1)} MOA` });
            return stats;
        }

        case 'ammo': {
            if (!isAmmunition(item)) break;
            const stats: CardStat[] = [
                { label: 'Damage', value: `${item.stats.damage || 'N/A'}` },
                { label: 'Penetration', value: `${item.stats.penetration || 'N/A'}` },
            ];
            if (item.stats.muzzleVelocity) {
                stats.push({ label: 'Velocity', value: `${Math.round(item.stats.muzzleVelocity / 100)} m/s` });
            }
            return stats;
        }

        case 'attachments': {
            if (!isAttachment(item)) break;
            const ergo = (): string => `${item.stats.attachmentModifier?.ergonomicsModifier || 0}`;
            if (isMagazine(item)) {
                return [
                    { label: 'Caliber', value: `${item.stats.caliber}` },
                    { label: 'Capacity', value: `${item.stats.capacity}` },
                ];
            }
            if (isSight(item)) {
                return [
                    { label: 'Magnification', value: `${item.stats.magnification}` },
                    { label: 'Ergonomics', value: ergo() },
                ];
            }
            if (isTactical(item)) {
                return [
                    { label: 'Range', value: `${item.stats.traceDistance / 100} m` },
                    { label: 'Ergonomics', value: ergo() },
                ];
            }
            if (isSuppressor(item) || isCompensator(item) || isGrip(item)) {
                return [
                    { label: 'Vertical recoil', value: `${item.stats.attachmentModifier?.verticalRecoilModifier || 0}` },
                    { label: 'Horizontal recoil', value: `${item.stats.attachmentModifier?.horizontalRecoilModifier || 0}` },
                ];
            }
            if (isRail(item)) return [{ label: 'Ergonomics', value: ergo() }];
            break;
        }

        case 'grenades': {
            if (!isGrenade(item)) break;
            const stats: CardStat[] = [];
            if (item.stats.fuseTime !== null) {
                stats.push({
                    label: 'Fuse time',
                    value: item.stats.fuseTime === 0 ? 'Impact' : `${item.stats.fuseTime}s`,
                });
            }
            stats.push({ label: 'Effective radius', value: `${item.stats.radius} m` });
            return stats;
        }

        case 'gear': {
            if (!isArmor(item)) break;
            const stats: CardStat[] = [];
            if (item.stats.armorClass) stats.push({ label: 'Armor class', value: `Class ${item.stats.armorClass}` });
            if (item.stats.maxDurability) stats.push({ label: 'Durability', value: `${item.stats.maxDurability}` });
            if (item.stats.bluntDamageScalar) {
                stats.push({ label: 'Blunt damage', value: pct(item.stats.bluntDamageScalar) });
            }
            return stats;
        }

        case 'medicine': {
            if (!isMedicine(item)) break;
            if (isBandage(item)) return [{ label: 'Type', value: 'Bleeding control' }];
            if (isLimbRestore(item)) return [{ label: 'Max HP penalty', value: pct(item.stats.hpPercentage) }];
            if (isPainkiller(item)) {
                return [
                    { label: 'Duration', value: `${item.stats.effectTime}s` },
                    { label: 'Uses', value: `${item.stats.usesCount}` },
                ];
            }
            if (isSyringe(item)) {
                return [
                    { label: 'Healing', value: `${item.stats.capacity} HP` },
                    { label: 'Speed', value: `${item.stats.cureSpeed} HP/s` },
                ];
            }
            if (isStim(item)) {
                return [
                    { label: 'Duration', value: `${item.stats.effectTime}s` },
                    { label: 'Use time', value: `${item.stats.useTime}s` },
                ];
            }
            break;
        }
    }

    return [{ label: 'Weight', value: `${(item.stats.weight ?? 0).toFixed(2)} kg` }];
}

/** The card's one glyph: the single thing worth knowing before opening the item. */
export interface PerformanceIndicator {
    icon: React.ReactNode;
    label: string;
    color: string;
}

//TODO rework - probably handmade values are needed here
export function getPerformanceIndicator(item: Item): PerformanceIndicator | null {
    switch (item.category) {
        case 'weapons': {
            if (!isWeapon(item)) break;

            if (item.stats.fireMode !== 'fullAuto') {
                return { icon: <Info size={13} />, label: FIRE_MODE_CONFIG[item.stats.fireMode], color: 'text-warn' };
            }
            if (item.stats.MOA && item.stats.MOA > 5) {
                return { icon: <Crosshair size={13} />, label: 'Low accuracy', color: 'text-ember' };
            }

            // Base performance on recoil control - lower recoil = better control
            const vertical = item.stats.recoilParameters?.verticalRecoilControl;
            const horizontal = item.stats.recoilParameters?.horizontalRecoilControl;
            if (vertical && horizontal && (vertical + horizontal) / 2 < 0.25) {
                return { icon: <Crosshair size={13} />, label: 'Low recoil', color: 'text-good' };
            }
            if (item.stats.fireRate > 840) {
                return { icon: <Zap size={13} />, label: 'High fire rate', color: 'text-good' };
            }
            break;
        }

        case 'ammo': {
            if (!isAmmunition(item)) break;
            if ((item.stats.penetration || 0) >= 6) {
                return { icon: <Zap size={13} />, label: 'Pen everything', color: 'text-good' };
            }
            break;
        }

        case 'grenades': {
            if (!isGrenade(item)) break;
            if (item.stats.fuseTime === 0) {
                return { icon: <Zap size={13} />, label: 'Impact', color: 'text-ember' };
            }
            if (item.subcategory === 'Utility') {
                return { icon: <Info size={13} />, label: 'Non-lethal', color: 'text-info' };
            }
            break;
        }

        case 'gear': {
            if (!isArmor(item)) break;
            const armorClass = item.stats.armorClass || 0;
            if (armorClass >= 6) return { icon: <ShieldIcon size={13} />, label: 'Good', color: 'text-good' };
            if (armorClass >= 4) return { icon: <ShieldIcon size={13} />, label: 'Viable', color: 'text-warn' };
            if (armorClass >= 0) return { icon: <ShieldIcon size={13} />, label: 'Poor', color: 'text-ink-600' };
            break;
        }

        case 'medicine': {
            if (!isMedicine(item)) break;
            if (isBandage(item) && item.stats.canHealDeepWound) {
                return { icon: <Cross size={13} />, label: 'Deep wound', color: 'text-good' };
            }
            break;
        }
    }

    return null;
}

