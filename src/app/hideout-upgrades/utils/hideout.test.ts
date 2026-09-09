/**
 * The hideout rules, exercised against the real 70 upgrades rather than fixtures.
 *
 * The data is the point, the same as it is for the chain suite: these rules had no tests while
 * they lived inline in `HideoutOverview.tsx`, and the shapes that would break them — an area that
 * is also a room, a level whose condition names an area that does not exist, a season adding a
 * room — are shapes only the real database has.
 */
import { describe, expect, it } from 'vitest';
import {
    AREAS,
    MAIN_FLOOR,
    ROOM_IDS,
    TOTAL_UPGRADES,
    UPGRADES,
    type Built,
    type UpgradeId,
    areaLevelsOf,
    BAND_ORDER,
    bandOf,
    bandScaleOf,
    canBuild,
    canUndo,
    gatesOf,
    isRoomPin,
    isUpgradeId,
    levelsOfArea,
    maxLevelOf,
    formatPerkValue,
    perkRowsOf,
    questName,
    rankMaterials,
    remaining,
    roomSummaries,
    upgradeId,
    wantedBy,
    zonesInRoom,
    zonesOf,
} from './hideout';

const ids = Object.keys(UPGRADES) as UpgradeId[];
const NOTHING: Built = new Set<UpgradeId>();
const EVERYTHING: Built = new Set(ids);

/** Build the whole hideout the only way the UI allows: one legal step at a time. */
function buildEverythingInOrder(): { built: Set<UpgradeId>; order: UpgradeId[] } {
    const built = new Set<UpgradeId>();
    const order: UpgradeId[] = [];

    for (let pass = 0; pass < ids.length + 1 && built.size < ids.length; pass += 1) {
        const levels = areaLevelsOf(built);
        let progressed = false;
        for (const id of ids) {
            if (built.has(id)) continue;
            const { areaId, level } = UPGRADES[id];
            if (level === (levels[areaId] ?? 0) + 1 && canBuild(areaId, level, levels)) {
                built.add(id);
                order.push(id);
                progressed = true;
                break;
            }
        }
        if (!progressed) break;
    }

    return { built, order };
}

describe('the database', () => {
    it('carries every upgrade under an id the rules can rebuild', () => {
        expect(ids).toHaveLength(TOTAL_UPGRADES);
        for (const id of ids) {
            const { areaId, level } = UPGRADES[id];
            expect(upgradeId(areaId, level)).toBe(id);
        }
    });

    it('runs each area from level 1 with no gaps', () => {
        for (const areaId of AREAS) {
            const levels = levelsOfArea[areaId].map((upgrade) => upgrade.level);
            expect(levels).toEqual(Array.from({ length: maxLevelOf(areaId) }, (_, i) => i + 1));
        }
    });

    it('conditions name a real area, or the player', () => {
        for (const id of ids) {
            for (const areaId of Object.keys(UPGRADES[id].levelConditions)) {
                if (areaId === 'Player') continue;
                expect(AREAS).toContain(areaId);
            }
        }
    });
});

describe('upgradeId is total', () => {
    it('answers null rather than throwing for a level that does not exist', () => {
        expect(upgradeId('CryptoMining', 0)).toBeNull();
        expect(upgradeId('CryptoMining', maxLevelOf('CryptoMining') + 1)).toBeNull();
        expect(upgradeId('NoSuchArea', 1)).toBeNull();
        expect(isUpgradeId('NoSuchAreaLv1')).toBe(false);
    });

    it('walks a whole area with the pane chevrons and never throws', () => {
        for (const areaId of AREAS) {
            for (let level = 0; level <= maxLevelOf(areaId) + 1; level += 1) {
                expect(() => upgradeId(areaId, level)).not.toThrow();
            }
        }
    });
});

