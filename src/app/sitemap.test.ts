import { describe, expect, it } from 'vitest';
import sitemap from './sitemap';
import { fetchItemsData } from '@/services/ItemService';
import { fetchTasks } from '@/services/TaskService';
import { guidesConfig } from '@/config/guides';
import { absoluteUrl, DATA_RELEASE_DATE, SITE_URL } from '@/lib/seo';

describe('sitemap', () => {
    it('lists exactly the public content routes derived from the published data', async () => {
        const [entries, { items }, tasks] = await Promise.all([sitemap(), fetchItemsData(), fetchTasks()]);
        const expected = [
            '/', '/combat-sim', '/gunsmith', '/tasks', '/items', '/hideout-upgrades', '/guides',
            ...items.map(item => `/items/${item.id}`),
            ...Object.keys(tasks).map(id => `/tasks/${id}`),
            ...guidesConfig.map(guide => `/guides/${guide.slug}`),
        ].map(absoluteUrl);
        expect(entries.map(entry => entry.url).sort()).toEqual(expected.sort());
        expect(new Set(entries.map(entry => entry.url)).size).toBe(entries.length);
        for (const entry of entries) {
            const url = new URL(entry.url);
            expect(url.origin).toBe(SITE_URL);
            expect(url.protocol).toBe('https:');
            expect(url.search).toBe('');
            expect(url.hash).toBe('');
            expect(url.pathname).not.toMatch(/^\/(admin|auth|dashboard|unauthorized|goodbye|user)(\/|$)|^\/combat-sim\/debug/);
            if (entry.lastModified) {
                const date = new Date(entry.lastModified);
                expect(Number.isFinite(date.getTime())).toBe(true);
                expect(date.getTime()).toBeLessThanOrEqual(Date.now());
            }
        }
    });

    it('uses maintained release dates and omits unknown dates', async () => {
        const entries = await sitemap();
        const dateOf = (path: string) => entries.find(entry => entry.url === absoluteUrl(path))?.lastModified;
        for (const entry of entries.filter(entry => /\/(items|tasks)(\/|$)/.test(new URL(entry.url).pathname))) {
            expect(entry.lastModified).toBe(DATA_RELEASE_DATE);
        }
        expect(dateOf('/gunsmith')).toBe('2026-09-06');
        expect(dateOf('/guides/damage-model')).toBe('2026-09-06');
        expect(dateOf('/guides/armor-penetration-guide')).toBe('2026-09-02');
        for (const path of ['/', '/combat-sim', '/hideout-upgrades', '/guides']) {
            expect(dateOf(path)).toBeUndefined();
        }
    });
});
