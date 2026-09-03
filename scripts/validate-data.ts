/**
 * Game data validator — the safety net for the PAK-extraction migration.
 *
 * Run:  npm run validate-data
 *       npm run validate-data -- --data <dir>   # dry-run against a candidate set, e.g. the
 *                                               # extraction repo's merged/ before publishing
 *
 * Fails (exit 1) on anything that would break the app at runtime: duplicate ids, enum drift,
 * missing required fields, dangling cross-references, missing images, head gear with no
 * protection model at all.
 *
 * Reports (exit 0) on things that are known and deliberate: items the game no longer ships,
 * unreferenced image files, and the curation backlog (price 0 / empty description).
 *
 * See docs/DATA_MIGRATION_PLAN.md §4.2.
 */

import fs from 'fs';
import path from 'path';

import { CALIBERS, itemCategories, RARITY_CONFIG } from '../src/types/items';
import { tasksData } from '../src/data/tasks';
import { hideoutUpgrades } from '../src/data/hideout-upgrades';

const ROOT = path.join(__dirname, '..');

// `--data <dir>` validates a candidate set instead of what is published, so a merge can be checked
// before it lands. Images still resolve against this repo's public/ - that is where they must end
// up regardless of where the JSON came from.
const dataArgIndex = process.argv.indexOf('--data');
const DATA_DIR = dataArgIndex > -1 && process.argv[dataArgIndex + 1]
    ? path.resolve(process.argv[dataArgIndex + 1])
    : path.join(ROOT, 'public', 'data');
const IMAGES_ROOT = path.join(ROOT, 'public');
const ITEM_IMAGES_DIR = path.join(IMAGES_ROOT, 'images', 'items');

interface RawItem {
    id: string;
    name: string;
    description?: string;
    category: string;
    subcategory: string;
    images?: { icon?: string; thumbnail?: string; fullsize?: string };
    stats?: Record<string, unknown>;
    extractionStatus?: string;
}

/** Every data file, with the category its items must declare. */
const DATA_FILES: Array<{ file: string; category: string }> = [
    { file: 'weapons.json', category: 'weapons' },
    { file: 'ammunition.json', category: 'ammo' },
    { file: 'magazines.json', category: 'attachments' },
    { file: 'attachments.json', category: 'attachments' },
    { file: 'grenades.json', category: 'grenades' },
    { file: 'armor.json', category: 'gear' },
    { file: 'helmets.json', category: 'gear' },
    { file: 'face-shields.json', category: 'gear' },
    { file: 'backpacks.json', category: 'gear' },
    { file: 'holsters.json', category: 'gear' },
    { file: 'medical.json', category: 'medicine' },
    { file: 'provisions.json', category: 'provisions' },
    { file: 'task-items.json', category: 'task-items' },
    { file: 'keys.json', category: 'keys' },
    { file: 'misc.json', category: 'misc' },
];

/** Files whose items carry a `stats.caliber` that must be a known caliber. */
const CALIBER_FILES = new Set(['weapons.json', 'ammunition.json', 'magazines.json']);

const errors: string[] = [];
const warnings: string[] = [];
const counts: Record<string, number> = {};

function fail(check: string, message: string): void {
    errors.push(`${check}: ${message}`);
    counts[check] = (counts[check] ?? 0) + 1;
}

function warn(check: string, message: string): void {
    warnings.push(`${check}: ${message}`);
    counts[check] = (counts[check] ?? 0) + 1;
}

// ---------------------------------------------------------------------------
// load
// ---------------------------------------------------------------------------

const byFile = new Map<string, RawItem[]>();
const allItems: Array<RawItem & { _file: string }> = [];

for (const { file } of DATA_FILES) {
    const full = path.join(DATA_DIR, file);
    if (!fs.existsSync(full)) {
        fail('missing-file', `${file} does not exist`);
        continue;
    }
    const parsed = JSON.parse(fs.readFileSync(full, 'utf8'));
    if (!Array.isArray(parsed)) {
        fail('missing-file', `${file} is not an array`);
        continue;
    }
    byFile.set(file, parsed as RawItem[]);
    for (const item of parsed as RawItem[]) allItems.push({ ...item, _file: file });
}

const itemsById = new Map<string, RawItem & { _file: string }>();
const idsByFile = new Map<string, Set<string>>();
for (const item of allItems) {
    if (!itemsById.has(item.id)) itemsById.set(item.id, item);
    const set = idsByFile.get(item._file) ?? new Set<string>();
    set.add(item.id);
    idsByFile.set(item._file, set);
}

// ---------------------------------------------------------------------------
// structural checks
// ---------------------------------------------------------------------------

const seen = new Map<string, string[]>();
for (const item of allItems) {
    if (!item.id) {
        fail('required-field', `${item._file}: item with no id (name="${item.name ?? ''}")`);
        continue;
    }
    seen.set(item.id, [...(seen.get(item.id) ?? []), item._file]);
}
for (const [id, files] of seen) {
    if (files.length > 1) fail('duplicate-id', `${id} appears ${files.length}× (${files.join(', ')})`);
}