describe('canBuild', () => {
    const levels = areaLevelsOf(NOTHING);

    it('opens the areas that depend on nothing, and only those', () => {
        const open = AREAS.filter((areaId) => canBuild(areaId, null, levels));
        for (const areaId of open) {
            expect(UPGRADES[upgradeId(areaId, 1)!].levelConditions).toEqual({});
        }
        expect(open.length).toBeGreaterThan(0);
    });

    it('refuses a level more than one step ahead', () => {
        // The pane's chevrons reach Lv3 of an area standing at 0; building from there would skip
        // Lv2's price and materials entirely.
        expect(canBuild('CryptoMining', 1, levels)).toBe(true);
        expect(canBuild('CryptoMining', 2, levels)).toBe(false);
        expect(canBuild('CryptoMining', 3, levels)).toBe(false);
    });

    it('refuses a level that does not exist', () => {
        expect(canBuild('ShootingRange', 2, levels)).toBe(false);
        expect(canBuild('NoSuchArea', 1, levels)).toBe(false);
    });

    it('holds an area shut until every condition is met', () => {
        // Storage Room D wants the workshop *and* Storage Room C — one is not enough.
        const workshopOnly = areaLevelsOf(new Set<UpgradeId>(['WorkshopZoneLv1']));
        expect(canBuild('StorageZoneLock4', 1, workshopOnly)).toBe(false);

        const both = areaLevelsOf(new Set<UpgradeId>(['WorkshopZoneLv1', 'StorageZoneLock3Lv1']));
        expect(canBuild('StorageZoneLock4', 1, both)).toBe(true);
    });

    it('treats the player level as met, so no upgrade is stranded behind it', () => {
        const gated = ids.filter((id) => 'Player' in UPGRADES[id].levelConditions);
        expect(gated.length).toBeGreaterThan(0);
        for (const id of gated) {
            const { levelConditions } = UPGRADES[id];
            expect(areaLevelsOf(NOTHING).Player).toBeGreaterThanOrEqual(levelConditions.Player);
        }
    });
});

describe('the whole hideout is reachable one legal step at a time', () => {
    const { built, order } = buildEverythingInOrder();

    it('leaves nothing stranded', () => {
        const stranded = ids.filter((id) => !built.has(id));
        expect(stranded).toEqual([]);
        expect(order).toHaveLength(TOTAL_UPGRADES);
    });

    it('never records a level before the one below it', () => {
        const seen = new Set<UpgradeId>();
        for (const id of order) {
            const { areaId, level } = UPGRADES[id];
            if (level > 1) expect(seen.has(upgradeId(areaId, level - 1)!)).toBe(true);
            seen.add(id);
        }
    });
});

describe('canUndo', () => {
    it('allows taking back the last thing built', () => {
        const built = new Set<UpgradeId>(['WorkshopZoneLv1']);
        expect(canUndo('WorkshopZone', 1, built)).toBe(true);
    });

    it('refuses while another area stands on it', () => {
        const built = new Set<UpgradeId>(['WorkshopZoneLv1', 'GunsmithLv1']);
        expect(canUndo('WorkshopZone', 1, built)).toBe(false);
        expect(canUndo('Gunsmith', 1, built)).toBe(true);
    });

    it('refuses while a higher level of the same area stands on it', () => {
        // Reachable in two clicks of the pane's chevrons. Undoing Lv1 here used to leave the area
        // reading level 2 with Lv1's materials back in the remaining list.
        const built = new Set<UpgradeId>(['CryptoMiningLv1', 'CryptoMiningLv2']);
        expect(canUndo('CryptoMining', 1, built)).toBe(false);
        expect(canUndo('CryptoMining', 2, built)).toBe(true);
    });

    it('unwinds a fully built hideout completely, in some order', () => {
        const built = new Set<UpgradeId>(EVERYTHING);
        let removed = 0;

        for (let pass = 0; pass < ids.length + 1 && built.size > 0; pass += 1) {
            let progressed = false;
            for (const id of [...built]) {
                const { areaId, level } = UPGRADES[id];
                if (canUndo(areaId, level, built)) {
                    built.delete(id);
                    removed += 1;
                    progressed = true;
                    break;
                }
            }
            if (!progressed) break;
        }

        expect(built.size).toBe(0);
        expect(removed).toBe(TOTAL_UPGRADES);
    });
});

