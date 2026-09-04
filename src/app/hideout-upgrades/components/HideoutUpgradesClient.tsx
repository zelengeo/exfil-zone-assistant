'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useFetchItems } from '@/hooks/useFetchItems';
import {
    AREAS,
    MAIN_FLOOR,
    TOTAL_UPGRADES,
    UPGRADES,
    type UpgradeId,
    type Zone,
    areaLevelsOf,
    roomName,
    roomSummaries,
    upgradeId,
    zonesOf,
} from '../utils/hideout';
import { useHideoutProgress } from '../hooks/useHideoutProgress';
import FloorPlate from './FloorPlate';
import MaterialsPanel from './MaterialsPanel';
import RoomRail from './RoomRail';
import ZoneList from './ZoneList';
import ZonePane from './ZonePane';

interface HideoutUpgradesClientProps {
    /** Task names by the game's own quest id, joined on the server — see `page.tsx`. */
    questNames: Record<string, string>;
}

/**
 * The route's state: which room is open, which zone is selected, and how the phone sorts its list.
 *
 * Progress is not here — it lives in `useHideoutProgress`, so the plate, the rail, the pane and the
 * materials list all read one store rather than a value threaded down from this component. What is
 * left is genuinely view state, and it is deliberately not in the URL: a half-built hideout is not
 * a thing anyone shares, and the progress that would give a shared link meaning never leaves the
 * device anyway.
 */
export default function HideoutUpgradesClient({ questNames }: HideoutUpgradesClientProps) {
    const { getItemById } = useFetchItems();
    const { built, hydrated, setBuilt, reset } = useHideoutProgress();

    const [openRoom, setOpenRoom] = useState<string>(MAIN_FLOOR);
    const [selected, setSelected] = useState<UpgradeId | null>(null);
    const [readyFirst, setReadyFirst] = useState(true);

    const levels = useMemo(() => areaLevelsOf(built), [built]);
    const zones = useMemo(() => zonesOf(openRoom, levels, built), [openRoom, levels, built]);
    const rooms = useMemo(() => roomSummaries(built), [built]);

    /** The level a pin opens on: the next one to build, or the top one when the zone is finished. */
    const openLevelOf = useCallback((areaId: string) => {
        const current = levels[areaId] ?? 0;
        return upgradeId(areaId, current + 1) ?? upgradeId(areaId, Math.max(1, current));
    }, [levels]);

    const selectZone = useCallback((zone: Zone) => {
        if (zone.state === 'room') {
            setOpenRoom((previous) => (previous === zone.areaId ? MAIN_FLOOR : zone.areaId));
            setSelected(null);
            return;
        }
        setSelected(openLevelOf(zone.areaId));
    }, [openLevelOf]);

    /** Jump to whatever is standing in the selected zone's way, switching rooms if it lives elsewhere. */
    const goToArea = useCallback((areaId: string) => {
        const id = openLevelOf(areaId);
        if (!id) return;
        const room = UPGRADES[id].categoryId;
        if (room !== openRoom) setOpenRoom(room);
        setSelected(id);
    }, [openLevelOf, openRoom]);

    const goToLevel = useCallback((level: number) => {
        if (!selected) return;
        const id = upgradeId(UPGRADES[selected].areaId, level);
        if (id) setSelected(id);
    }, [selected]);

    /**
     * Building advances to the next level, so a run of upgrades in one zone is a run of clicks in
     * one place. There is nothing above the top level, and `upgradeId` answering null is what says
     * so — which is why it has to stay total.
     */
    const build = useCallback((isBuild: boolean) => {
        if (!selected) return;
        setBuilt(selected, isBuild);
        if (isBuild) {
            const { areaId, level } = UPGRADES[selected];
            const next = upgradeId(areaId, level + 1);
            if (next) setSelected(next);
        }
    }, [selected, setBuilt]);

    const openRoomChanged = useCallback((roomId: string) => {
        setOpenRoom(roomId);
        setSelected(null);
    }, []);

    const resetAll = useCallback(() => {
        reset();
        setSelected(null);
    }, [reset]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const selectedArea = selected ? UPGRADES[selected].areaId : null;
    const percent = hydrated ? (built.size / TOTAL_UPGRADES) * 100 : 0;

    return (
        <Layout fullWidth containerClassName="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
            <div className="flex flex-wrap items-end gap-x-5 gap-y-4">
                <div className="min-w-0 flex-1">
                    <span className="eyebrow">
                        Hideout · {TOTAL_UPGRADES} upgrades · {AREAS.length} zones · {rooms.length} rooms
                    </span>
                    <h1 className="mt-2 font-display text-3xl font-extrabold uppercase leading-none tracking-[0.015em] text-ink-hi sm:text-4xl">
                        Hideout
                    </h1>
                </div>

                <div className="flex-none text-right">
                    <span className="micro-label">Built</span>
                    <div className="tabular my-1.5 font-display text-2xl font-bold leading-none text-ink-100 sm:text-[27px]">
                        {hydrated ? built.size : '—'}<span className="text-ink-700">/{TOTAL_UPGRADES}</span>
                    </div>
                    <span className="block h-[3px] w-[186px] bg-track">
                        <span className="block h-[3px] bg-good transition-[width] duration-300" style={{ width: `${percent}%` }} />
                    </span>
                </div>
            </div>

            <div className="mt-4 grid min-h-0 gap-3 shell:grid-cols-[minmax(0,1fr)_420px]">
                {/* The plate leads on desktop and the rail sits under it; on the phone the rail is
                    the top chrome and the plate is the picture below it. */}
                <div className="flex min-w-0 flex-col gap-3">
                    <div className="order-1 shell:order-2">
                        <RoomRail rooms={rooms} openRoom={openRoom} onOpen={openRoomChanged} hydrated={hydrated} />
                    </div>

                    <div className="order-2 shell:order-1">
                        <FloorPlate
                            room={openRoom}
                            zones={zones}
                            selectedArea={selectedArea}
                            onSelect={selectZone}
                            onReset={resetAll}
                            hydrated={hydrated}
                            anyBuilt={hydrated && built.size > 0}
                        />
                    </div>

                    <div className="order-3">
                        <ZoneList
                            zones={zones}
                            selectedArea={selectedArea}
                            onSelect={selectZone}
                            readyFirst={readyFirst}
                            onReadyFirstChange={setReadyFirst}
                            roomLabel={openRoom === MAIN_FLOOR ? 'Main floor' : roomName(openRoom)}
                        />
                    </div>
                </div>

                <ZonePane
                    upgrade={selected ? UPGRADES[selected] : null}
                    levels={levels}
                    built={built}
                    questNames={questNames}
                    getItemById={getItemById}
                    onClose={() => setSelected(null)}
                    onLevel={goToLevel}
                    onBuild={build}
                    onGoToArea={goToArea}
                />
            </div>

            <MaterialsPanel built={built} levels={levels} getItemById={getItemById} hydrated={hydrated} />
        </Layout>
    );
}