const rarities = new Set(Object.keys(RARITY_CONFIG));
const calibers = new Set<string>(CALIBERS);

for (const { file, category } of DATA_FILES) {
    const items = byFile.get(file);
    if (!items) continue;
    const declared = itemCategories[category]?.subcategories ?? [];

    for (const item of items) {
        const where = `${file}/${item.id}`;

        // required fields the UI dereferences without a guard
        if (!item.name) fail('required-field', `${where}: no name`);
        if (!item.images?.icon) fail('required-field', `${where}: no images.icon`);
        if (typeof item.stats?.weight !== 'number') fail('required-field', `${where}: stats.weight is not a number`);
        // `stats.price` retired in favour of the extracted shop data. A missing `basePrice` is a
        // real state - loot-only and seasonal items are listed by no vendor - so it is a curation
        // queue, not a break; a present-but-non-numeric one still is.
        if (item.stats?.basePrice !== undefined && typeof item.stats.basePrice !== 'number') {
            fail('required-field', `${where}: stats.basePrice is not a number`);
        }

        // category / subcategory
        if (item.category !== category) {
            fail('enum-drift', `${where}: category "${item.category}", expected "${category}"`);
        }
        if (declared.length && !declared.includes(item.subcategory)) {
            // A quest item's trader is curated - nothing in the game files links the two - so an
            // unclassified one arrives carrying the game's folder name. ItemService buckets those
            // into "Unassigned", so the app is fine; they are a curation queue, not a break.
            if (category === 'task-items') {
                warn('curation-task-trader', `${where}: subcategory "${item.subcategory}" is a game folder, not a trader`);
            } else {
                fail('enum-drift', `${where}: subcategory "${item.subcategory}" not in itemCategories.${category}`);
            }
        }

        // rarity
        const rarity = item.stats?.rarity;
        if (typeof rarity !== 'string' || !rarities.has(rarity)) {
            fail('enum-drift', `${where}: rarity "${String(rarity)}" is not an ItemRarity`);
        }

        // caliber
        if (CALIBER_FILES.has(file)) {
            const caliber = item.stats?.caliber;
            if (typeof caliber !== 'string' || !calibers.has(caliber)) {
                fail('enum-drift', `${where}: caliber "${String(caliber)}" is not in CALIBERS`);
            }
        }

        // curation backlog — reported, never fatal
        if (item.stats?.basePrice === undefined) warn('curation-price', `${where}: no basePrice - listed by no vendor`);
        else if (item.stats.basePrice === 0) warn('curation-price', `${where}: basePrice 0`);
        if (!item.description) warn('curation-description', `${where}: empty description`);
        // Two different queues. `missing-from-game-data` is "review and delete"; anything else is
        // an item the extraction accounts for under a type the wiki does not publish yet, which
        // needs no decision - only the page that will show it.
        if (item.extractionStatus === 'missing-from-game-data') {
            warn('missing-from-game', `${where}: no counterpart in the extracted data`);
        } else if (item.extractionStatus) {
            warn('extraction-relocated', `${where}: ${item.extractionStatus}`);
        }
    }
}

// ---------------------------------------------------------------------------
// head gear must carry a protection model (plan §7.3)
// ---------------------------------------------------------------------------

function isNightVision(item: RawItem): boolean {
    return item.subcategory === 'Night Vision' || item.id.startsWith('nvg-');
}

for (const file of ['helmets.json', 'face-shields.json']) {
    for (const item of byFile.get(file) ?? []) {
        if (isNightVision(item)) continue;
        const cones = item.stats?.coneRegions;
        const zones = item.stats?.protectiveData;
        const hasCones = Array.isArray(cones) && cones.length > 0;
        const hasZones = Array.isArray(zones) && zones.length > 0;
        if (!hasCones && !hasZones) {
            fail('head-protection', `${file}/${item.id}: neither coneRegions nor protectiveData`);
        }
    }
}

// ---------------------------------------------------------------------------
// referential integrity
// ---------------------------------------------------------------------------

function checkRef(check: string, from: string, id: unknown, allowed?: Set<string>): void {
    if (typeof id !== 'string' || !id) return;
    const known = allowed ? allowed.has(id) : itemsById.has(id);
    if (!known) fail(check, `${from} -> ${id} (no such item)`);
}

// tasks: reward / preReward item ids
for (const task of Object.values(tasksData)) {
    for (const reward of [...(task.reward ?? []), ...(task.preReward ?? [])]) {
        if (reward.type !== 'item') continue;
        // Some rewards carry only an `item_name` display string, so they link to nothing. Reported,
        // not fatal: most name containers and ammo boxes that are not wiki items at all.
        if (!reward.item_id) {
            const named = (reward as { item_name?: string }).item_name ?? '(no name either)';
            warn('task-reward-unlinked', `tasks.${task.id}: reward "${named}" has no item_id`);
            continue;
        }
        checkRef('ref-tasks', `tasks.${task.id}`, reward.item_id);
    }
}