describe('rooms', () => {
    it('places every upgrade in exactly one room', () => {
        const counted = roomSummaries(NOTHING).reduce((sum, room) => sum + room.total, 0);
        expect(counted).toBe(TOTAL_UPGRADES);
    });

    it('opens on the main floor, which reaches every other room', () => {
        expect(ROOM_IDS[0]).toBe(MAIN_FLOOR);
        for (const roomId of ROOM_IDS.slice(1)) {
            expect(zonesInRoom[MAIN_FLOOR]).toContain(roomId);
        }
    });

    it('gives every room a way back', () => {
        for (const roomId of ROOM_IDS.slice(1)) {
            expect(zonesInRoom[roomId]).toContain(MAIN_FLOOR);
        }
    });

    it('gives every area a pin on its own room, and nowhere else', () => {
        for (const areaId of AREAS) {
            const rooms = ROOM_IDS.filter((roomId) => zonesInRoom[roomId].includes(areaId));
            const owner = UPGRADES[upgradeId(areaId, 1)!].categoryId;
            // A room that is also an area appears twice: as a doorway on the main floor, and as
            // itself on its own screen.
            expect(rooms).toContain(owner);
            expect(rooms.every((roomId) => roomId === owner || roomId === MAIN_FLOOR)).toBe(true);
        }
    });

    it('keeps a room that is also an area upgradable on its own screen', () => {
        // Kitchen Area has four levels behind a pin that is also the doorway into the kitchen.
        const built = new Set<UpgradeId>(['WaterCollectorLv1', 'KitchenAreaLv1']);
        const levels = areaLevelsOf(built);

        expect(isRoomPin('KitchenArea', levels, MAIN_FLOOR)).toBe(true);
        expect(isRoomPin('KitchenArea', levels, 'KitchenArea')).toBe(false);

        const inKitchen = zonesOf('KitchenArea', levels, built);
        const kitchen = inKitchen.find((zone) => zone.areaId === 'KitchenArea');
        expect(kitchen?.state).not.toBe('room');
        expect(kitchen?.max).toBe(4);
    });

    it('shows a room that is not an area as a doorway at every level', () => {
        for (const roomId of ['Lounge', 'HQPAD']) {
            expect(levelsOfArea[roomId]).toBeUndefined();
            expect(isRoomPin(roomId, areaLevelsOf(EVERYTHING), MAIN_FLOOR)).toBe(true);
        }
    });
});

describe('zonesOf', () => {
    it('reads an untouched hideout as ready or locked, never built', () => {
        const zones = zonesOf(MAIN_FLOOR, areaLevelsOf(NOTHING), NOTHING);
        for (const zone of zones.filter((z) => z.state !== 'room')) {
            expect(zone.level).toBe(0);
            expect(['ready', 'locked']).toContain(zone.state);
        }
        expect(zones.some((zone) => zone.state === 'ready')).toBe(true);
    });

    it('reads a finished hideout as built, with the rooms still doorways', () => {
        const zones = zonesOf(MAIN_FLOOR, areaLevelsOf(EVERYTHING), EVERYTHING);
        for (const zone of zones) {
            expect(zone.state === 'room' || zone.state === 'built').toBe(true);
            if (zone.state === 'built') expect(zone.level).toBe(zone.max);
        }
    });

    it('marks the zones whose next level wants a task', () => {
        const zones = zonesOf(MAIN_FLOOR, areaLevelsOf(NOTHING), NOTHING);
        const gated = zones.filter((zone) => zone.taskGated).map((zone) => zone.areaId);

        expect(gated).toContain('ShootingRange');
        expect(gated).toContain('CryptoMining');
        expect(gated).not.toContain('Gunsmith');
    });

    it('counts a room pin by its upgrades, not its levels', () => {
        const lounge = zonesOf(MAIN_FLOOR, areaLevelsOf(NOTHING), NOTHING)
            .find((zone) => zone.areaId === 'Lounge');
        expect(lounge?.state).toBe('room');
        expect(lounge?.max).toBe(9);
        expect(lounge?.builtCount).toBe(0);
    });
});

