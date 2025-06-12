import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import {
    CombatSimulation,
    AttackerSetup,
    DefenderSetup,
    isWeapon,
    isAmmunition,
    areWeaponAmmoCompatible, isBodyArmor, isHelmet, isFaceShield, isDisplayMode
} from '../utils/types';
import {useFetchItems} from "@/hooks/useFetchItems";
import {BodyArmor, FaceShield, Helmet} from "@/types/items";

// interface UrlParamConfig {
    // Attackers: a1w=weaponId&a1a=ammoId&a2w=weaponId&a2a=ammoId...
    // Defender: da=armor&dh=helmet&df=faceShield&dad=armorDurability&dhd=helmetDurability
    // Settings: r=range&d=displayMode&s=sortBy
// }

export function useCombatSimUrlParams() {
    const { items } = useFetchItems();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Parse URL params into simulation state
    const parseUrlParams = useCallback((): Partial<CombatSimulation> => {
        const params = new URLSearchParams(searchParams.toString());
        const result: Partial<CombatSimulation> = {};

        // Parse attackers
        const attackers: AttackerSetup[] = [];
        for (let i = 0; i < 4; i++) {
            const weaponId = params.get(`a${i}w`);
            const ammoId = params.get(`a${i}a`);

            const attacker = {
                id: String(i),
                weapon: weaponId ? items.find(item => (item.id === weaponId) && isWeapon(item)) : null,
                ammo: ammoId ? items.find(item => (item.id === ammoId) && isAmmunition(item)) : null
            } as AttackerSetup;

            if (areWeaponAmmoCompatible(attacker.weapon, attacker.ammo)) attackers.push(attacker);

        }

        if (attackers.length > 0) {
            result.attackers = attackers;
        }

        // Parse defender armor
        const defenderParams: Partial<DefenderSetup> = {};
        const armorId = params.get(`da`);
        defenderParams.bodyArmor = armorId ? items.find(item => (item.id === armorId) && isBodyArmor(item)) as BodyArmor : null;
        if (defenderParams.bodyArmor && params.get(`dad`)){
            // @ts-expect-error params.get(`dad`) is not null
            const durability = parseInt(params.get(`dad`));
            defenderParams.bodyArmorDurability = durability < 0 ? 0 : durability > 100 ? 100 : durability;
        }

        const helmetId = params.get(`dh`);
        defenderParams.helmet = helmetId ? items.find(item => (item.id === helmetId) && isHelmet(item)) as Helmet : null;
        if (defenderParams.helmet && params.get(`dhd`)){
            // @ts-expect-error params.get(`dhd`) is not null
            const durability = parseInt(params.get(`dhd`));
            defenderParams.helmetDurability = durability < 0 ? 0 : durability > 100 ? 100 : durability;
        }

        const faceShieldId = params.get(`df`);
        if (defenderParams.helmet && faceShieldId) {
            const faceShield = faceShieldId ? items.find(item => (item.id === faceShieldId) && isFaceShield(item)) as FaceShield : null;
            if (faceShield && defenderParams.helmet.stats.canAttach?.includes(faceShield.id)) {
                defenderParams.faceShield = faceShield;
            }
        }





        if (Object.keys(defenderParams).length > 0) {
            result.defender = defenderParams as DefenderSetup;
        }

        // Parse settings
        const range = params.get('r');
        if (range) {
            result.range = parseInt(range);
        }

        const displayMode = params.get('d');
        if (isDisplayMode(displayMode)) {
            result.displayMode = displayMode
        }

        //TODO - Sort by
        // const sortBy = params.get('s');
        // if (sortBy && ['time', 'shots', 'cost'].includes(sortBy)) {
        //     result.sortBy = sortBy as any;
        // }

        return result;
    }, [searchParams, items]);

    // Update URL with current simulation state
    const updateUrlParams = useCallback((simulation: CombatSimulation) => {
        const params = buildUrlParams(simulation);

        // Update URL without navigation
        const newUrl = `${pathname}?${params.toString()}`;
        router.replace(newUrl, { scroll: false });
    }, [router, pathname]);

    // Generate shareable link
    const getShareableLink = useCallback((simulation: CombatSimulation): string => {
        const params = buildUrlParams(simulation);

        const baseUrl = typeof window !== 'undefined'
            ? `${window.location.origin}${pathname}`
            : '';

        return `${baseUrl}?${params.toString()}`;
    }, [pathname]);

    return {
        parseUrlParams,
        updateUrlParams,
        getShareableLink
    };
}

function buildUrlParams( simulation: CombatSimulation) {
    const params = new URLSearchParams();

    // Add attackers
    simulation.attackers.forEach((attacker, index) => {
        const num = index + 1;
        if (attacker.weapon) {
            params.set(`a${num}w`, attacker.weapon.id);
        }
        if (attacker.ammo) {
            params.set(`a${num}a`, attacker.ammo.id);
        }
    });

    if (simulation.defender.bodyArmor) {
        params.set('da', simulation.defender.bodyArmor.id);
        if (simulation.defender.bodyArmorDurability) {
            params.set('dad', simulation.defender.bodyArmorDurability.toString());
        }
    }

    if (simulation.defender.helmet) {
        params.set('dh', simulation.defender.helmet.id);
        if (simulation.defender.helmetDurability) {
            params.set('dhd', simulation.defender.helmetDurability.toString());
        }
        if (simulation.defender.faceShield) {
            params.set('df', simulation.defender.faceShield.id);
        }
    }

    // Add settings
    params.set('r', simulation.range.toString());
    params.set('d', simulation.displayMode);
    // TODO - Sort by
    // params.set('s', simulation.sortBy);

    return params;
}