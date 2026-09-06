import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fetchItemsData } from '@/services/ItemService';
import { fetchTasks } from '@/services/TaskService';
import { guidesConfig, getRelatedGuides } from '@/config/guides';
import { metadata as profileMetadata } from '@/app/user/layout';
import {
    absoluteUrl, breadcrumbData, guideArticleData, guideMetadata, itemDescription,
    itemMetadata, serializeJsonLd, taskMetadata,
} from './seo';

describe('search metadata and structured data', () => {
    it('gives every item its own title, description, image and matching breadcrumb URL', async () => {
        const { items } = await fetchItemsData();
        for (const item of items) {
            const metadata = itemMetadata(item);
            expect(metadata.title).toEqual({ absolute: `${item.name} – ExfilZone Item Database` });
            expect(metadata.description).toBeTruthy();
            expect(metadata.alternates?.canonical).toBe(absoluteUrl(`/items/${item.id}`));
            expect(metadata.openGraph?.images).toEqual([expect.objectContaining({
                url: absoluteUrl(item.images.fullsize), alt: expect.stringContaining(item.name),
            })]);
            const breadcrumb = breadcrumbData([
                { name: 'Home', path: '/' }, { name: 'Items', path: '/items' },
                { name: item.name, path: `/items/${item.id}` },
            ]);
            expect(breadcrumb.itemListElement.at(-1)?.item).toBe(metadata.alternates?.canonical);
            expect(breadcrumb.itemListElement.map(entry => entry.position)).toEqual([1, 2, 3]);
        }
        const fallbackItem = { ...items[0], description: '   ' };
        expect(itemDescription(fallbackItem)).toContain(fallbackItem.name);
    });

    it('keeps every task title and description unique, including repeated daily names', async () => {
        const tasks = Object.values(await fetchTasks());
        const metadata = tasks.map(task => taskMetadata(task, tasks));
        expect(new Set(metadata.map(entry => entry.title)).size).toBe(tasks.length);
        expect(new Set(metadata.map(entry => entry.description)).size).toBe(tasks.length);
        tasks.forEach((task, index) => {
            expect(metadata[index].alternates?.canonical).toBe(absoluteUrl(`/tasks/${task.id}`));
            expect(breadcrumbData([{ name: task.name, path: `/tasks/${task.id}` }]).itemListElement[0].item)
                .toBe(metadata[index].alternates?.canonical);
        });
    });

    it('keeps article URLs, dates and images aligned with guide metadata and real assets', () => {
        for (const guide of guidesConfig) {
            const metadata = guideMetadata(guide);
            const article = guideArticleData(guide);
            expect(article.url).toBe(metadata.alternates?.canonical);
            expect(article.mainEntityOfPage).toBe(article.url);
            expect(metadata.openGraph).toMatchObject({
                title: article.headline, description: article.description,
                publishedTime: article.datePublished, modifiedTime: article.dateModified,
                images: [expect.objectContaining({ url: guide.ogImageUrl || '/og-image.jpg' })],
            });
            expect(article.image).toEqual([absoluteUrl(guide.ogImageUrl || '/og-image.jpg')]);
            expect(article.dateModified >= article.datePublished).toBe(true);
            expect(existsSync(join(process.cwd(), 'public', guide.ogImageUrl || '/og-image.jpg'))).toBe(true);
            expect(getRelatedGuides(guide.slug).length).toBeGreaterThan(0);
        }
        const linked = new Set(guidesConfig.flatMap(guide => getRelatedGuides(guide.slug).map(related => related.slug)));
        expect([...linked].sort()).toEqual(guidesConfig.map(guide => guide.slug).sort());
    });

    it('excludes profiles from search while allowing their links to be followed', () => {
        expect(profileMetadata.robots).toEqual({ index: false, follow: true });
    });

    it('escapes script-closing markup while preserving JSON values', () => {
        const value = { name: '</script><script>alert(1)</script>' };
        const serialized = serializeJsonLd(value);
        expect(serialized).not.toContain('<');
        expect(JSON.parse(serialized)).toEqual(value);
    });
});
