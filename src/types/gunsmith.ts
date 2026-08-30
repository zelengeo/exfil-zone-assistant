/**
 * The gunsmith's data model.
 *
 * A gun in this game is not an item, it is a **build**: one *receiver* plus a list of parts. The
 * receiver carries `stats.gunData` — the whole simulation base — and every other part carries only
 * an `attachmentModifier`, a delta against that base. Neither half means anything alone, which is
 * why `src/lib/gunsmith/assembly.ts` exists.
 *
 * Shapes here mirror `public/data/gunsmith-parts.json` and the rail attachments in
 * `public/data/attachments.json` exactly; nothing is renamed on the way in.
 */

import type { FireMode, RecoilParameters } from '@/types/items';

/** `AttachmentModifier` — the game's own spelling, "Modifer" typos included. */
export interface AttachmentModifier {
    ergonomicsModifier?: number;
    verticalRecoilModifier?: number;
    horizontalRecoilModifier?: number;
    accuracyModifier?: number;
    firingPowerModifier?: number;
    shotgunSpreadModifer?: number;
    ADSSpeedModifier?: number;
    headDamageScaleModifier?: number;
    damageDropModifer?: number;
    shiftMomentumModifer?: number;
    yawMomentumModifer?: number;
    pitchMomentumModifer?: number;
    rollMomentumModifer?: number;
    shiftStiffnessModifer?: number;
    yawStiffnessModifer?: number;
    pitchStiffnessModifer?: number;
    rollStiffnessModifer?: number;
}

/** The receiver's simulation base. Present on the 61 receiver parts and null on the other 590. */
export interface PartGunData {
    fireRate: number | null;
    fireRateIsDefault?: boolean;
    MOA: number | null;
    penetration?: number | null;
    ergonomics: number | null;
    firingPower: number | null;
    hitDamage?: number | null;
    headDamageScale?: number | null;
    muzzleVelocity?: number | null;
    ADSSpeed?: number | null;
    fireMode?: FireMode | null;
    fireModes?: FireMode[];
    recoilParameters?: Partial<RecoilParameters>;
    damageRangeCurve?: string | null;
    caliber?: string | null;
}

/** One trader offer. `level` is the loyalty level the offer unlocks at. */
export interface BuyOffer {
    vendor: string;
    goodsId?: string;
    level: number;
    price: number;
    bundle?: number;
    bundlePrice?: number;
    stock?: number;
    resetType?: string;
    requiresTasks?: string[];
    requiresDlc?: string[];
}

/**
 * The gunsmith compatibility graph, as the game's raw tags.
 *
 * - `installsOn` — parent gun ids this part bolts onto, matched as a **prefix**
 *   (`GunSmith.AK.LowerReceiver` covers `gunsmith.ak.lowerreceiver.ak74n`). Empty means the part
 *   is a universal rail attachment: see `RAIL_*` in `src/lib/gunsmith/compatibility.ts`.
 * - `provides` — the slot tags this part can occupy, spelled `GunSmithSlot.<Host>.<Slot>`.
 * - `requiresPartTypes` — the `EGunSmithPartType` bit set a receiver declares as essential.
 */
export interface PartCompatibility {
    installsOn: string[];
    provides: string[];
    requiresPartTypes: string[];
    tags: string[];
}

export interface GunsmithPart {
    id: string;
    gameId: string;
    name: string;
    description?: string;
    category: string;
    subcategory: string;
    family?: string;
    group?: string;
    /** `lowerreceiver`, `muzzle`, `clip`, … — the normalized slot family the part belongs to. */
    slot: string;
    partType: string | null;
    images: { icon: string; thumbnail?: string; fullsize?: string };
    stats: {
        weight: number;
        rarity: string;
        attachmentModifier: AttachmentModifier;
        partMOA?: number | null;
        capacity?: number | null;
        caliber?: string | null;
        gunData?: PartGunData | null;
        basePrice?: number;
        buyOffers?: BuyOffer[];
    };
    compatibility: PartCompatibility;
}

/** A build is a tree, but it is stored flat: every fitted part knows the slot it sits in. */
export interface FittedPart {
    /** `<parentGameId>/<slotKey>`, or `attachment/<slotKey>/<n>` for a rail attachment. */
    slotId: string;
    gameId: string;
}

/** A saved build, as it goes into localStorage. */
export interface SavedBuild {
    id: string;
    name: string;
    receiverId: string;
    /** Every fitted part, receiver excluded. */
    parts: FittedPart[];
    /** Preset this build started from, when it did. */
    basePresetId?: string;
    createdAt: string;
    updatedAt: string;
}

/** The six numbers the in-game gunsmith screen shows. */
export interface GunsmithStatKey {
    key: 'RPM' | 'ergonomics' | 'verticalRecoil' | 'horizontalRecoil' | 'firingPower' | 'spreadMOA';
}
