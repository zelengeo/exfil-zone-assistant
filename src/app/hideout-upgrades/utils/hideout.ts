/**
 * The hideout's rules, separated from the screens that draw them.
 *
 * The route used to keep `checkLevelConditions`, `checkCanUndo` and `getAreaUpgradeId` inline in
 * `HideoutOverview.tsx`, untested, next to 500 lines of markup. They are the only real logic here
 * and the part a redesign is most likely to break quietly, so they live here now and
 * `hideout.test.ts` holds them to the real 70 upgrades — the same arrangement `app/tasks/utils/`
 * uses, and for the same reason.
 *
 * Everything in this file is pure: it takes the set of built upgrades and answers a question. No
 * component decides what "ready" means.
 */
import {
    areaIcons,
    categoriesWithoutArea,
    hideoutUpgrades,
    hideoutUpgradesTasks,
} from '@/data/hideout-upgrades';

export type UpgradeId = keyof typeof hideoutUpgrades;

/**
 * One upgrade, widened.
 *
 * `hideout-upgrades.ts` is `as const`, so every field arrives as a literal type and `exchange`
 * ends up a different shape per upgrade — which makes any code that iterates the database fight
 * the types. Widening once, here, is what lets the rest of the route read an upgrade as an
 * upgrade. The assignment below is the check that this stays honest with the data.
 */
export interface Upgrade {
    areaId: string;
    categoryId: string;
    level: number;
    upgradeName: string;
    upgradeDesc: string;
    price: number;
    exchange: Readonly<Record<string, number>>;
    levelConditions: Readonly<Record<string, number>>;
    relatedQuests: readonly string[];
    levelUpIcon: string;
}

export const UPGRADES: Readonly<Record<UpgradeId, Upgrade>> = hideoutUpgrades;

/** What the player has built. Read out of `localStorage`, so never trusted without validating. */
export type Built = ReadonlySet<UpgradeId>;

/** Current level of every area, plus the pseudo-area `Player`. */
export type AreaLevels = Readonly<Record<string, number>>;

/**
 * The player level every `Player` condition is measured against.
 *
 * Six upgrades gate on it and this wiki tracks no player level, so the choice is to treat it as
 * always met or to invent a control nobody asked for. It is treated as met: the highest `Player`
 * requirement in the database is 5, and a level a raider passes early is not the interesting gate.
 */
const PLAYER_LEVEL = 10;

export const isUpgradeId = (key: string): key is UpgradeId => key in hideoutUpgrades;

/**
 * The id of one area's level, or null where no such level exists.
 *
 * Total on purpose. Null is how the pane knows there is no next or previous level, so it drives
 * button state directly — a throw here is a broken pane, not an error.
 */
export function upgradeId(areaId: string, level: number): UpgradeId | null {
    const id = `${areaId}Lv${level}`;
    return isUpgradeId(id) ? id : null;
}

const entries = Object.entries(UPGRADES) as Array<[UpgradeId, Upgrade]>;

/** Every area, in the order the database lists them. */
export const AREAS: readonly string[] = [...new Set(entries.map(([, u]) => u.areaId))];

/** Every upgrade of one area, ascending by level. */
export const levelsOfArea: Readonly<Record<string, readonly Upgrade[]>> = (() => {
    const byArea: Record<string, Upgrade[]> = {};
    for (const [, upgrade] of entries) (byArea[upgrade.areaId] ??= []).push(upgrade);
    for (const list of Object.values(byArea)) list.sort((a, b) => a.level - b.level);
    return byArea;
})();

/** The top level of an area — where it stops being upgradable and starts being finished. */
export const maxLevelOf = (areaId: string): number =>
    levelsOfArea[areaId]?.[levelsOfArea[areaId].length - 1]?.level ?? 0;

/* -------------------------------------------------------------------------- */
/* Rooms                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * A room is a `categoryId`: one screen of the map. `None` is the main floor, which is where the
 * route opens and the only room the other four are reached from.
 */
export const MAIN_FLOOR = 'None';

export const ROOM_IDS: readonly string[] = [
    MAIN_FLOOR,
    ...new Set(entries.map(([, u]) => u.categoryId).filter((id) => id !== MAIN_FLOOR)),
];

