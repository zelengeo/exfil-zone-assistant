import {Metadata} from 'next';
import {Suspense} from 'react';
import Layout from "@/components/layout/Layout";
import {fetchTasks} from '@/services/TaskService';
import HideoutUpgradesClient from './components/HideoutUpgradesClient';

export const metadata: Metadata = {
    title: 'Hideout Upgrades Calculator',
    description: 'Plan and calculate your hideout upgrades, view costs, and track required items for each upgrade level',
    keywords: ["hideout", "upgrades", "upgrade costs"],
    openGraph: {
        title: 'Hideout Upgrades Calculator',
        description: 'Plan and calculate your hideout upgrades, view costs, and track required items for each upgrade level.',
        type: 'website',
        images: [
            {
                url: '/og/og-image-hideout.jpg',
                width: 1200,
                height: 630,
                alt: 'Hideout Upgrades Calculator',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Hideout Upgrades Calculator - ExfilZone Assistant',
        description: 'Plan and calculate your hideout upgrades.',
    },
    alternates: {
        canonical: '/hideout-upgrades',
    },
};

function HideoutLoading() {
    return (
        <Layout fullWidth containerClassName="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
            <span className="eyebrow">Hideout</span>
            <h1 className="mt-2 font-display text-3xl font-extrabold uppercase leading-none tracking-[0.015em] text-ink-hi sm:text-4xl">
                Hideout
            </h1>
            <div className="mt-4 grid gap-3 shell:grid-cols-[minmax(0,1fr)_420px]">
                <div className="aspect-[2/1] w-full animate-pulse border border-line-800 bg-steel-850" />
                <div className="hidden animate-pulse border border-line-900 bg-steel-900 shell:block" />
            </div>
        </Layout>
    );
}

/**
 * The names behind the quest ids an upgrade is gated on, joined on the task's own `gameId`.
 *
 * Built here rather than in the client, and that is the whole point of the prop: this route needs
 * 227 names and nothing else from the task database, but importing `tasksData` inside the client
 * tree put the entire 431 KB module in the hideout bundle. A module boundary is not a server
 * boundary — the page is, so the join happens once at build time and 7 KB of names travel instead.
 */
async function questNames(): Promise<Record<string, string>> {
    const names: Record<string, string> = {};
    for (const task of Object.values(await fetchTasks())) {
        if (task.gameId) names[task.gameId] = task.name;
    }
    return names;
}

export default async function HideoutUpgradesPage() {
    return (
        <Suspense fallback={<HideoutLoading />}>
            <HideoutUpgradesClient questNames={await questNames()} />
        </Suspense>
    );
}