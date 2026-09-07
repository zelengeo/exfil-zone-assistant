import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { fetchItemsData } from '@/services/ItemService';
import { getAllTags, getRelatedGuides, guideTags, guidesConfig } from './guides';

const guideDirectory = join(process.cwd(), 'src', 'content', 'guides');

describe('guide registry integrity', () => {
    it('has one registered component per unique slug', () => {
        const slugs = guidesConfig.map((guide) => guide.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
        for (const slug of slugs) {
            expect(existsSync(join(guideDirectory, slug + '.tsx')), slug).toBe(true);
        }
        const components = readdirSync(guideDirectory)
            .filter((file) => file.endsWith('.tsx'))
            .map((file) => file.slice(0, -4))
            .sort();
        expect(components).toEqual([...slugs].sort());
    });

    it('uses every defined tag and only defined tags', () => {
        const defined = guideTags.map((tag) => tag.id);
        expect(new Set(defined).size).toBe(defined.length);
        expect([...getAllTags()].sort()).toEqual([...defined].sort());
    });

    it('keeps explicit relations valid, unique and reciprocal enough to recommend combat references', () => {
        const slugs = new Set(guidesConfig.map((guide) => guide.slug));
        for (const guide of guidesConfig) {
            expect(new Set(guide.relatedSlugs).size, guide.slug).toBe(guide.relatedSlugs.length);
            expect(guide.relatedSlugs, guide.slug).not.toContain(guide.slug);
            expect(guide.relatedSlugs.every((slug) => slugs.has(slug)), guide.slug).toBe(true);
            expect(getRelatedGuides(guide.slug).map((related) => related.slug)).toEqual(guide.relatedSlugs);
        }
        for (const slug of ['ammo-selection-beginners', 'armor-penetration-guide', 'combat-sim-usage']) {
            expect(getRelatedGuides(slug).map((guide) => guide.slug)).toContain('damage-model');
        }
    });

    it('requires current, ordered freshness metadata and normalized read times', () => {
        for (const guide of guidesConfig) {
            expect(Date.parse(guide.updatedAt), guide.slug).toBeGreaterThanOrEqual(Date.parse(guide.publishedAt));
            expect(Date.parse(guide.updatedAt), guide.slug).toBeLessThanOrEqual(Date.now());
            expect(Number.isInteger(guide.readTimeMinutes), guide.slug).toBe(true);
            expect(guide.readTimeMinutes, guide.slug).toBeGreaterThan(0);
        }
    });

    it('resolves literal guide, item and simulator references', async () => {
        const { items } = await fetchItemsData();
        const itemIds = new Set(items.map((item) => item.id));
        const guideSlugs = new Set(guidesConfig.map((guide) => guide.slug));
        const itemParamNames = new Set(['a0w', 'a0a', 'da', 'dh', 'df']);

        for (const guide of guidesConfig) {
            const source = readFileSync(join(guideDirectory, guide.slug + '.tsx'), 'utf8');
            const links = [...source.matchAll(/href=(?:"([^"]+)"|'([^']+)')/g)]
                .map((match) => (match[1] ?? match[2]).replaceAll('&amp;', '&'));
            for (const href of links) {
                const url = new URL(href, 'https://www.exfil-zone-assistant.app');
                if (url.pathname.startsWith('/guides/')) {
                    expect(guideSlugs.has(url.pathname.slice('/guides/'.length)), href).toBe(true);
                }
                if (url.pathname.startsWith('/items/')) {
                    expect(itemIds.has(url.pathname.slice('/items/'.length)), href).toBe(true);
                }
                if (url.pathname === '/combat-sim') {
                    for (const [name, value] of url.searchParams) {
                        if (itemParamNames.has(name)) expect(itemIds.has(value), href).toBe(true);
                    }
                }
            }
        }
    });
});