describe('gates', () => {
    it('reports an area condition as met or missing, and never reports Player', () => {
        const upgrade = UPGRADES.TVSetLv1;
        expect('Player' in upgrade.levelConditions).toBe(true);

        const gates = gatesOf(upgrade, areaLevelsOf(NOTHING), {});
        expect(gates.some((gate) => gate.kind === 'area' && gate.areaId === 'Player')).toBe(false);
        expect(gates.filter((gate) => gate.kind === 'area').every((gate) => !gate.met)).toBe(true);

        const met = gatesOf(upgrade, areaLevelsOf(EVERYTHING), {});
        expect(met.filter((gate) => gate.kind === 'area').every((gate) => gate.met)).toBe(true);
    });

    it('names a task from the server join, falls back to the curated prose, then to the id', () => {
        expect(questName({ 'task.mall.4': 'Homecoming' }, 'task.mall.4')).toBe('Homecoming');
        expect(questName({}, 'task.mall.4')).toBe('Homecoming');
        expect(questName({}, 'task.doc.c.04')).toBe('task.doc.c.04');
    });

    it('leaves the unpublished task gates showing their id rather than crashing', () => {
        const unnamed = ids
            .flatMap((id) => UPGRADES[id].relatedQuests)
            .filter((questId) => questName({}, questId) === questId);
        expect(unnamed.length).toBeGreaterThan(0);
        for (const questId of unnamed) expect(questName({}, questId)).toBe(questId);
    });
});

describe('remaining', () => {
    const noLevels = areaLevelsOf(NOTHING);

    it('asks for everything when nothing is built', () => {
        const all = remaining(NOTHING, noLevels);
        expect(all.upgrades).toBe(TOTAL_UPGRADES);
        expect(all.price).toBe(ids.reduce((sum, id) => sum + UPGRADES[id].price, 0));
        expect(all.units).toBeGreaterThan(0);
    });

    it('asks for nothing when everything is built', () => {
        const none = remaining(EVERYTHING, areaLevelsOf(EVERYTHING));
        expect(none).toMatchObject({ price: 0, upgrades: 0, units: 0 });
        expect(none.items).toEqual([]);
    });

    it('drops exactly one upgrade’s cost when one is built', () => {
        const built = new Set<UpgradeId>(['GunsmithLv1']);
        const all = remaining(NOTHING, noLevels);
        const one = remaining(built, areaLevelsOf(built));
        expect(one.upgrades).toBe(all.upgrades - 1);
        expect(one.price).toBe(all.price - UPGRADES.GunsmithLv1.price);
    });

    it('sorts by quantity, descending', () => {
        const { items } = remaining(NOTHING, noLevels);
        for (let i = 1; i < items.length; i += 1) {
            expect(items[i - 1].quantity).toBeGreaterThanOrEqual(items[i].quantity);
        }
    });

    it('ready-only keeps exactly the levels that could be built right now', () => {
        const all = remaining(NOTHING, noLevels);
        const ready = remaining(NOTHING, noLevels, true);

        expect(ready.upgrades).toBeLessThan(all.upgrades);
        expect(ready.price).toBeLessThan(all.price);
        expect(ready.units).toBeLessThanOrEqual(all.units);
        expect(ready.upgrades).toBe(
            ids.filter((id) => canBuild(UPGRADES[id].areaId, UPGRADES[id].level, noLevels)).length,
        );
    });

    it('ready-only empties out once the hideout is finished', () => {
        expect(remaining(EVERYTHING, areaLevelsOf(EVERYTHING), true).upgrades).toBe(0);
    });
});

