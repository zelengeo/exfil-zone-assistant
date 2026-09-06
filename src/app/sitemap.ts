import type { MetadataRoute } from 'next';
import { fetchTasks } from '@/services/TaskService';
import { fetchItemsData } from '@/services/ItemService';
import { absoluteUrl, DATA_RELEASE_DATE } from '@/lib/seo';
import { guidesConfig } from '@/config/guides';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [tasks, { items }] = await Promise.all([fetchTasks(), fetchItemsData()]);
    const staticPages: MetadataRoute.Sitemap = [
        { url: absoluteUrl('/') },
        { url: absoluteUrl('/combat-sim') },
        { url: absoluteUrl('/gunsmith'), lastModified: '2026-09-06' },
        { url: absoluteUrl('/tasks'), lastModified: DATA_RELEASE_DATE },
        { url: absoluteUrl('/items'), lastModified: DATA_RELEASE_DATE },
        { url: absoluteUrl('/hideout-upgrades') },
        { url: absoluteUrl('/guides') },
    ];

    return [
        ...staticPages,
        ...items.map(item => ({
            url: absoluteUrl(`/items/${item.id}`),
            lastModified: DATA_RELEASE_DATE,
        })),
        ...Object.keys(tasks).map(id => ({
            url: absoluteUrl(`/tasks/${id}`),
            lastModified: DATA_RELEASE_DATE,
        })),
        ...guidesConfig.map(guide => ({
            url: absoluteUrl(`/guides/${guide.slug}`),
            lastModified: guide.updatedAt ?? guide.publishedAt,
        })),
    ];
}
