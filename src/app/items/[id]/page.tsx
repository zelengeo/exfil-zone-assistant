'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import {
    AnyItem,
    Item,
    formatWeight,
    getCategoryById,
} from '@/types/items';
import RarityBadge from '@/components/items/RarityBadge';
import { getItemById } from '@/services/ItemService';
import {
    isAmmunition,
    isAnyItem,
    isArmor,
    isAttachment,
    isBackpack,
    isGrenade,
    isHolster,
    isMedicine,
    isMisc,
    isProvisions,
    isTaskItem,
    isWeapon,
} from '@/app/combat-sim/utils/types';
import WeaponSpecificStats from '@/app/items/[id]/components/WeaponSpecificStats';
import AmmunitionSpecificStats from '@/app/items/[id]/components/AmmunitionSpecificStats';
import GrenadeSpecificStats from '@/app/items/[id]/components/GrenadeSpecificStats';
import MedicineSpecificStats from '@/app/items/[id]/components/MedicineSpecificStats';
import ArmorSpecificStats from '@/app/items/[id]/components/ArmorSpecificStats';
import AttachmentSpecificStats from '@/app/items/[id]/components/AttachmentSpecificStats';
import ProvisionsSpecificStats from '@/app/items/[id]/components/ProvisionsSpecificStats';
import TaskItemsSpecificStats from '@/app/items/[id]/components/TaskItemsSpecificStats';
import BackpackSpecificStats from '@/app/items/[id]/components/BackpackSpecificStats';
import HolsterSpecificStats from '@/app/items/[id]/components/HolsterSpecificStats';
import VendorLedger from '@/components/trade/VendorLedger';
import WantedInBarter from '@/components/trade/WantedInBarter';
import { useTradeIndex } from '@/app/items/hooks/useTradeIndex';
import { ItemImage } from '@/app/items/components/ItemImage';

/**
 * One item, in full.
 *
 * This is where the evidence lives: the vendor ledger, the protection viewers, the parts tree. The
 * card next door answers "which of these should I look at"; this page answers everything after
 * that, and is allowed to be long because the reader has already chosen.
 */

// Helper to render stats based on item category
const renderCategorySpecificStats = (item: AnyItem) => {
    switch (item.category) {
        case 'weapons':
            if (isWeapon(item)) return <WeaponSpecificStats item={item} />;
            break;
        case 'ammo':
            if (isAmmunition(item)) return <AmmunitionSpecificStats item={item} />;
            break;
        case 'attachments':
            if (isAttachment(item)) return <AttachmentSpecificStats item={item} />;
            break;
        case 'grenades':
            if (isGrenade(item)) return <GrenadeSpecificStats item={item} />;
            break;
        case 'gear':
            if (isArmor(item)) return <ArmorSpecificStats item={item} />;
            if (isBackpack(item)) return <BackpackSpecificStats item={item} />;
            if (isHolster(item)) return <HolsterSpecificStats item={item} />;
            break;
        case 'medicine':
            if (isMedicine(item)) return <MedicineSpecificStats item={item} />;
            break;
        case 'provisions':
            if (isProvisions(item)) return <ProvisionsSpecificStats item={item} />;
            break;
        case 'task-items':
            if (isTaskItem(item)) return <TaskItemsSpecificStats item={item} />;
            break;
        default:
            return null;
    }
};

