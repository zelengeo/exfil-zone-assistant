'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CopyPlus, Pencil, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { SavedBuild } from '@/types/gunsmith';
import ShareButton from '@/components/ShareButton';
import { Button } from '@/components/ui/button';
import { fittedToSavedParts } from '@/lib/gunsmith/build';
import BuildSlotList from '@/components/gunsmith/BuildSlotList';
import BuildSummary from '@/components/gunsmith/BuildSummary';
import GunsmithStats from '@/components/gunsmith/GunsmithStats';
import PartPicker from '@/components/gunsmith/PartPicker';
import { useGunsmithBuild, useSlotCandidates } from '../hooks/useGunsmithBuild';
import { useSavedBuilds } from '../hooks/useSavedBuilds';
import SavedBuildsRail from './SavedBuildsRail';
import WeaponPicker from './WeaponPicker';

export default function GunsmithClient() {
    const state = useGunsmithBuild();
    const picker = useSlotCandidates(state);
    const saved = useSavedBuilds();

    const [renaming, setRenaming] = useState(false);
    const [changingWeapon, setChangingWeapon] = useState(false);
    const [activeSavedId, setActiveSavedId] = useState<string | null>(null);

    // Below the three-column breakpoint the picker sits under the bench, so picking a slot would
    // otherwise look like nothing happened.
    const pickerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!state.selectedSlot) return;
        if (window.matchMedia('(min-width: 1280px)').matches) return;
        pickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [state.selectedSlot]);

    if (state.error) {
        return (
            <div className="bg-steel-800 border border-line-800 p-6">
                <h1 className="font-display uppercase text-ink-100 text-xl mb-2">Gunsmith unavailable</h1>
                <p className="text-ink-400 text-sm">{state.error}</p>
            </div>
        );
    }

    if (!state.build || !state.receiver || !state.data) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="bg-steel-800 border border-line-800 px-6 py-5 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-info border-t-transparent mx-auto mb-3" />
                    <p className="eyebrow">Loading the part graph</p>
                </div>
            </div>
        );
    }

    const { build, baseline, data } = state;

    /**
     * `asNew` is the difference between editing a build and forking one. Opening a saved build and
     * pressing Save updates it in place, which is what you want nine times in ten — and exactly
     * what you do not want the tenth, when the old one was worth keeping.
     */
    const handleSave = (asNew = false) => {
        const record = saved.save({
            id: asNew ? undefined : activeSavedId ?? undefined,
            name: asNew ? `${state.name.trim() || 'Untitled build'} (copy)` : state.name.trim() || 'Untitled build',
            receiverId: state.receiver!.gameId.toLowerCase(),
            basePresetId: state.preset?.id,
            parts: fittedToSavedParts(state.fitted),
        });
        setActiveSavedId(record.id);
        if (asNew) state.rename(record.name);
        toast.success(asNew ? `Saved a copy as "${record.name}"` : `Saved "${record.name}"`);
    };

    const handleOpenSaved = (record: SavedBuild) => {
        state.loadSaved(record);
        setActiveSavedId(record.id);
    };

    const handleNew = () => {
        setActiveSavedId(null);
        state.resetToPreset();
        state.rename('New build');
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[220px_minmax(0,1fr)_400px] gap-3 items-start">
            <SavedBuildsRail
                builds={saved.builds}
                ready={saved.ready}
                activeId={activeSavedId}
                onOpen={handleOpenSaved}
                onDelete={(id) => {
                    saved.remove(id);
                    if (id === activeSavedId) setActiveSavedId(null);
                }}
                onNew={handleNew}
                className="xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)]"
            />

            <div className="min-w-0 space-y-3">
                {/* Header: the gun on one line, the build's own name on the next. */}
                <header className="bg-steel-900 border border-line-900 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] tracking-eyebrow uppercase text-ink-600">
                            {[state.receiver.name, build.display.caliber]
                                .filter(Boolean)
                                .join(' · ')}
                        </span>
                        <button
                            type="button"
                            onClick={() => setChangingWeapon(true)}
                            className="micro-label border border-line-500 text-ink-400 hover:text-ink-100 hover:border-line-300 px-2 py-1 transition-colors"
                        >
                            Change base weapon
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        {renaming ? (
                            <input
                                autoFocus
                                value={state.name}
                                onChange={(event) => state.rename(event.target.value)}
                                onBlur={() => setRenaming(false)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === 'Escape') setRenaming(false);
                                }}
                                aria-label="Build name"
                                className="font-display font-bold uppercase tracking-tight text-2xl text-ink-hi bg-transparent border-b border-line-500 focus:border-ember px-0 min-h-0 py-0 flex-1 min-w-0"
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => setRenaming(true)}
                                className="group flex items-center gap-2 min-w-0"
                            >
                                <h1 className="font-display font-bold uppercase tracking-tight text-2xl text-ink-hi truncate">
                                    {state.name}
                                </h1>
                                <Pencil size={13} className="text-ink-700 group-hover:text-ink-400 shrink-0" />
                            </button>
                        )}

                        <div className="flex items-center gap-2 ml-auto">
                            {state.preset && (
                                <Button
                                    type="button"
                                    variant="quiet"
                                    size="micro"
                                    onClick={() => {
                                        state.resetToPreset();
                                        toast.info('Back to the factory preset');
                                    }}
                                    disabled={!state.dirty}
                                >
                                    <RotateCcw />
                                    Reset
                                </Button>
                            )}
                            <ShareButton
                                getShareLink={state.shareLink}
                                title="Share"
                                variant="quiet"
                                size="micro"
                            />
                            {activeSavedId && (
                                <Button
                                    type="button"
                                    variant="quiet"
                                    size="micro"
                                    onClick={() => handleSave(true)}
                                >
                                    <CopyPlus />
                                    Save as new
                                </Button>
                            )}
                            {/* The one ember on this screen. */}
                            <Button
                                type="button"
                                variant="ember"
                                size="micro"
                                onClick={() => handleSave(false)}
                            >
                                <Save />
                                {activeSavedId ? 'Update build' : 'Save build'}
                            </Button>
                        </div>
                    </div>

                    <BuildSummary parts={build.parts} weight={build.sim.weight} className="mt-3" />
                </header>

                <GunsmithStats
                    display={build.display}
                    baseline={baseline?.display ?? null}
                    bands={data.bands}
                    weaponClass={state.weaponClass}
                />

                <div className="bg-steel-900 border border-line-900">
                    <div className="px-3 py-2.5 border-b border-line-900 flex items-baseline justify-between">
                        <h2 className="eyebrow">Bench</h2>
                        <span className="font-mono tabular text-[10px] text-ink-700">
                            {`${build.slots.filter((slot) => slot.fitted).length}/${build.slots.length} slots filled`}
                        </span>
                    </div>
                    <BuildSlotList
                        receiver={build.receiver}
                        onChangeReceiver={() => setChangingWeapon(true)}
                        slots={build.slots}
                        universal={build.universal}
                        selectedSlotId={state.selectedSlot}
                        onSelectSlot={state.selectSlot}
                        onClearSlot={state.clear}
                    />
                </div>

                {build.warnings.length > 0 && (
                    <div className="bg-steel-900 border border-line-900 p-3">
                        <span className="eyebrow">Notes on this build</span>
                        {build.warnings.map((warning) => (
                            <p key={warning} className="text-[12px] text-warn leading-relaxed mt-1">
                                {warning}
                            </p>
                        ))}
                    </div>
                )}
            </div>

            <div
                ref={pickerRef}
                className={cn(
                    'bg-steel-900 border border-line-900 xl:sticky xl:top-4 scroll-mt-4',
                    state.selectedSlot && 'xl:h-[calc(100vh-2rem)]',
                )}
            >
                {state.selectedSlot ? (
                    <PartPicker
                        title={picker.title}
                        subtitle={picker.subtitle}
                        candidates={picker.candidates}
                        fittedGameId={picker.fittedGameId}
                        preview={picker.preview}
                        onFit={state.fit}
                        onClear={() => state.clear(state.selectedSlot as string)}
                        className="h-full"
                    />
                ) : (
                    <div className="p-4">
                        <h2 className="font-display uppercase text-ink-100 text-lg">Parts</h2>
                        <p className="text-sm text-ink-600 mt-2">
                            Pick a slot on the bench to see what fits it, and what each part would do to the
                            gun.
                        </p>
                    </div>
                )}
            </div>

            <WeaponPicker
                open={changingWeapon}
                onOpenChange={setChangingWeapon}
                presets={data.presets}
                index={data.index}
                currentId={state.preset?.id}
                currentReceiverId={build.receiver.gameId.toLowerCase()}
                onPick={(weapon) => {
                    state.loadPreset(weapon);
                    setActiveSavedId(null);
                }}
                onPickReceiver={(receiver) => {
                    state.loadReceiver(receiver);
                    setActiveSavedId(null);
                }}
            />
        </div>
    );
}