/** Display copy. The data names rooms as engine identifiers; nobody says "HQPAD" out loud. */
const ROOM_NAMES: Record<string, string> = {
    None: 'Main floor',
    Lounge: 'Lounge',
    MedicalArea: 'Medical',
    KitchenArea: 'Kitchen',
    HQPAD: 'HQ Pad',
};

export const roomName = (roomId: string): string => ROOM_NAMES[roomId] ?? roomId;

/** An area's display name — `areaIcons` carries it as the pin's alt text. */
export const areaName = (areaId: string): string =>
    (areaIcons as Record<string, { alt: string } | undefined>)[areaId]?.alt ?? areaId;

/** The pin image for an area, relative to `/images/hideout/`. */
export const areaIcon = (areaId: string): string =>
    (areaIcons as Record<string, { icon: string } | undefined>)[areaId]?.icon ?? 'Image_bg_close.webp';

/**
 * Which pins a room's screen carries.
 *
 * The main floor shows its own 15 areas plus one pin per other room, which is how those rooms are
 * entered. A room shows its own areas plus a `None` pin back to the main floor — and, for a room
 * that is not also an area (Lounge, HQ Pad), a pin for itself, since no upgrade names it as an
 * `areaId` and it would otherwise have no way to appear. That list is derived from the data rather
 * than spelled out, so a season that adds a room needs no edit here.
 */
export const zonesInRoom: Readonly<Record<string, readonly string[]>> = (() => {
    const rooms: Record<string, string[]> = {};
    for (const roomId of ROOM_IDS) {
        rooms[roomId] = roomId === MAIN_FLOOR
            ? ROOM_IDS.filter((id) => id !== MAIN_FLOOR)
            : [MAIN_FLOOR, ...(categoriesWithoutArea.includes(roomId) ? [roomId] : [])];
    }
    for (const [, upgrade] of entries) {
        const zones = rooms[upgrade.categoryId];
        if (zones && !zones.includes(upgrade.areaId)) zones.push(upgrade.areaId);
    }
    return rooms;
})();

/**
 * Whether a pin navigates into a room instead of opening its own upgrade pane.
 *
 * An area that is also a room has to do both. From outside, its pin is the way in; on the room's
 * own screen it is the area itself, so its remaining levels stay reachable — Kitchen Area has four
 * of them, and keying this off `level === 1` used to strand every one past the first. Pins that
 * are rooms only (Lounge, HQ Pad, and the `None` pin back to the main floor) hold no upgrades of
 * their own, so they always navigate.
 */
export function isRoomPin(areaId: string, levels: AreaLevels, openRoom: string): boolean {
    if (!ROOM_IDS.includes(areaId)) return false;
    if (!levelsOfArea[areaId]) return true;
    return (levels[areaId] ?? 0) >= 1 && areaId !== openRoom;
}

/* -------------------------------------------------------------------------- */
/* Progress                                                                    */
/* -------------------------------------------------------------------------- */

/** Every area's current level, derived from what is built. Nothing else stores a level. */
export function areaLevelsOf(built: Built): AreaLevels {
    const levels: Record<string, number> = { Player: PLAYER_LEVEL };
    for (const areaId of AREAS) levels[areaId] = 0;
    for (const id of built) {
        const upgrade = UPGRADES[id];
        if (upgrade) levels[upgrade.areaId] = Math.max(levels[upgrade.areaId] ?? 0, upgrade.level);
    }
    return levels;
}

/**
 * Whether an area can go up, given the levels of the areas it depends on.
 *
 * `level` null asks about the next one. A level more than one step ahead is refused outright: the
 * pane can navigate to Lv3 while the area sits at Lv1, and building it from there would skip Lv2's
 * cost entirely.
 */
export function canBuild(areaId: string, level: number | null, levels: AreaLevels): boolean {
    const current = levels[areaId] ?? 0;
    const target = level ?? current + 1;
    if (target > current + 1) return false;

    const id = upgradeId(areaId, target);
    if (!id) return false;

    return Object.entries(UPGRADES[id].levelConditions)
        .every(([required, requiredLevel]) => (levels[required] ?? 0) >= requiredLevel);
}

