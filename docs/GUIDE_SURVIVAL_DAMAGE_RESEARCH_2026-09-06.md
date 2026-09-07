# Survival & Damage Mechanics — source audit

**Issue:** [#11 — verify and refresh survival and damage mechanics](https://github.com/zelengeo/exfil-zone-assistant/issues/11)  
**Researched:** 2026-09-06  
**Purpose:** Establish which claims can survive the guide rewrite. This is evidence, not the guide copy.

## Evidence boundary

Only first-party public material and the game's shipped data/code are used here. The public sources
are Caveman Studio's official site and the developer-owned Steam listing. The technical sources are
the current PAK-derived catalogue and body model in this repository, plus the extraction repository's
version-pinned records of the source assets and decompilation. Community wikis, videos, Reddit and
player anecdotes are deliberately excluded.

A named field or item description proves what the current data publishes. It does not by itself
prove the runtime algorithm that consumes the field. Runtime claims below are marked confirmed only
where the damage path was traced. This distinction matters most for `BleedingChance`, painkiller
perks and suturing.

Primary sources:

- Caveman Studio's current Steam description confirms limb damage, bleeding, medical supplies, and
  that staying hydrated and fed supports stamina: [official Steam product page](https://store.steampowered.com/app/2719160/Contractors_Showdown/).
- Caveman Studio's medical-system announcement says Deep Wound drains health and hydration until
  treated, and introduced suture devices, advanced bandages and tiered painkillers:
  [official April 2025 wipe report](https://www.contractorsvr.com/single-post/situation-report-exfilzone-wipe-update).
- Catalogue provenance and update rules: [`public/data/AGENTS.md`](../public/data/AGENTS.md).
- Current item and ammunition data: [`medical.json`](../public/data/medical.json),
  [`provisions.json`](../public/data/provisions.json), and
  [`ammunition.json`](../public/data/ammunition.json).
- Body mapping and HP constants ported from the shipped model:
  [`bodyModel.ts`](../src/lib/protection/bodyModel.ts#L1) and
  [`body-model.json`](../public/data/body-model.json).
- Version-pinned extraction evidence (build
  `oculus-5.5.3-release-1.108.0-v76.0-CL-0`):
  [medical extraction metadata](https://github.com/zelengeo/exfil-zone-assistant-extraction/blob/7f327429bb9b43c94e531f5d475cc8897061b98b/csv/medical.meta.json),
  [medical asset rows](https://github.com/zelengeo/exfil-zone-assistant-extraction/blob/7f327429bb9b43c94e531f5d475cc8897061b98b/csv/medical.csv), and
  [decompiled damage model](https://github.com/zelengeo/exfil-zone-assistant-extraction/blob/7f327429bb9b43c94e531f5d475cc8897061b98b/docs/DAMAGE_MODEL.md#L377-L574).

## Claim ledger

| Topic | Finding | Rewrite disposition |
|---|---|---|
| Collision model | Bullets can hit **13 collision capsules**: pelvis; four spine/head capsules; left/right upper and lower arms; left/right thighs and calves. Hands, feet and neck have no separate collision capsule. The shipped JSON contains 13 capsule records, and the hook describes the same 69-bone/13-capsule model. [`body-model.json`](../public/data/body-model.json) [`useBodyModel.ts`](../src/hooks/useBodyModel.ts#L5) | Say “13 zones/collision capsules,” not “seven body zones.” In combat UI vocabulary, a **zone** is one collision capsule. |
| HP model | Those 13 capsules resolve into **seven HP pools**: Head 35, UpperChest 85, LowerChest 70, LeftArm 60, RightArm 60, LeftLeg 65, RightLeg 65; total 440. The bone-to-pool mapping and constants are copied from the shipped CDO/decompiled functions. [`bodyModel.ts`](../src/lib/protection/bodyModel.ts#L49) [decompiled source, HP table](https://github.com/zelengeo/exfil-zone-assistant-extraction/blob/7f327429bb9b43c94e531f5d475cc8897061b98b/docs/DAMAGE_MODEL.md#L394-L461) | Present capsules and pools as two granularities. Use `UpperChest`/“upper chest” and `LowerChest`/“lower chest”; do not call the lower-chest pool “stomach” as if that were the canonical model name. |
| Fatal pools and overflow | Head or UpperChest at zero is fatal. Destroying another pool is not directly fatal. Damage beyond an exhausted pool is redistributed proportionally across the remaining pools, with values below 0.5 snapped to zero. [decompiled health path](https://github.com/zelengeo/exfil-zone-assistant-extraction/blob/7f327429bb9b43c94e531f5d475cc8897061b98b/docs/DAMAGE_MODEL.md#L463-L537) | Retain the vital/non-vital distinction. Replace the current generic “distributed proportionally” paragraph with the precise overflow boundary: redistribution begins with damage beyond an exhausted pool. Avoid deriving a universal limb-shot count from it. |
| Simulator approximation | For vital zones the simulator stops when that zone's actual pool reaches zero. For non-vital zones it subtracts every shot from one `TOTAL_HP` budget of 440 and stops when that aggregate reaches zero. It does not execute the game's seven-pool overflow redistribution or sub-0.5 snap. [`damage-calculations.ts`](../src/app/combat-sim/utils/damage-calculations.ts#L55) [`damage-model.tsx`](../src/content/guides/damage-model.tsx#L314) | Disclose this beside any simulator link or shots-to-kill discussion: the non-vital result is a pooled-440 damage budget, not an exact destroyed-limb simulation. |
| Bleeding exists | The developer describes bleeding as part of the health system. Every current round publishes a `bleedingChance` value; the 85 catalogue rows range from 0.03 to 0.275. The traced hit path calls `HandleBleeding`, but that function has not been decompiled. [official Steam product page](https://store.steampowered.com/app/2719160/Contractors_Showdown/) [`ammunition.json`](../public/data/ammunition.json#L20) [open runtime question](https://github.com/zelengeo/exfil-zone-assistant-extraction/blob/7f327429bb9b43c94e531f5d475cc8897061b98b/docs/DAMAGE_MODEL.md#L774-L776) | It is safe to say shots can cause bleeding and rounds publish different Bleeding Chance values. Do not present the field as a fully verified probability formula or imply that “most hits” bleed. Link ammunition data instead of copying its values. |
| Bleeding rates | No official source or shipped-data analysis found in scope supports **−0.5 HP/s** for Bleeding or **−2 HP/s** for Deep Wound. The extraction record explicitly leaves `HandleBleeding` unread. [open runtime question](https://github.com/zelengeo/exfil-zone-assistant-extraction/blob/7f327429bb9b43c94e531f5d475cc8897061b98b/docs/DAMAGE_MODEL.md#L774-L776) | Remove both numeric rates. Also remove “less common” and “often stacks” unless a new first-party source or recorded test is added. |
| Deep Wound effect | Caveman Studio confirms that Deep Wound continuously costs health and hydration until treated. It publishes no rate in that announcement. [official medical-system report](https://www.contractorsvr.com/single-post/situation-report-exfilzone-wipe-update) | Retain the two affected resources and need for treatment; do not add a tick rate, stacking rule or relative frequency. |
| Bandage capability | Current in-game strings distinguish the tiers: Gauze/level 1 says it heals Bleeding; levels 2 and 3 say they heal Bleeding and Deep Wound. The current catalogue mirrors this as `canHealDeepWound: false / true / true`. [source asset rows 2–4](https://github.com/zelengeo/exfil-zone-assistant-extraction/blob/7f327429bb9b43c94e531f5d475cc8897061b98b/csv/medical.csv#L2-L4) [`medical.json`](../public/data/medical.json#L3) | Say explicitly: **Gauze treats Bleeding only; Bandage and Military Bandage treat Bleeding and Deep Wound.** The current “2+ bandages (heavy bleed capable)” advice is unsafe because it includes Gauze. Link the medicine catalogue/filter rather than duplicating tier stats. |
| Status of `canHealDeepWound` | The boolean is curated because the three bandage CDOs inherit identical numeric bandage stats; the distinction comes from the in-game descriptions, not a class-default boolean. The source type documents that boundary. [`items.ts`](../src/types/items.ts#L289) [medical extraction notes](https://github.com/zelengeo/exfil-zone-assistant-extraction/blob/7f327429bb9b43c94e531f5d475cc8897061b98b/docs/types/medical.md) | Treat the capability split as current catalogue truth, but do not claim a discovered runtime flag. Keep the wording player-facing. |
| H.C. stimulant | The current item description says the H.C. stimulant heals and prevents Bleeding and Deep Wound on all pools. [`medical.json`](../public/data/medical.json#L564) | It may be named as an alternative supported by current item data. Link the item; do not copy duration or perk internals into the guide. |
| Suturing | Shipped suturing items are “broken limb restorers”; their first-party descriptions say they restore damaged limbs. Current data publishes `brokenHP: 1`, a tier-specific `hpPercentage`, and use times, but the treatment routine and exact meaning of those two fields remain untraced. [`medical.json`](../public/data/medical.json#L148) [treatment boundary](https://github.com/zelengeo/exfil-zone-assistant-extraction/blob/7f327429bb9b43c94e531f5d475cc8897061b98b/docs/DAMAGE_MODEL.md#L533-L537) | Say suturing restores destroyed/damaged limbs. Remove the claims that it restores exactly 1 HP and reduces maximum HP until the runtime treatment path is traced from shipped code. Do not call suturing a Deep Wound treatment: the authoritative item descriptions assign that capability to advanced bandages and the H.C. stimulant. |
| Painkillers | Current item descriptions support only temporary pain suppression. The three items publish 160/200/240-second effect fields and negative energy/hydration factors; their perk behavior has not been traced. [`medical.json`](../public/data/medical.json#L364) [source asset rows 10–13](https://github.com/zelengeo/exfil-zone-assistant-extraction/blob/7f327429bb9b43c94e531f5d475cc8897061b98b/csv/medical.csv#L10-L13) | Retain “temporarily suppresses pain” and note the energy/hydration cost only if useful. Remove “removes heavy breathing,” “negates blacked-limb debuffs,” “pre-use before fights,” and “long duration” as behavioral guarantees. Link the live item data rather than hardcoding durations. |
| Hydration and energy | Official copy says hydration and food/fuel matter to stamina. Current provisions divide consumption between `energyFactor` and `hydraFactor`; hideout upgrades explicitly name in-raid **Energy** and Hydration drain. Painkillers carry negative factors for both. [official Steam product page](https://store.steampowered.com/app/2719160/Contractors_Showdown/) [`provisions.json`](../public/data/provisions.json) [`hideout-upgrades.ts`](../src/data/hideout-upgrades.ts#L647) [`medical.json`](../public/data/medical.json#L374) | Rename the guide section to **Hydration & Energy**, matching current data. Say both drain in raid, provisions restore one or both, and painkillers consume both. Link provisions/medicine instead of reproducing item values. |
| Meter debuffs and zero state | No authoritative source found in scope supports the guide's claims that a blacked lower chest accelerates both meters, low hydration penalizes stamina regeneration, low “nutrition” penalizes carrying capacity, or zero in either meter damages all pools until death. | Remove these claims. The official stamina wording is too broad to infer thresholds or zero-state damage. |
| Breathing and enemy audio | No official source or current extracted record found in scope supports the claims that Bleeding and destroyed limbs share a heavy-breathing cue, painkillers silence it, or enemies can hear it at “significant distances.” | Remove all breathing/audio claims and the audio-tracking tactic. A future measured test must record state, distance, occlusion and whether the sound is local or replicated before publishing it. |
| Medical priority | No primary source establishes the current universal order “painkillers → heavy bleed → light bleed → heal/suture → eat/drink,” or that painkillers should always be used preemptively. | Replace with conditional advice: get to cover, identify the status, use an item whose current description treats it, and manage hydration/energy. Avoid a fixed order across unlike injuries. |
| Limb shot count | “4–5 shots to one leg” cannot be universal. The simulator's result depends on round damage and range, build firing power, the exact collision capsule's multiplier, protection and armour durability; its non-vital kill loop is itself the pooled-440 approximation. [`damage-calculations.ts`](../src/app/combat-sim/utils/damage-calculations.ts#L105) [`bodyModel.ts`](../src/lib/protection/bodyModel.ts#L76) | Remove the number. Say limbs can avoid torso armour, but the required hits vary by loadout, range, armour/coverage and landed zone; send the reader to the simulator for a scenario-specific estimate and keep its approximation adjacent. |

## Recommended guide shape

1. **Two body layers:** explain the 13 hit zones first, then the seven HP pools they drain. Show the
   seven pool values once; name Head and UpperChest as vital.
2. **What happens at zero:** destroyed non-vital pool, overflow redistribution, then the simulator's
   pooled-440 shortcut. Keep the approximation at this point rather than in a distant disclaimer.
3. **Bleeding and Deep Wound:** retain only the existence of Bleeding, ammunition's published field,
   and Deep Wound's confirmed health/hydration drain. Omit all unverified rates, stacking and audio.
4. **Choose treatment by status:** Gauze for Bleeding; advanced Bandage/Military Bandage for Bleeding
   and Deep Wound; suturing for destroyed limbs; H.C. stimulant as its current description allows.
   Render these from or link to current medical data.
5. **Pain, Hydration & Energy:** painkillers temporarily suppress pain and cost both meters; provisions
   restore energy, hydration or both. Do not invent low/zero thresholds.
6. **Conditional tactics:** cover and diagnosis first; no universal medication order or limb-shot
   count. Link to `/combat-sim` for scenario-specific estimates and `/guides/damage-model` for exact
   arithmetic and limitations.

The rewrite should then update `updatedAt` to the implementation date and recalculate `readTime`
from the final visible copy. The current registry has no `updatedAt` for this guide and still says
`10 min`: [`guides.ts`](../src/config/guides.ts#L79).