describe('rankMaterials', () => {
    const items = [
        { itemId: 'bulky', quantity: 25 },
        { itemId: 'precious', quantity: 2 },
        { itemId: 'middling', quantity: 10 },
        { itemId: 'unpriced', quantity: 8 },
    ];
    // `precious` is worth the most each; `bulky` is worth the most in total; `unpriced` is the one
    // material the catalogue carries no price for.
    const prices: Record<string, number | null> = {
        bulky: 90_000, precious: 600_000, middling: 5_000, unpriced: null,
    };
    const valueOf = (itemId: string) => prices[itemId] ?? null;
    const order = (sort: Parameters<typeof rankMaterials>[1]) =>
        rankMaterials(items, sort, valueOf).map((material) => material.itemId);

    it('orders by quantity', () => {
        expect(order('quantity')).toEqual(['bulky', 'middling', 'unpriced', 'precious']);
    });

    it('orders by what one is worth', () => {
        expect(order('unitValue')).toEqual(['precious', 'bulky', 'middling', 'unpriced']);
    });

    it('orders by what the whole line is worth', () => {
        expect(order('totalValue')).toEqual(['bulky', 'precious', 'middling', 'unpriced']);
    });

    it('carries both numbers, and nulls rather than zero for the unpriced', () => {
        const ranked = rankMaterials(items, 'quantity', valueOf);
        const bulky = ranked.find((material) => material.itemId === 'bulky');
        expect(bulky).toMatchObject({ unitValue: 90_000, totalValue: 2_250_000 });

        const unpriced = ranked.find((material) => material.itemId === 'unpriced');
        expect(unpriced).toMatchObject({ unitValue: null, totalValue: null });
    });

    it('keeps an item priced at zero above one with no price at all', () => {
        const withZero = [{ itemId: 'free', quantity: 1 }, { itemId: 'unknown', quantity: 1 }];
        const ranked = rankMaterials(withZero, 'unitValue', (id) => (id === 'free' ? 0 : null));
        expect(ranked.map((material) => material.itemId)).toEqual(['free', 'unknown']);
    });

    it('is stable and total — same input, same order, nothing dropped', () => {
        for (const sort of ['quantity', 'unitValue', 'totalValue'] as const) {
            const once = order(sort);
            expect(order(sort)).toEqual(once);
            expect(once).toHaveLength(items.length);
            expect(new Set(once).size).toBe(items.length);
        }
    });

    it('does not mutate what it was given', () => {
        const source = [...items];
        rankMaterials(source, 'totalValue', valueOf);
        expect(source).toEqual(items);
    });

    it('ranks the real remaining list under every order', () => {
        const { items: real } = remaining(NOTHING, areaLevelsOf(NOTHING));
        for (const sort of ['quantity', 'unitValue', 'totalValue'] as const) {
            const ranked = rankMaterials(real, sort, () => null);
            expect(ranked).toHaveLength(real.length);
        }
    });
});

describe('bands follow whatever the list is ordered by', () => {
    const material = (quantity: number, unitValue: number | null) => ({
        itemId: 'x', quantity, unitValue, totalValue: unitValue === null ? null : unitValue * quantity,
    });

    it('splits quantity at 10 and 5', () => {
        expect(bandOf(material(10, 1), 'quantity')).toBe('high');
        expect(bandOf(material(9, 1), 'quantity')).toBe('mid');
        expect(bandOf(material(5, 1), 'quantity')).toBe('mid');
        expect(bandOf(material(4, 1), 'quantity')).toBe('low');
    });

    it('splits unit value at 100k and 25k', () => {
        expect(bandOf(material(1, 100_000), 'unitValue')).toBe('high');
        expect(bandOf(material(1, 99_999), 'unitValue')).toBe('mid');
        expect(bandOf(material(1, 25_000), 'unitValue')).toBe('mid');
        expect(bandOf(material(1, 24_999), 'unitValue')).toBe('low');
    });

    it('splits total value at 1M and 250k', () => {
        expect(bandOf(material(10, 100_000), 'totalValue')).toBe('high');
        expect(bandOf(material(10, 99_999), 'totalValue')).toBe('mid');
        expect(bandOf(material(10, 25_000), 'totalValue')).toBe('mid');
        expect(bandOf(material(10, 24_999), 'totalValue')).toBe('low');
    });

    it('puts a material with no price in the lowest band, never a value one', () => {
        for (const sort of ['unitValue', 'totalValue'] as const) {
            expect(bandOf(material(30, null), sort)).toBe('low');
        }
        // Its quantity still bands normally when quantity is what is being measured.
        expect(bandOf(material(30, null), 'quantity')).toBe('high');
    });

    it('bands every material exactly once, under every order', () => {
        const { items } = remaining(NOTHING, areaLevelsOf(NOTHING));
        for (const sort of ['quantity', 'unitValue', 'totalValue'] as const) {
            const ranked = rankMaterials(items, sort, (id) => id.length * 1000);
            const counts = { high: 0, mid: 0, low: 0 };
            for (const entry of ranked) counts[bandOf(entry, sort)] += 1;
            expect(counts.high + counts.mid + counts.low).toBe(items.length);
        }
    });

    it('names its axis and all three bands, for every order', () => {
        for (const sort of ['quantity', 'unitValue', 'totalValue'] as const) {
            const scale = bandScaleOf(sort);
            expect(scale.measure).toBeTruthy();
            for (const band of BAND_ORDER) expect(scale.labels[band]).toBeTruthy();
        }
    });
});