/**
 * Whether an upgrade can be taken back, or whether something built on top of it blocks that.
 *
 * Two things block an undo: another area whose built level names this one as a condition, and a
 * higher level of this same area. The second case is new — the old rule checked only conditions,
 * so undoing Lv2 while Lv3 stood left the area reading level 3 with Lv2's materials back in the
 * remaining list. The pane's level chevrons make that reachable in two clicks.
 */
export function canUndo(areaId: string, level: number, built: Built): boolean {
    for (const id of built) {
        const upgrade = UPGRADES[id];
        if (!upgrade) continue;
        if (upgrade.areaId === areaId && upgrade.level > level) return false;
        if (upgrade.levelConditions[areaId] === level) return false;
    }
    return true;
}

/* -------------------------------------------------------------------------- */
/* Zone state                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * What a pin says without being clicked.
 *
 * - `room` — a way into another screen, not an upgrade
 * - `built` — at its top level, nothing left to do
 * - `ready` — the next level's conditions are all met
 * - `locked` — something has to happen first
 */
export type ZoneState = 'ready' | 'built' | 'locked' | 'room';

export interface Zone {
    areaId: string;
    name: string;
    icon: string;
    state: ZoneState;
    /** The level it stands at now. */
    level: number;
    /** Its top level, or for a room pin, how many upgrades that room holds. */
    max: number;
    /** For a room pin, how many of that room's upgrades are built. */
    builtCount: number;
    /** Whether the next level is gated on a task, which no amount of material will unlock. */
    taskGated: boolean;
}

/** Every pin on one room's screen, in the order the data lists them. */
export function zonesOf(roomId: string, levels: AreaLevels, built: Built): Zone[] {
    return (zonesInRoom[roomId] ?? []).map((areaId) => {
        if (isRoomPin(areaId, levels, roomId)) {
            const summary = roomSummary(areaId, built);
            return {
                areaId,
                name: areaId === MAIN_FLOOR ? 'Main floor' : roomName(areaId),
                icon: areaIcon(areaId),
                state: 'room' as const,
                level: 0,
                max: summary.total,
                builtCount: summary.built,
                taskGated: false,
            };
        }

        const level = levels[areaId] ?? 0;
        const max = maxLevelOf(areaId);
        const next = upgradeId(areaId, level + 1);
        return {
            areaId,
            name: areaName(areaId),
            icon: areaIcon(areaId),
            state: level >= max ? 'built' : canBuild(areaId, null, levels) ? 'ready' : 'locked',
            level,
            max,
            builtCount: level,
            taskGated: next !== null && UPGRADES[next].relatedQuests.length > 0,
        };
    });
}

export interface RoomSummary {
    id: string;
    name: string;
    built: number;
    total: number;
}

export function roomSummary(roomId: string, built: Built): RoomSummary {
    const inRoom = entries.filter(([, u]) => u.categoryId === roomId);
    return {
        id: roomId,
        name: roomName(roomId),
        built: inRoom.filter(([id]) => built.has(id)).length,
        total: inRoom.length,
    };
}

export const roomSummaries = (built: Built): RoomSummary[] =>
    ROOM_IDS.map((id) => roomSummary(id, built));

/* -------------------------------------------------------------------------- */
/* Gates                                                                       */
/* -------------------------------------------------------------------------- */

export interface AreaGate {
    kind: 'area';
    areaId: string;
    label: string;
    level: number;
    met: boolean;
}

export interface TaskGate {
    kind: 'task';
    questId: string;
    label: string;
}

export type Gate = AreaGate | TaskGate;

/**
 * The name behind one quest id.
 *
 * `relatedQuests` holds the game's own dotted ids (`task.mall.4`). Two sources can name them: the
 * real task list, joined on its `gameId` and handed down as `questNames` from the server, and the
 * curated `hideoutUpgradesTasks` prose written before the extraction existed. S5 gates eight
 * upgrades on tasks this wiki has not published, so neither source knows them and the id itself is
 * shown — at least a searchable string, and never a crash.
 */
