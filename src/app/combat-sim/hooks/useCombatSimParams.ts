import {useSearchParams, useRouter, usePathname} from 'next/navigation';
import {useCallback} from 'react';
import {
    CombatSimulation,
    AttackerSetup,
    DefenderSetup,
    isWeapon,
    isAmmunition,
    areWeaponAmmoCompatible, isBodyArmor, isHelmet, isFaceShield, isDisplayMode
} from '../utils/types';
import {useFetchItems} from "@/hooks/useFetchItems";

// interface UrlParamConfig {
// Attackers: a1w=weaponId&a1a=ammoId&a2w=weaponId&a2a=ammoId...
// Defender: da=armor&dh=helmet&df=faceShield&dad=armorDurability&dhd=helmetDurability
// Settings: r=range&d=displayMode&s=sortBy
// }

export function useCombatSimUrlParams() {
    const {getItemById} = useFetchItems();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Parse URL params into simulation state
    const parseUrlParams = useCallback((): Partial<CombatSimulation> => {
        const params = new URLSearchParams(searchParams.toString());
        const result: Partial<CombatSimulation> = {};

        // Parse attackers
        const attackers: AttackerSetup[] = [];
        for (let i = 0; i <= 3; i++) {
            const weaponId = params.get(`a${i}w`);
            const ammoId = params.get(`a${i}a`);

            if (weaponId) {
                const weapon = getItemById(weaponId);
                const ammo = ammoId && getItemById(ammoId);

                if (weapon && isWeapon(weapon) && ammo && isAmmunition(ammo) && areWeaponAmmoCompatible(weapon, ammo)) attackers.push({
                    id: String(i),
                    weapon,
                    ammo
                } as AttackerSetup)
            }

        }

        if (attackers.length > 0) {
            result.attackers = attackers;
        }

        // Parse defender armor
        const defenderParams: Partial<DefenderSetup> = {};
        const armorId = params.get(`da`);
        if (armorId) {
            const armor = getItemById(armorId);
            if (armor && isBodyArmor(armor)) {
                defenderParams.bodyArmor = armor;
                if (params.get(`dad`)) {
                    // @ts-expect-error params.get(`dad`) is not null
                    const durability = parseInt(params.get(`dad`));
                    defenderParams.bodyArmorDurability = durability < 0 ? 0 : durability > 100 ? 100 : durability;
                }
            }
        }


        const helmetId = params.get(`dh`);
        if (helmetId) {
            const helmet = getItemById(helmetId);
            if (helmet && isHelmet(helmet)) {
                defenderParams.helmet = helmet;
                if (params.get(`dhd`)) {
                    // @ts-expect-error params.get(`dhd`) is not null
                    const durability = parseInt(params.get(`dhd`));
                    defenderParams.helmetDurability = durability < 0 ? 0 : durability > 100 ? 100 : durability;
                }

                const faceShieldId = params.get(`df`);
                if (faceShieldId) {
                    const faceShield = getItemById(faceShieldId);
                    if (faceShield && isFaceShield(faceShield) && defenderParams.helmet.stats.canAttach?.includes(faceShield.id)) {
                        defenderParams.faceShield = faceShield;
                    }
                }
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
    }, [searchParams, getItemById]);

    // Update URL with current simulation state
    const updateUrlParams = useCallback((simulation: CombatSimulation) => {
        const params = buildUrlParams(simulation);

        // Update URL without navigation
        const newUrl = `${pathname}?${params.toString()}`;
        router.push(newUrl, {scroll: false});
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

function buildUrlParams(simulation: CombatSimulation) {
    const params = new URLSearchParams();

    // Add attackers
    simulation.attackers.forEach((attacker, index) => {
        if (attacker.weapon) {
            params.set(`a${index}w`, attacker.weapon.id);
        }
        if (attacker.ammo) {
            params.set(`a${index}a`, attacker.ammo.id);
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