describe('wantedBy', () => {
    const { items } = remaining(NOTHING, areaLevelsOf(NOTHING));
    const busiest = items[0].itemId;

    it('accounts for every unit the remaining list claims', () => {
        const wanted = wantedBy(busiest, NOTHING, areaLevelsOf(NOTHING));
        const total = wanted.reduce((sum, row) => sum + row.quantity, 0);
        expect(total).toBe(items[0].quantity);
    });

    it('drops an upgrade once it is built', () => {
        const before = wantedBy(busiest, NOTHING, areaLevelsOf(NOTHING));
        const built = new Set<UpgradeId>([before[0].id]);
        const after = wantedBy(busiest, built, areaLevelsOf(built));
        expect(after.map((row) => row.id)).not.toContain(before[0].id);
        expect(after).toHaveLength(before.length - 1);
    });

    it('says nothing is missing once everything else is built', () => {
        const wanted = wantedBy(busiest, NOTHING, areaLevelsOf(EVERYTHING));
        expect(wanted.every((row) => row.missing.length === 0)).toBe(true);
    });

    it('names the room each row sits in', () => {
        for (const row of wantedBy(busiest, NOTHING, areaLevelsOf(NOTHING))) {
            expect(row.room).toBeTruthy();
        }
    });
});

describe('perks', () => {
    it('reads one for every upgrade, and none for the levels that only open a door', () => {
        for (const id of ids) expect(Array.isArray(UPGRADES[id].perks)).toBe(true);

        // The 16 access-only levels — a storage room, the generator zone — grant no stat.
        expect(perkRowsOf(UPGRADES.StorageZoneLock1Lv1)).toEqual([]);
        expect(perkRowsOf(UPGRADES.CryptoMiningLv1)).toEqual([]);
    });

    it('takes the float noise off an applied value without moving it', () => {
        // The table stores 32-bit floats, so a flat +2% arrives long.
        expect(formatPerkValue(0.019999999552965164)).toBe('0.02');
        expect(formatPerkValue(0.949999988079071)).toBe('0.95');
        expect(formatPerkValue(1.2000000476837158)).toBe('1.2');
        expect(formatPerkValue(30)).toBe('30');
    });

    it('says nothing rather than zero where the table sets no value', () => {
        expect(formatPerkValue(null)).toBeNull();
        expect(perkRowsOf(UPGRADES.BlackmarketMoreitemLv1)[0].value).toBeNull();
    });

    it('prints the game’s own menu line when there is one', () => {
        const [perk] = perkRowsOf(UPGRADES.RestRoomLv1);
        expect(perk.label).toBe('Increased Experiece gain: +2%');
        expect(perk.described).toBe(true);
    });

    it('falls back to a curated label for the two keys the menu prints nothing for', () => {
        const [gunsmith] = perkRowsOf(UPGRADES.GunsmithLv1);
        expect(gunsmith.described).toBe(false);
        expect(gunsmith.label).toBe('Capacity');
        expect(gunsmith.value).toBe('30');

        const [junk] = perkRowsOf(UPGRADES.AreaUpgradeAreaLv1);
        expect(junk.label).toBe('Capacity');
        expect(junk.value).toBe('40');
    });

    it('never leaves a row blank, whatever a future extraction adds', () => {
        for (const id of ids) {
            for (const row of perkRowsOf(UPGRADES[id])) {
                expect(row.label.length).toBeGreaterThan(0);
            }
        }
    });

    it('keeps both halves, because the line and the number disagree', () => {
        // The reason `value` ships at all: the menu says +5%, the game applies 0.15.
        const boost = perkRowsOf(UPGRADES.IntelligentLv2)
            .find((perk) => perk.key === 'expboost_intelligence');
        expect(boost?.label).toBe('Increased Experiece gain: +5%');
        expect(boost?.value).toBe('0.15');
    });

    it('carries the two-perk levels in full', () => {
        expect(perkRowsOf(UPGRADES.MedicalAreaLv1).map((perk) => perk.key))
            .toEqual(['HQRecoveryHealth_Scale', 'MedicalAreaItem']);
    });
});
