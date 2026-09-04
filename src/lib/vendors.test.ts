/**
 * The one description of who the six shop fronts are.
 *
 * The answer used to be scattered across three call sites with three vocabularies, one of which was
 * missing the gunsmith entirely. These specs hold the single record intact.
 */
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { VENDOR_LIST, getVendor, reputationForLevel, vendorOrg, vendorShort } from '@/lib/vendors';

describe('the vendor record', () => {
    it('describes six shop fronts', () => {
        expect(VENDOR_LIST).toHaveLength(6);
    });

    it('gives every vendor an org, a merchant, a mark and a portrait', () => {
        for (const vendor of VENDOR_LIST) {
            expect(vendor.org, vendor.key).toBeTruthy();
            expect(vendor.merchant, `${vendor.key} merchant`).toBeTruthy();
            expect(vendor.icon, `${vendor.key} icon`).toBeTruthy();
            expect(vendor.portrait, `${vendor.key} portrait`).toBeTruthy();
            expect(vendor.ogImage, `${vendor.key} ogImage`).toBeTruthy();
        }
    });

    it('stays cheap to import, because every route that draws a vendor imports it', async () => {
        // This began as a guard against one import - `corps`, six rows inside a 431 KB task module,
        // which put all 227 tasks in the bundle of every route that named a vendor. That module is
        // gone; the shape of the mistake is not, so the guard is now about weight rather than about
        // one path. `@/types/*` is type-only and erases.
        const source = await readFile(new URL('./vendors.ts', import.meta.url), 'utf8');
        const imports = [...source.matchAll(/^import[^;]+from '([^']+)';/gm)].map((match) => match[1]);

        expect(imports.filter((from) => !from.startsWith('@/types/'))).toEqual([]);
    });

    it('names the gunsmith vendor Neumann, not by its role', () => {
        // Checked against the game UI: the shop front is Neumann, the bench work is the role.
        expect(getVendor('gunsmith')?.org).toBe('Neumann');
    });

    it('keeps org and merchant as separate names', () => {
        // The two halves of a vendor: the organisation, and the person behind the counter.
        for (const vendor of VENDOR_LIST) {
            expect(vendor.org, vendor.key).not.toBe(vendor.merchant);
        }
    });
});

describe('naming an unknown vendor', () => {
    it('returns null rather than throwing', () => {
        expect(getVendor('a-shop-front-the-extraction-added')).toBeNull();
    });

    it('falls back to the raw key so the page stays legible', () => {
        expect(vendorOrg('newcomer')).toBe('NEWCOMER');
        expect(vendorShort('newcomer')).toBe('NEWCOMER');
    });
});

describe('reputation for a loyalty level', () => {
    it('charges nothing for level 1', () => {
        for (const vendor of VENDOR_LIST) {
            expect(reputationForLevel(vendor.key, 1), vendor.key).toBe(0);
        }
    });

    it('reads levelCap as the thresholds for levels 2, 3 and 4', () => {
        const tiered = VENDOR_LIST.find((vendor) => vendor.levelCap.length > 0)!;

        expect(reputationForLevel(tiered.key, 2)).toBe(tiered.levelCap[0]);
        expect(reputationForLevel(tiered.key, 4)).toBe(tiered.levelCap[2]);
    });

    it('returns null past the tiers a vendor publishes', () => {
        const tiered = VENDOR_LIST.find((vendor) => vendor.levelCap.length > 0)!;

        expect(reputationForLevel(tiered.key, tiered.levelCap.length + 2)).toBeNull();
    });

    it('returns null for a vendor with no tiers at all', () => {
        // Trupik's publishes none, and its offers are all level 1, so that is a fact and not a gap.
        const flat = VENDOR_LIST.find((vendor) => vendor.levelCap.length === 0);
        if (!flat) return;

        expect(reputationForLevel(flat.key, 2)).toBeNull();
    });
});
