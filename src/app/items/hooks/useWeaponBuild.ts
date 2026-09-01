'use client';

import { useEffect, useState } from 'react';
import type { Weapon } from '@/types/items';
import { getGunsmithData, type GunsmithData } from '@/services/GunsmithService';
import { findPart } from '@/lib/gunsmith/compatibility';
import { assembleBuild, encodeBuild, presetToFitted, type AssembledBuild } from '@/lib/gunsmith/build';
import { weaponClassOf } from '@/lib/gunsmith/bands';

/**
 * A weapon page's build, assembled exactly the way the bench assembles one.
 *
 * A weapon in this game is not an item, it is a *preset*: a receiver plus a parts list. So the
 * numbers on a weapon page should be the numbers the bench shows for the same preset, computed by
 * the same code — otherwise the two pages disagree about the same gun and one of them is lying.
 *
 * The gunsmith's own hook notes that "that split is what lets the weapon detail page render the
 * same build with no hook at all": everything below is a call into `lib/gunsmith`, and there is no
 * editing state because a preset is a fact rather than a thing you change here.
 */
export interface WeaponBuild {
    data: GunsmithData | null;
    build: AssembledBuild | null;
    weaponClass: string | null;
    /** Deep link that opens this exact preset on the bench, ready to edit. */
    gunsmithHref: string | null;
    loading: boolean;
}

const EMPTY: WeaponBuild = {
    data: null,
    build: null,
    weaponClass: null,
    gunsmithHref: null,
    loading: true,
};

export function useWeaponBuild(weapon: Weapon): WeaponBuild {
    const [state, setState] = useState<WeaponBuild>(EMPTY);

    useEffect(() => {
        let cancelled = false;

        getGunsmithData()
            .then((data) => {
                if (cancelled) return;

                const receiver = findPart(data.index, weapon.receiverId);
                if (!receiver) {
                    // 20 of 146 weapons ship without a receiver id. They still have their own
                    // stats; they just have no bench build to show.
                    setState({ ...EMPTY, data, loading: false });
                    return;
                }

                const fitted = presetToFitted(weapon, data.index);
                const params = new URLSearchParams({
                    b: encodeBuild(receiver, fitted),
                    n: weapon.name,
                });

                setState({
                    data,
                    build: assembleBuild(receiver, fitted, data.index),
                    weaponClass: weaponClassOf(receiver),
                    gunsmithHref: `/gunsmith?${params.toString()}`,
                    loading: false,
                });
            })
            .catch((cause: unknown) => {
                if (cancelled) return;
                console.error('Could not load the gunsmith data:', cause);
                setState({ ...EMPTY, loading: false });
            });

        return () => {
            cancelled = true;
        };
    }, [weapon]);

    return state;
}