export const questName = (names: Record<string, string>, questId: string): string =>
    names[questId]
    ?? (hideoutUpgradesTasks as Record<string, { name: string } | undefined>)[questId]?.name
    ?? questId;

/** What stands between the player and one upgrade — the areas it needs, then the tasks. */
export function gatesOf(
    upgrade: Upgrade,
    levels: AreaLevels,
    questNames: Record<string, string>,
): Gate[] {
    const areas: Gate[] = Object.entries(upgrade.levelConditions)
        .filter(([areaId]) => areaId !== 'Player')
        .map(([areaId, level]) => ({
            kind: 'area',
            areaId,
            label: areaName(areaId),
            level,
            met: (levels[areaId] ?? 0) >= level,
        }));

    const tasks: Gate[] = upgrade.relatedQuests.map((questId) => ({
        kind: 'task',
        questId,
        label: questName(questNames, questId),
    }));

    return [...areas, ...tasks];
}

/* -------------------------------------------------------------------------- */
/* Materials                                                                   */
/* -------------------------------------------------------------------------- */

/** Quantity bands. The same three the old summary used, and the boundaries players talk in. */
export type Band = 'bulk' | 'some' | 'few';

export const bandOf = (quantity: number): Band =>
    quantity >= 10 ? 'bulk' : quantity >= 5 ? 'some' : 'few';

export const BAND_LABELS: Record<Band, string> = {
    bulk: '10 or more',
    some: '5 to 9',
    few: '1 to 4',
};

export interface Remaining {
    /** Money, across every unbuilt level. */
    price: number;
    /** How many upgrades are still to build. */
    upgrades: number;
    /** Item id to total quantity, descending. */
    items: Array<{ itemId: string; quantity: number }>;
    /** Total individual pickups. */
    units: number;
}

/**
 * What is left to build, and what it costs.
 *
 * `readyOnly` narrows it to the levels that could be built right now — the same "ready" the map
 * paints in warn. It is the one filter worth offering: everything else in the list is eventually
 * reachable, so a filter on reachability would hide nothing, while "what can I shop for tonight"
 * is the question a raider actually arrives with.
 */
export function remaining(built: Built, levels: AreaLevels, readyOnly = false): Remaining {
    const totals = new Map<string, number>();
    let price = 0;
    let upgrades = 0;

    for (const [id, upgrade] of entries) {
        if (built.has(id)) continue;
        if (readyOnly && !canBuild(upgrade.areaId, upgrade.level, levels)) continue;

        price += upgrade.price;
        upgrades += 1;
        for (const [itemId, quantity] of Object.entries(upgrade.exchange)) {
            totals.set(itemId, (totals.get(itemId) ?? 0) + quantity);
        }
    }

    const items = [...totals]
        .map(([itemId, quantity]) => ({ itemId, quantity }))
        .sort((a, b) => b.quantity - a.quantity || a.itemId.localeCompare(b.itemId));

    return {
        price,
        upgrades,
        items,
        units: items.reduce((sum, item) => sum + item.quantity, 0),
    };
}

export interface Wanted {
    id: UpgradeId;
    upgrade: Upgrade;
    quantity: number;
    /** The room it sits in, named for a reader. */
    room: string;
    /** The area conditions still unmet, so a row can say why it is out of reach. */
    missing: AreaGate[];
}

/** Which unbuilt upgrades want one item, most-hungry first, and what stands in each one's way. */
export function wantedBy(itemId: string, built: Built, levels: AreaLevels): Wanted[] {
    return entries
        .filter(([id, upgrade]) => !built.has(id) && itemId in upgrade.exchange)
        .map(([id, upgrade]) => ({
            id,
            upgrade,
            quantity: upgrade.exchange[itemId],
            room: roomName(upgrade.categoryId),
            missing: gatesOf(upgrade, levels, {})
                .filter((gate): gate is AreaGate => gate.kind === 'area' && !gate.met),
        }))
        .sort((a, b) => b.quantity - a.quantity);
}

/** Every upgrade, for the header count. */
export const TOTAL_UPGRADES = entries.length;