function SectionHeading({ children }: { children: React.ReactNode }) {
    return <h2 className="eyebrow mb-3">{children}</h2>;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ItemDetail({ params }: PageProps) {
    const { id } = React.use(params);
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const trade = useTradeIndex();

    useEffect(() => {
        const loadItem = async () => {
            try {
                const itemData = await getItemById(id);
                setItem(itemData || null);
            } catch (error) {
                console.error('Failed to load item:', error);
            } finally {
                setLoading(false);
            }
        };

        loadItem();
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-96">
                        <div className="bg-steel-900 border border-line-900 p-8 text-center">
                            <div className="eyebrow mb-2">Loading</div>
                            <p className="text-sm text-ink-500">Retrieving item data…</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!item) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-96">
                        <div className="bg-steel-900 border border-line-900 border-l-2 border-l-ember p-8 text-center">
                            <div className="eyebrow text-ember mb-2">Not found</div>
                            <p className="text-sm text-ink-400">No item is published under that id.</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    const category = getCategoryById(item.category);
    const wantedIn = trade.wantedIn(item.id);

    // Misc items have no specifications and often no description, which would leave the right
    // column an empty half-page. Where there is nothing to put in it, do not reserve it.
    const hasEvidence = Boolean(item.description) || (!isMisc(item) && isAnyItem(item)) || Boolean(item.tips);

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb navigation */}
                <nav className="flex items-center gap-2 mb-6 text-xs text-ink-600">
                    <Link href="/items" className="flex items-center gap-1 hover:text-ink-200 transition-colors">
                        <ChevronLeft size={14} />
                        <span>Items</span>
                    </Link>
                    <span className="text-ink-800">/</span>
                    <Link
                        href={`/items?category=${item.category}`}
                        className="hover:text-ink-200 transition-colors"
                    >
                        {category?.name}
                    </Link>
                    {item.subcategory && (
                        <>
                            <span className="text-ink-800">/</span>
                            <Link
                                href={`/items?category=${item.category}&subcategory=${item.subcategory}`}
                                className="hover:text-ink-200 transition-colors"
                            >
                                {item.subcategory}
                            </Link>
                        </>
                    )}
                </nav>

                {/* Item header */}
                <header className="mb-8">
                    <div className="flex items-baseline gap-3 mb-1">
                        <RarityBadge rarity={item.stats.rarity} variant="chip" />
                        <span className="micro-label text-ink-700">
                            {item.subcategory || category?.name}
                        </span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-ink-hi leading-none">{item.name}</h1>
                </header>

                <div
                    className={
                        hasEvidence
                            ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] gap-6'
                            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start'
                    }
                >
                    {/* Left column - the subject */}
                    <div className={hasEvidence ? 'space-y-6' : 'contents'}>
                        <div className="bg-steel-900 border border-line-900 p-4">
                            <div className="aspect-square relative bg-steel-850 border border-line-800 plot-grid overflow-hidden">
                                <ItemImage
                                    item={item}
                                    size="fullsize"
                                    className="w-full h-full"
                                    showZoom={false}
                                />
                            </div>
                            <div className="flex items-baseline justify-between mt-4 pt-3 border-t border-line-900">
                                <span className="eyebrow">Weight</span>
                                <span className="font-mono tabular text-sm text-ink-200">
                                    {formatWeight(item.stats.weight)}
                                </span>
                            </div>
                        </div>

                        <VendorLedger stats={item.stats} resolve={trade.itemOf} />

                        <WantedInBarter uses={wantedIn} resolve={trade.itemOf} />
                    </div>

                    {/* Right column - the evidence */}
                    {hasEvidence && (
                    <div className="space-y-6 min-w-0">
                        {item.description && (
                            <section className="bg-steel-900 border border-line-900 p-5">
                                <SectionHeading>Description</SectionHeading>
                                <p className="text-sm text-ink-300 leading-relaxed">{item.description}</p>
                            </section>
                        )}

                        {!isMisc(item) && isAnyItem(item) && (
                            <section className="bg-steel-900 border border-line-900 p-5">
                                <SectionHeading>Specifications</SectionHeading>
                                {renderCategorySpecificStats(item)}
                            </section>
                        )}

                        {item.tips && (
                            <section className="bg-steel-900 border border-line-900 border-l-2 border-l-info p-5">
                                <SectionHeading>Tactical tips</SectionHeading>
                                <p className="text-sm text-ink-300 leading-relaxed">{item.tips}</p>
                            </section>
                        )}
                    </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
