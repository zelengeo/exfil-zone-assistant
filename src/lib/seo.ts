import type { Metadata } from 'next';
import type { Item } from '@/types/items';
import { getCategoryById } from '@/types/items';
import type { GuideMetadata } from '@/types/guides';
import type { Task } from '@/types/tasks';
import { getVendor } from '@/lib/vendors';

export const SITE_URL = 'https://www.exfil-zone-assistant.app';
export const DATA_RELEASE_DATE = '2026-09-04';

export function absoluteUrl(path: string): string {
    const url = new URL(path, `${SITE_URL}/`).href;
    return url === `${SITE_URL}/` ? SITE_URL : url;
}

export function itemDescription(item: Item): string {
    return item.description?.trim() ||
        `${item.name} in Contractors Showdown ExfilZone. View ${getCategoryById(item.category)?.name.toLowerCase() ?? item.category} specifications, weight, and vendor offers.`;
}

export function itemMetadata(item: Item): Metadata {
    const title = `${item.name} – ExfilZone Item Database`;
    const description = itemDescription(item);
    const url = absoluteUrl(`/items/${item.id}`);
    const images = [{
        url: absoluteUrl(item.images.fullsize),
        alt: `${item.name} — ${getCategoryById(item.category)?.name ?? item.category} in ExfilZone`,
    }];
    return {
        title: { absolute: title },
        description,
        alternates: { canonical: url },
        openGraph: { title, description, url, type: 'website', images },
        twitter: { card: 'summary_large_image', title, description, images },
    };
}

export function taskMetadata(task: Task, tasks: Task[]): Metadata {
    const duplicateName = tasks.some(other => other.id !== task.id && other.name === task.name);
    const name = duplicateName ? `${task.name} – ${task.objectives[0] || task.id}` : task.name;
    const title = `${name} - Task Guide`;
    const description = `Complete guide for "${name}" task in Contractors Showdown ExfilZone. View objectives, requirements, and tips.`;
    const url = absoluteUrl(`/tasks/${task.id}`);
    const images = [{
        url: getVendor(task.corpId)?.ogImage || '/og/og-image-task-manager.jpg',
        width: 1200,
        height: 630,
        alt: `${name} Task Guide - ExfilZone Assistant`,
    }];
    return {
        title,
        description,
        keywords: [task.name, 'ExfilZone task', 'task walkthrough', ...task.type],
        alternates: { canonical: url },
        openGraph: { title, description, url, type: 'website', images },
        twitter: { card: 'summary_large_image', title, description, images },
    };
}

export function breadcrumbData(entries: { name: string; path: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: entries.map((entry, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: entry.name,
            item: absoluteUrl(entry.path),
        })),
    };
}

export function guideArticleData(guide: GuideMetadata) {
    const url = absoluteUrl(`/guides/${guide.slug}`);
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: guide.title,
        description: guide.description,
        url,
        mainEntityOfPage: url,
        image: [absoluteUrl(guide.ogImageUrl || '/og-image.jpg')],
        datePublished: guide.publishedAt,
        dateModified: guide.updatedAt ?? guide.publishedAt,
        ...(guide.author ? { author: { '@type': 'Person', name: guide.author } } : {}),
        publisher: { '@type': 'Organization', name: 'ExfilZone Assistant', url: SITE_URL },
    };
}

// Data can contain markup. Escaping '<' prevents a name or description closing the script tag.
export function serializeJsonLd(data: unknown): string {
    return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function guideMetadata(guide: GuideMetadata): Metadata {
    const url = absoluteUrl(`/guides/${guide.slug}`);

    return {
        title: `${guide.title}`,
        description: guide.description,
        alternates: { canonical: url },
        openGraph: {
            title: guide.title,
            description: guide.description,
            type: 'article',
            publishedTime: guide.publishedAt,
            modifiedTime: guide.updatedAt ?? guide.publishedAt,
            authors: guide.author ? [guide.author] : undefined,
            tags: guide.tags,
            url: url,
            images: [
                {
                    url: guide.ogImageUrl || '/og-image.jpg',
                    width: 1200,
                    height: 630,
                    alt: guide.title,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            images: [guide.ogImageUrl || '/og-image.jpg'],
            title: guide.title,
            description: guide.description,
        },
    };
}
