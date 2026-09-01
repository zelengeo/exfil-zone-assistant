'use client';

import React from "react";
import Link from "next/link";
import {ChevronsLeftRight, ChevronsUpDown, Crosshair, HelpCircle, Info, Shield, Snail, Timer, Wrench, Zap} from "lucide-react";
import {FIRE_MODE_CONFIG, Weapon} from "@/types/items";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import GunsmithStats from "@/components/gunsmith/GunsmithStats";
import BuildSlotList from "@/components/gunsmith/BuildSlotList";
import BuildSummary from "@/components/gunsmith/BuildSummary";
import {useWeaponBuild} from "@/app/items/hooks/useWeaponBuild";
import StatLine, {StatGrid, StatPanel} from "./StatLine";

/**
 * A weapon, as the bench sees it.
 *
 * The banded stat block, the parts tree and the build summary are the gunsmith's own components,
 * rendered read-only — `BuildSlotList` already treats an omitted `onSelectSlot` as "this is a fact,
 * not a thing you edit". Nothing here recomputes anything the bench computes.
 *
 * The ballistics below the build are the half of this page the bench does not cover: the numbers
 * that belong to the gun rather than to the build.
 */
export default function WeaponSpecificStats({item}: { item: Weapon }) {
    const {build, data, weaponClass, gunsmithHref, loading} = useWeaponBuild(item);

    return (
        <div className="space-y-5">
            {/* The build — the same six numbers, from the same code, as the bench. */}
            {build && data && (
                <div className="space-y-3">
                    <div className="flex items-baseline justify-between gap-3">
                        <span className="eyebrow">Preset performance</span>
                        {gunsmithHref && (
                            <Link
                                href={gunsmithHref}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-ember hover:bg-ember-hover text-ember-ink micro-label transition-colors"
                            >
                                <Wrench size={11} aria-hidden="true"/>
                                Open in gunsmith
                            </Link>
                        )}
                    </div>
                    <GunsmithStats display={build.display} bands={data.bands} weaponClass={weaponClass}/>
                </div>
            )}

            {loading && (
                <p className="eyebrow text-ink-700">Loading build…</p>
            )}

            {build && (
                <>
                    <StatPanel title="Parts" className="p-0">
                        <BuildSlotList
                            receiver={build.receiver}
                            slots={build.slots}
                            universal={build.universal}
                        />
                    </StatPanel>
                    <BuildSummary parts={build.parts} weight={build.sim.weight}/>
                </>
            )}

            {/* Ballistics: the gun's own numbers, which no build changes. */}
            <StatPanel title="Ballistics">
                <StatGrid>
                    <StatLine icon={<Zap size={14}/>} label="Fire rate" value={`${item.stats.fireRate} rpm`}/>
                    <StatLine
                        icon={<Crosshair size={14}/>}
                        label="MOA"
                        value={item.stats.MOA?.toFixed(2) ?? 'N/A'}
                    />
                    <StatLine icon={<Shield size={14}/>} label="Caliber" value={item.stats.caliber} text/>
                    <StatLine
                        icon={<Timer size={14}/>}
                        label="Ergonomics"
                        value={`${(item.stats.ergonomics * 100).toFixed(0)}%`}
                    />
                    <StatLine
                        icon={<Info size={14}/>}
                        label="Fire mode"
                        value={FIRE_MODE_CONFIG[item.stats.fireMode]}
                        text
                    />
                    <StatLine
                        icon={<Snail size={14}/>}
                        label="ADS speed"
                        value={`${(item.stats.ADSSpeed * 100).toFixed(0)}%`}
                    />
                    <StatLine
                        icon={<ChevronsUpDown size={14}/>}
                        label="Vertical recoil control"
                        value={`${(item.stats.recoilParameters.verticalRecoilControl * 100).toFixed(0)}%`}
                    />
                    <StatLine
                        icon={<ChevronsLeftRight size={14}/>}
                        label="Horizontal recoil control"
                        value={`${(item.stats.recoilParameters.horizontalRecoilControl * 100).toFixed(0)}%`}
                    />
                    <StatLine
                        icon={
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle size={14} className="cursor-help"/>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-64">
                                    The more the better. Ammo penetration power is affected by
                                    firing power − 0.5.
                                </TooltipContent>
                            </Tooltip>
                        }
                        label="Firing power"
                        value={item.stats.firingPower}
                    />
                </StatGrid>
            </StatPanel>
        </div>
    );
}