// combat-sim test cases
// Always this repo's copy: it is a fixture that lives here, not part of the item set being
// validated, so `--data` must not send the lookup somewhere it does not exist.
const simPath = path.join(ROOT, 'public', 'data', 'combat-sim-test-data.json');
if (fs.existsSync(simPath)) {
    const sim = JSON.parse(fs.readFileSync(simPath, 'utf8'));
    for (const testCase of sim.singleShotTestCases ?? []) {
        const from = `combat-sim-test-data.${testCase.id}`;
        checkRef('ref-combat-sim', from, testCase.weapon);
        checkRef('ref-combat-sim', from, testCase.ammo);
        checkRef('ref-combat-sim', from, testCase.armor?.id);
        checkRef('ref-combat-sim', from, testCase.helmet?.id);
    }
}

// hideout exchange -> items
for (const [upgradeId, upgrade] of Object.entries(hideoutUpgrades)) {
    for (const itemId of Object.keys(upgrade.exchange ?? {})) {
        checkRef('ref-hideout', `hideout.${upgradeId}`, itemId);
    }
}

// gunsmith graph: magazine <-> weapon, and helmet -> face shield
const weaponIds = idsByFile.get('weapons.json') ?? new Set<string>();
const magazineIds = idsByFile.get('magazines.json') ?? new Set<string>();
const faceShieldIds = idsByFile.get('face-shields.json') ?? new Set<string>();

for (const mag of byFile.get('magazines.json') ?? []) {
    const compatible = mag.stats?.compatibleWeapons;
    if (!Array.isArray(compatible)) continue;
    for (const ref of compatible) {
        if (typeof ref !== 'string') {
            fail('ref-gunsmith', `magazines/${mag.id}: compatibleWeapons entry is ${typeof ref}, expected a weapon id`);
            continue;
        }
        checkRef('ref-gunsmith', `magazines/${mag.id}`, ref, weaponIds);
    }
}

for (const weapon of byFile.get('weapons.json') ?? []) {
    const compatible = (weapon as RawItem & { compatibleMagazines?: unknown }).compatibleMagazines;
    if (!Array.isArray(compatible)) continue;
    for (const ref of compatible) {
        if (typeof ref !== 'string') {
            fail('ref-gunsmith', `weapons/${weapon.id}: compatibleMagazines entry is ${typeof ref}, expected a magazine id`);
            continue;
        }
        checkRef('ref-gunsmith', `weapons/${weapon.id}`, ref, magazineIds);
    }
}

for (const helmet of byFile.get('helmets.json') ?? []) {
    const canAttach = helmet.stats?.canAttach;
    if (!Array.isArray(canAttach)) continue;
    for (const ref of canAttach) {
        checkRef('ref-face-shield', `helmets/${helmet.id}`, ref, faceShieldIds);
    }
}

// ---------------------------------------------------------------------------
// images
// ---------------------------------------------------------------------------

const referencedImages = new Set<string>();

for (const item of allItems) {
    for (const key of ['icon', 'thumbnail', 'fullsize'] as const) {
        const rel = item.images?.[key];
        if (!rel) continue;
        referencedImages.add(rel);
        const full = path.join(IMAGES_ROOT, rel.replace(/^\//, ''));
        if (!fs.existsSync(full)) {
            fail('image-missing', `${item._file}/${item.id}: images.${key} -> ${rel}`);
        }
    }
}

// unreferenced files are deliberate for now (plan §10.6) — count them, do not fail
if (fs.existsSync(ITEM_IMAGES_DIR)) {
    let orphans = 0;
    for (const dir of fs.readdirSync(ITEM_IMAGES_DIR)) {
        const dirPath = path.join(ITEM_IMAGES_DIR, dir);
        if (!fs.statSync(dirPath).isDirectory()) continue;
        for (const file of fs.readdirSync(dirPath)) {
            if (!referencedImages.has(`/images/items/${dir}/${file}`)) orphans++;
        }
    }
    if (orphans > 0) warn('image-orphan', `${orphans} file(s) under public/images/items are referenced by no item`);
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------

const VERBOSE = process.argv.includes('--verbose');
const LIMIT = VERBOSE ? Number.POSITIVE_INFINITY : 15;

function print(title: string, lines: string[]): void {
    if (lines.length === 0) return;
    console.log(`\n${title} (${lines.length})`);
    const grouped = new Map<string, string[]>();
    for (const line of lines) {
        const [check, ...rest] = line.split(': ');
        grouped.set(check, [...(grouped.get(check) ?? []), rest.join(': ')]);
    }
    for (const [check, entries] of grouped) {
        console.log(`  ${check} — ${entries.length}`);
        for (const entry of entries.slice(0, LIMIT)) console.log(`    ${entry}`);
        if (entries.length > LIMIT) console.log(`    … ${entries.length - LIMIT} more (--verbose)`);
    }
}

console.log(`📦 ${allItems.length} items across ${byFile.size} files`);
print('⚠️  Warnings', warnings);
print('❌ Errors', errors);

if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} error(s). See docs/DATA_MIGRATION_PLAN.md §4.2.`);
    process.exit(1);
}
console.log('\n✅ No errors.');
