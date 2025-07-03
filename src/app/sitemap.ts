import { MetadataRoute } from 'next';
import { tasksData } from '@/data/tasks';
import {guidesConfig} from "@/content/guides/guides-config";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.exfil-zone-assistant.app';

    const lastModified = new Date('2025-07-03');

    // Generate task page entries
    const taskPages = Object.keys(tasksData).map((taskId) => ({
        url: `${baseUrl}/tasks/${taskId}`,
        lastModified: lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
    }));

    const guidePages = guidesConfig.map((guide) => ({
        url: `${baseUrl}/guide/${guide.slug}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.6, // Guides are generally important content
    }));

    // Add other static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: lastModified,
            changeFrequency: 'monthly' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/combat-sim`,
            lastModified: lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/tasks`,
            lastModified: lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/items`,
            lastModified: lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/hideout-upgrades`,
            lastModified: lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/guides`,
            lastModified: lastModified,
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        },
    ];

    return [...staticPages, ...taskPages, ...guidePages];
}