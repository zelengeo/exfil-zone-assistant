// GENERATED FILE - do not edit by hand.
//
// Source: the game's own `FunctionalAreaUpgradeDataTable_S5`, extracted straight from the PAK.
// Regenerate with, in the extraction repo:
//
//     python tools/pakExtract/cli.py hideout
//     node extractionCLI.js process hideoutUpgrades
//     node tools/publishHideout.js --images
//
// Game version 3.0.0.0. Keys are `<areaId>Lv<level>`; `levelUpIcon` holds the upgrade id,
// because the icons are exported keyed by id (`/images/hideout/<id>.webp`).
//
// Curated, and preserved across regeneration: `relatedQuests` and `hideoutUpgradesTasks`. Both
// describe quest gating, which exists nowhere in the client data. Everything else comes from the
// game, price included - this is the one dataset here whose prices are not server-side.
//
// `perks` is the buff the level grants: `description` is the line the in-game upgrade menu
// prints for this level, `value` the number the game applies. They can disagree - the menu text
// and the applied value are authored separately - so both ship.

export const hideoutUpgrades = {
    "RestRoomLv1": {
        "areaId": "RestRoom",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Toilet",
        "upgradeDesc": "Experience gain +5%\nUnlocks: Sofa",
        "price": 120000,
        "exchange": {
            "misc_b_toiletpaper": 2,
            "misc_hammer": 1,
            "misc_b_pesticide": 1,
            "misc_b_rustedcleaner": 1
        },
        "levelConditions": {
            "KitchenArea": 1,
            "Player": 9
        },
        "relatedQuests": [
            "task.mall.4"
        ],
        "perks": [
            {
                "key": "warfare.progression.experience_boost.value",
                "perkClass": "ExpBonus_C",
                "description": "Increased Experiece gain: +2%",
                "value": 0.05
            }
        ],
        "levelUpIcon": "RestRoomLv1"
    },
    "RestRoomLv2": {
        "areaId": "RestRoom",
        "categoryId": "None",
        "level": 2,
        "upgradeName": "Toilet",
        "upgradeDesc": "Experience gain +15%\nUnlocks: Bookcase Lv2, Sofa Lv2",
        "price": 228000,
        "exchange": {
            "misc_b_toiletpaper": 2,
            "misc_b_beardoil": 2,
            "misc_barcleaner": 2,
            "misc_b_shampoo": 2
        },
        "levelConditions": {
            "RestRoom": 1,
            "Player": 21,
            "TVSet": 2
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.progression.experience_boost.value",
                "perkClass": "ExpBonus_C",
                "description": "Increased Experiece gain: +5%",
                "value": 0.15
            }
        ],
        "levelUpIcon": "RestRoomLv2"
    },
    "RestRoomLv3": {
        "areaId": "RestRoom",
        "categoryId": "None",
        "level": 3,
        "upgradeName": "Toilet",
        "upgradeDesc": "Experience gain +25%\nUnlocks: Bookcase Lv3, Sofa Lv3, Intel Lv4",
        "price": 350000,
        "exchange": {
            "misc_b_toiletpaper": 5,
            "misc_b_deodorant": 5,
            "misc_b_shampoo": 3,
            "misc_b_piezometer": 3
        },
        "levelConditions": {
            "Player": 30,
            "TVSet": 3,
            "RestRoom": 2
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.progression.experience_boost.value",
                "perkClass": "ExpBonus_C",
                "description": "Increased Experiece gain: +10%",
                "value": 0.25
            }
        ],
        "levelUpIcon": "RestRoomLv3"
    },
    "SofaLv1": {
        "areaId": "Sofa",
        "categoryId": "Lounge",
        "level": 1,
        "upgradeName": "Sofa",
        "upgradeDesc": "Carry weight capacity +10 kg\nUnlocks: Bookcase",
        "price": 50000,
        "exchange": {
            "misc_blimbingrope": 3,
            "misc_b_tire_sealant": 2,
            "misc_b_plier_large": 2,
            "misc_hammer": 3
        },
        "levelConditions": {
            "RestRoom": 1,
            "Player": 11
        },
        "relatedQuests": [
            "task.mall.4"
        ],
        "perks": [
            {
                "key": "warfare.weight.base_limit.scale",
                "perkClass": "Enduring_C",
                "description": "Increase limit of weight-bearing: +5kg",
                "value": 10
            }
        ],
        "levelUpIcon": "SofaLv1"
    },
    "SofaLv2": {
        "areaId": "Sofa",
        "categoryId": "Lounge",
        "level": 2,
        "upgradeName": "Sofa",
        "upgradeDesc": "Carry weight capacity +20 kg",
        "price": 128000,
        "exchange": {
            "misc_b_superglue": 2,
            "misc_b_magazine": 3,
            "misc_b_insulatingtape": 5,
            "misc_blimbingrope": 3
        },
        "levelConditions": {
            "RestRoom": 2,
            "Player": 22,
            "Sofa": 1
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.weight.base_limit.scale",
                "perkClass": "Enduring_C",
                "description": "Increase limit of weight-bearing: +10kg",
                "value": 20
            }
        ],
        "levelUpIcon": "SofaLv2"
    },
    "SofaLv3": {
        "areaId": "Sofa",
        "categoryId": "Lounge",
        "level": 3,
        "upgradeName": "Sofa",
        "upgradeDesc": "Carry weight capacity +30 kg",
        "price": 500000,
        "exchange": {
            "misc_b_gameconsole": 2,
            "misc_b_tire_sealant": 5,
            "misc_b_deodorant": 4,
            "misc_b_defibrillator": 1
        },
        "levelConditions": {
            "RestRoom": 3,
            "Player": 30,
            "Sofa": 2
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.weight.base_limit.scale",
                "perkClass": "Enduring_C",
                "description": "Increase limit of weight-bearing: +20kg",
                "value": 30
            }
        ],
        "levelUpIcon": "SofaLv3"
    },
    "BookcaseLv1": {
        "areaId": "Bookcase",
        "categoryId": "Lounge",
        "level": 1,
        "upgradeName": "Bookdesk",
        "upgradeDesc": "Reduced Magazine Load Time: -10%",
        "price": 50000,
        "exchange": {
            "misc_b_flashlight": 3,
            "misc_b_lightbulb": 3,
            "misc_b_socket": 2,
            "misc_b_civilradio": 2
        },
        "levelConditions": {
            "Sofa": 1,
            "Player": 13
        },
        "relatedQuests": [
            "task.mall.4"
        ],
        "perks": [
            {
                "key": "warfare.weapon.reload_speed.scale",
                "perkClass": "SpeedUpReloadingSpeed_C",
                "description": "Reload Speed +10%",
                "value": 0.8999999761581421
            }
        ],
        "levelUpIcon": "BookcaseLv1"
    },
    "BookcaseLv2": {
        "areaId": "Bookcase",
        "categoryId": "Lounge",
        "level": 2,
        "upgradeName": "Bookdesk",
        "upgradeDesc": "Reduced Magazine Load Time: -20%",
        "price": 180000,
        "exchange": {
            "misc_b_tape": 5,
            "misc_b_antiquebook": 3,
            "misc_b_recorder": 3,
            "misc_b_powerbank": 3
        },
        "levelConditions": {
            "RestRoom": 2,
            "Player": 23,
            "Bookcase": 1
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.weapon.reload_speed.scale",
                "perkClass": "SpeedUpReloadingSpeed_C",
                "description": "Reload Speed +20%",
                "value": 0.800000011920929
            }
        ],
        "levelUpIcon": "BookcaseLv2"
    },
    "BookcaseLv3": {
        "areaId": "Bookcase",
        "categoryId": "Lounge",
        "level": 3,
        "upgradeName": "Bookdesk",
        "upgradeDesc": "Reduced Magazine Load Time: -30%",
        "price": 420000,
        "exchange": {
            "misc_b_transformer": 2,
            "misc_bomputertextbook": 5,
            "misc_b_digitalsensor": 2,
            "misc_b_antiquebook": 4
        },
        "levelConditions": {
            "RestRoom": 3,
            "Player": 34,
            "Bookcase": 2
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.weapon.reload_speed.scale",
                "perkClass": "SpeedUpReloadingSpeed_C",
                "description": "Reload Speed +30%",
                "value": 0.699999988079071
            }
        ],
        "levelUpIcon": "BookcaseLv3"
    },
    "TVSetLv1": {
        "areaId": "TVSet",
        "categoryId": "Lounge",
        "level": 1,
        "upgradeName": "TV Set",
        "upgradeDesc": "Scav mode cooldown -10%",
        "price": 50000,
        "exchange": {
            "misc_1batterie_2": 2,
            "misc_b_1battery": 2,
            "misc_b_ionbattery": 2,
            "misc_b_civilradio": 2
        },
        "levelConditions": {
            "Player": 3,
            "RestroomZone": 1
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.scav.cooldown.value",
                "perkClass": "ScavCD_C",
                "description": "Reduce SCAV. mode CD: -10%",
                "value": 0.10000000149011612
            }
        ],
        "levelUpIcon": "TVSetLv1"
    },
    "TVSetLv2": {
        "areaId": "TVSet",
        "categoryId": "Lounge",
        "level": 2,
        "upgradeName": "TV Set",
        "upgradeDesc": "Scav mode cooldown -20%\nUnlocks: Rest Room Lv2",
        "price": 180000,
        "exchange": {
            "misc_1batterie_2": 3,
            "misc_b_1battery": 3,
            "misc_videotape": 1,
            "misc_b_electricdrill": 1
        },
        "levelConditions": {
            "Generator": 2,
            "Player": 20,
            "TVSet": 1
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.scav.cooldown.value",
                "perkClass": "ScavCD_C",
                "description": "Reduce SCAV. mode CD: -20%",
                "value": 0.20000000298023224
            }
        ],
        "levelUpIcon": "TVSetLv2"
    },
    "TVSetLv3": {
        "areaId": "TVSet",
        "categoryId": "Lounge",
        "level": 3,
        "upgradeName": "TV Set",
        "upgradeDesc": "Scav mode cooldown -30%\nUnlocks: Rest Room Lv3",
        "price": 420000,
        "exchange": {
            "misc_1batterie_2": 5,
            "misc_b_1battery": 5,
            "misc_videotape": 3,
            "misc_b_rat_poison": 2
        },
        "levelConditions": {
            "Generator": 3,
            "Player": 29,
            "TVSet": 2
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.scav.cooldown.value",
                "perkClass": "ScavCD_C",
                "description": "Reduce SCAV. mode CD: -30%",
                "value": 0.30000001192092896
            }
        ],
        "levelUpIcon": "TVSetLv3"
    },
    "MedicalAreaLv1": {
        "areaId": "MedicalArea",
        "categoryId": "MedicalArea",
        "level": 1,
        "upgradeName": "Medical Area",
        "upgradeDesc": "HQ health regeneration +5 HP/min\nUnlocks: Med Desk, Plant Stand",
        "price": 70000,
        "exchange": {
            "misc_b_disinfectingwipes": 1,
            "misc_b_bandaid": 2,
            "misc_b_toiletpaper": 2
        },
        "levelConditions": {},
        "relatedQuests": [
            "task.doc.c.07"
        ],
        "perks": [
            {
                "key": "warfare.survival.hq.health_recovery.scale",
                "perkClass": "HQRecoveryHealth_C",
                "description": "Gradually restores HP while in HQ: 1HP/min",
                "value": 5
            }
        ],
        "levelUpIcon": "MedicalAreaLv1"
    },
    "OperationBedLv1": {
        "areaId": "OperationBed",
        "categoryId": "MedicalArea",
        "level": 1,
        "upgradeName": "Operating Bed",
        "upgradeDesc": "HQ health regeneration +10 HP/min",
        "price": 60000,
        "exchange": {
            "misc_b_medicalkit": 2,
            "misc_b_flashlight": 2,
            "misc_b_pipeline": 1,
            "misc_b_iodophor": 1
        },
        "levelConditions": {
            "Player": 14,
            "MedicalArea": 1
        },
        "relatedQuests": [
            "task.doc.b.01"
        ],
        "perks": [
            {
                "key": "warfare.survival.hq.health_recovery.extra.scale",
                "perkClass": "HQRecoveryHealth_2_C",
                "description": "Gradually restores HP while in HQ: 1HP/min",
                "value": 10
            }
        ],
        "levelUpIcon": "OperationBedLv1"
    },
    "OperationBedLv2": {
        "areaId": "OperationBed",
        "categoryId": "MedicalArea",
        "level": 2,
        "upgradeName": "Operating Bed",
        "upgradeDesc": "HQ health regeneration +15 HP/min",
        "price": 120000,
        "exchange": {
            "misc_b_bottledglucose": 3,
            "misc_b_medicalscissors": 2,
            "misc_b_bandaid": 2,
            "misc_bentrifuge": 1
        },
        "levelConditions": {
            "Generator": 2,
            "Player": 27,
            "OperationBed": 1
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.hq.health_recovery.extra.scale",
                "perkClass": "HQRecoveryHealth_2_C",
                "description": "Gradually restores HP while in HQ: 1HP/min",
                "value": 15
            }
        ],
        "levelUpIcon": "OperationBedLv2"
    },
    "OperationBedLv3": {
        "areaId": "OperationBed",
        "categoryId": "MedicalArea",
        "level": 3,
        "upgradeName": "Operating Bed",
        "upgradeDesc": "HQ health regeneration +20 HP/min",
        "price": 240000,
        "exchange": {
            "misc_b_bottledglucose": 7,
            "misc_b_medicalscissors": 3,
            "misc_b_uvlight": 2,
            "misc_bentrifuge": 1
        },
        "levelConditions": {
            "Player": 40,
            "MedDesk": 3,
            "OperationBed": 2
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.hq.health_recovery.extra.scale",
                "perkClass": "HQRecoveryHealth_2_C",
                "description": "Gradually restores HP while in HQ: 2HP/min",
                "value": 20
            }
        ],
        "levelUpIcon": "OperationBedLv3"
    },
    "PlantingLv1": {
        "areaId": "Planting",
        "categoryId": "MedicalArea",
        "level": 1,
        "upgradeName": "Plant Stand",
        "upgradeDesc": "Food recovery efficiency +10%",
        "price": 70000,
        "exchange": {
            "misc_b_disinfectingwipes": 2,
            "misc_b_pipeline": 1,
            "misc_b_lightbulb": 2,
            "misc_b_insulatingtape": 1
        },
        "levelConditions": {
            "MedicalArea": 1,
            "Player": 14
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.energy_recovery.scale",
                "perkClass": "IncreaseEnergyRecovery_C",
                "description": "Increased food recovery rate: +10%",
                "value": null
            }
        ],
        "levelUpIcon": "PlantingLv1"
    },
    "PlantingLv2": {
        "areaId": "Planting",
        "categoryId": "MedicalArea",
        "level": 2,
        "upgradeName": "Plant Stand",
        "upgradeDesc": "Food recovery efficiency +20%",
        "price": 220000,
        "exchange": {
            "misc_b_moldboard": 4,
            "misc_b_aspire": 2,
            "misc_b_pesticide": 3,
            "misc_b_gaspipewrench": 2
        },
        "levelConditions": {
            "Generator": 2,
            "Player": 24,
            "Planting": 1
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.energy_recovery.scale",
                "perkClass": "IncreaseEnergyRecovery_C",
                "description": "Increased food recovery rate: +20%",
                "value": 1.2000000476837158
            }
        ],
        "levelUpIcon": "PlantingLv2"
    },
    "PlantingLv3": {
        "areaId": "Planting",
        "categoryId": "MedicalArea",
        "level": 3,
        "upgradeName": "Plant Stand",
        "upgradeDesc": "Food recovery efficiency +30%",
        "price": 340000,
        "exchange": {
            "misc_b_moldboard": 8,
            "misc_b_match": 4,
            "misc_b_iodophor": 4,
            "misc_b_gaspipewrench": 2
        },
        "levelConditions": {
            "WaterCollector": 3,
            "Player": 32,
            "Planting": 2
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.energy_recovery.scale",
                "perkClass": "IncreaseEnergyRecovery_C",
                "description": "Increased food recovery rate: +30%",
                "value": 1.2999999523162842
            }
        ],
        "levelUpIcon": "PlantingLv3"
    },
    "MedDeskLv1": {
        "areaId": "MedDesk",
        "categoryId": "MedicalArea",
        "level": 1,
        "upgradeName": "Med Desk",
        "upgradeDesc": "Drink recovery efficiency +10%",
        "price": 70000,
        "exchange": {
            "misc_b_bottledglucose": 1,
            "misc_b_aspire": 1,
            "misc_b_pipeline": 1,
            "misc_b_socket": 2
        },
        "levelConditions": {
            "MedicalArea": 1
        },
        "relatedQuests": [
            "task.doc.b.09"
        ],
        "perks": [
            {
                "key": "warfare.survival.hydration_recovery.scale",
                "perkClass": "IncreaseHydraRecovery_C",
                "description": "Increase beverage recovery rate: +10%",
                "value": null
            }
        ],
        "levelUpIcon": "MedDeskLv1"
    },
    "MedDeskLv2": {
        "areaId": "MedDesk",
        "categoryId": "MedicalArea",
        "level": 2,
        "upgradeName": "Med Desk",
        "upgradeDesc": "Drink recovery efficiency +20%",
        "price": 220000,
        "exchange": {
            "misc_b_uvlight": 2,
            "misc_b_medicalkit": 4,
            "misc_b_asthmamedication": 3,
            "misc_bentrifuge": 2
        },
        "levelConditions": {
            "Generator": 2,
            "MedDesk": 1
        },
        "relatedQuests": [
            "task.doc.b.11"
        ],
        "perks": [
            {
                "key": "warfare.survival.hydration_recovery.scale",
                "perkClass": "IncreaseHydraRecovery_C",
                "description": "Increase beverage recovery rate: +20%",
                "value": 1.2000000476837158
            }
        ],
        "levelUpIcon": "MedDeskLv2"
    },
    "MedDeskLv3": {
        "areaId": "MedDesk",
        "categoryId": "MedicalArea",
        "level": 3,
        "upgradeName": "Med Desk",
        "upgradeDesc": "Drink recovery efficiency +30%\nUnlocks: Operation Bed Lv3",
        "price": 340000,
        "exchange": {
            "misc_b_uvlight": 3,
            "misc_b_medicalkit": 6,
            "misc_b_asthmamedication": 3,
            "misc_bentrifuge": 2
        },
        "levelConditions": {
            "WaterCollector": 3,
            "Player": 39,
            "MedDesk": 2
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.hydration_recovery.scale",
                "perkClass": "IncreaseHydraRecovery_C",
                "description": "Increase beverage recovery rate: +30%",
                "value": 1.2999999523162842
            }
        ],
        "levelUpIcon": "MedDeskLv3"
    },
    "WaterCollectorLv1": {
        "areaId": "WaterCollector",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Water Collector",
        "upgradeDesc": "HQ hydration regeneration 1/min\nUnlocks: Kitchen Area Lv2",
        "price": 10000,
        "exchange": {
            "misc_b_rustedcleaner": 1,
            "misc_hammer": 1,
            "misc_b_nail": 1
        },
        "levelConditions": {},
        "relatedQuests": [
            "task.mall.c.04"
        ],
        "perks": [
            {
                "key": "warfare.survival.hq.hydration_recovery.scale",
                "perkClass": "HQRecoveryHydra_C",
                "description": "Regenerate Thirst while in Hideout: 0.15/min",
                "value": 1
            }
        ],
        "levelUpIcon": "WaterCollectorLv1"
    },
    "WaterCollectorLv2": {
        "areaId": "WaterCollector",
        "categoryId": "None",
        "level": 2,
        "upgradeName": "Water Collector",
        "upgradeDesc": "HQ hydration regeneration 3/min\nUnlocks: Med Desk Lv3, Operating Bed Lv3, Plant Stand Lv3",
        "price": 50000,
        "exchange": {
            "misc_b_pipeline": 3,
            "misc_b_insulatingtape": 3,
            "misc_b_nail": 4,
            "misc_b_spraycan": 2
        },
        "levelConditions": {
            "WaterCollector": 1,
            "Player": 19
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.hq.hydration_recovery.scale",
                "perkClass": "HQRecoveryHydra_C",
                "description": "Regenerate Thirst while in Hideout: 0.33/min",
                "value": 3
            }
        ],
        "levelUpIcon": "WaterCollectorLv2"
    },
    "WaterCollectorLv3": {
        "areaId": "WaterCollector",
        "categoryId": "None",
        "level": 3,
        "upgradeName": "Water Collector",
        "upgradeDesc": "HQ hydration regeneration 5/min",
        "price": 100000,
        "exchange": {
            "misc_b_pipeline": 7,
            "misc_barcleaner": 3,
            "misc_b_storagebattery": 2,
            "misc_b_piezometer": 1
        },
        "levelConditions": {
            "WaterCollector": 2,
            "Player": 28
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.hq.hydration_recovery.scale",
                "perkClass": "HQRecoveryHydra_C",
                "description": "Regenerate Thirst while in Hideout: 0.5/min",
                "value": 5
            }
        ],
        "levelUpIcon": "WaterCollectorLv3"
    },
    "KitchenAreaLv1": {
        "areaId": "KitchenArea",
        "categoryId": "KitchenArea",
        "level": 1,
        "upgradeName": "Kitchen Area",
        "upgradeDesc": "Energy and Hydration cap +5\nUnlocks: Rest Room",
        "price": 70000,
        "exchange": {
            "misc_b_oliveoil": 2,
            "misc_b_saltcan": 2,
            "misc_b_gastank": 1,
            "misc_b_plier_large": 1
        },
        "levelConditions": {
            "WaterCollector": 1
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.energy_hydration.max.add",
                "perkClass": "MaxEnergyAndHydra_C",
                "description": "Max Water: x1.1",
                "value": 5
            }
        ],
        "levelUpIcon": "KitchenAreaLv1"
    },
    "KitchenAreaLv2": {
        "areaId": "KitchenArea",
        "categoryId": "KitchenArea",
        "level": 2,
        "upgradeName": "Kitchen Area",
        "upgradeDesc": "Energy and Hydration cap +10\nUnlocks: Coffee Machine Lv2, Refrigerator Lv2",
        "price": 220000,
        "exchange": {
            "misc_b_gastank": 3,
            "misc_b_insulatingtape": 3,
            "misc_b_pesticide": 3,
            "misc_b_wd40": 3
        },
        "levelConditions": {
            "KitchenArea": 1,
            "WaterCollector": 2,
            "Generator": 2,
            "Player": 21
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.energy_hydration.max.add",
                "perkClass": "MaxEnergyAndHydra_C",
                "description": "Max Water: x1.2",
                "value": 10
            }
        ],
        "levelUpIcon": "KitchenAreaLv2"
    },
    "KitchenAreaLv3": {
        "areaId": "KitchenArea",
        "categoryId": "KitchenArea",
        "level": 3,
        "upgradeName": "Kitchen Area",
        "upgradeDesc": "Energy and Hydration cap +20\nUnlocks: Microwave Lv3",
        "price": 330000,
        "exchange": {
            "misc_b_oliveoil": 3,
            "misc_b_insulatingtape": 3,
            "misc_b_saltcan": 4,
            "misc_b_lighter": 3
        },
        "levelConditions": {
            "KitchenArea": 2,
            "Generator": 3,
            "Player": 31
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.energy_hydration.max.add",
                "perkClass": "MaxEnergyAndHydra_C",
                "description": "Max Water: x1.3",
                "value": 20
            }
        ],
        "levelUpIcon": "KitchenAreaLv3"
    },
    "KitchenAreaLv4": {
        "areaId": "KitchenArea",
        "categoryId": "KitchenArea",
        "level": 4,
        "upgradeName": "Kitchen Area",
        "upgradeDesc": "Energy and Hydration cap +30",
        "price": 450000,
        "exchange": {
            "misc_copperwire": 3,
            "misc_b_gaspipewrench": 3,
            "misc_b_insulatingtape": 3,
            "misc_b_lighter": 3
        },
        "levelConditions": {
            "KitchenArea": 3,
            "Player": 37
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.energy_hydration.max.add",
                "perkClass": "MaxEnergyAndHydra_C",
                "description": "Max Water: x1.4",
                "value": 30
            }
        ],
        "levelUpIcon": "KitchenAreaLv4"
    },
    "RefrigeratorLv1": {
        "areaId": "Refrigerator",
        "categoryId": "KitchenArea",
        "level": 1,
        "upgradeName": "Refrigerator",
        "upgradeDesc": "HQ energy regeneration 1/min",
        "price": 90000,
        "exchange": {
            "misc_oilcan": 2,
            "misc_blimbingrope": 2,
            "misc_b_spraycan": 1,
            "misc_b_plier_large": 1
        },
        "levelConditions": {
            "Generator": 1,
            "Player": 12,
            "KitchenArea": 1
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.hq.energy_recovery.scale",
                "perkClass": "HQRecoveryEnergy_C",
                "description": "Regenerate Energy while in Hideout: 0.15/min",
                "value": 1
            }
        ],
        "levelUpIcon": "RefrigeratorLv1"
    },
    "RefrigeratorLv2": {
        "areaId": "Refrigerator",
        "categoryId": "KitchenArea",
        "level": 2,
        "upgradeName": "Refrigerator",
        "upgradeDesc": "HQ energy regeneration 3/min",
        "price": 160000,
        "exchange": {
            "misc_b_oliveoil": 2,
            "misc_b_match": 2,
            "misc_b_wirecutting": 3,
            "misc_b_socket": 2
        },
        "levelConditions": {
            "KitchenArea": 2,
            "Player": 22,
            "Refrigerator": 1
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.hq.energy_recovery.scale",
                "perkClass": "HQRecoveryEnergy_C",
                "description": "Regenerate Energy while in Hideout: 0.33/min",
                "value": 3
            }
        ],
        "levelUpIcon": "RefrigeratorLv2"
    },
    "RefrigeratorLv3": {
        "areaId": "Refrigerator",
        "categoryId": "KitchenArea",
        "level": 3,
        "upgradeName": "Refrigerator",
        "upgradeDesc": "HQ energy regeneration 5/min",
        "price": 240000,
        "exchange": {
            "misc_b_oliveoil": 3,
            "misc_b_match": 3,
            "misc_b_plier_large": 5,
            "misc_copperwire": 2
        },
        "levelConditions": {
            "KitchenArea": 3,
            "Player": 30,
            "Refrigerator": 2
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.hq.energy_recovery.scale",
                "perkClass": "HQRecoveryEnergy_C",
                "description": "Regenerate Energy while in Hideout: 0.5/min",
                "value": 5
            }
        ],
        "levelUpIcon": "RefrigeratorLv3"
    },
    "MicrowaveOvenLv1": {
        "areaId": "MicrowaveOven",
        "categoryId": "KitchenArea",
        "level": 1,
        "upgradeName": "Microwave",
        "upgradeDesc": "In-raid energy drain -10%",
        "price": 90000,
        "exchange": {
            "misc_b_oliveoil": 2,
            "misc_b_plier_large": 1,
            "misc_b_tire_sealant": 2,
            "misc_b_moldboard": 1
        },
        "levelConditions": {
            "CoffeeMaker": 1,
            "Player": 15
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.ingame.energy_recovery.scale",
                "perkClass": "InGameRecoveryEnergy_C",
                "description": "In-Raid Energy Consumption -5%",
                "value": 0.9
            }
        ],
        "levelUpIcon": "MicrowaveOvenLv1"
    },
    "MicrowaveOvenLv2": {
        "areaId": "MicrowaveOven",
        "categoryId": "KitchenArea",
        "level": 2,
        "upgradeName": "Microwave",
        "upgradeDesc": "In-raid energy drain -20%",
        "price": 200000,
        "exchange": {
            "misc_b_plier_large": 5,
            "misc_b_gastank": 5,
            "misc_wastechip": 3,
            "misc_b_oliveoil": 2
        },
        "levelConditions": {
            "Generator": 2,
            "Player": 25,
            "MicrowaveOven": 1
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.ingame.energy_recovery.scale",
                "perkClass": "InGameRecoveryEnergy_C",
                "description": "In-Raid Energy Consumption -10%",
                "value": 0.8
            }
        ],
        "levelUpIcon": "MicrowaveOvenLv2"
    },
    "MicrowaveOvenLv3": {
        "areaId": "MicrowaveOven",
        "categoryId": "KitchenArea",
        "level": 3,
        "upgradeName": "Microwave",
        "upgradeDesc": "In-raid energy drain -30%",
        "price": 300000,
        "exchange": {
            "misc_copperwire": 4,
            "misc_b_lighter": 4,
            "misc_b_wd40": 8,
            "misc_b_digitalsensor": 2
        },
        "levelConditions": {
            "KitchenArea": 3,
            "Player": 35,
            "MicrowaveOven": 2
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.ingame.energy_recovery.scale",
                "perkClass": "InGameRecoveryEnergy_C",
                "description": "In-Raid Energy Consumption -15%",
                "value": 0.7
            }
        ],
        "levelUpIcon": "MicrowaveOvenLv3"
    },
    "CoffeeMakerLv1": {
        "areaId": "CoffeeMaker",
        "categoryId": "KitchenArea",
        "level": 1,
        "upgradeName": "Coffee Maker",
        "upgradeDesc": "In-raid hydration drain -10%\nUnlocks: Microwave",
        "price": 90000,
        "exchange": {
            "misc_b_gastank": 2,
            "misc_b_plier_large": 1,
            "misc_wastechip": 2,
            "misc_b_wirecutting": 1
        },
        "levelConditions": {
            "Refrigerator": 1,
            "Player": 13
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.ingame.hydration_recovery.scale",
                "perkClass": "InGameRecoveryHydra_C",
                "description": "In-Raid Hydration Consumption -5%",
                "value": 0.9
            }
        ],
        "levelUpIcon": "CoffeeMakerLv1"
    },
    "CoffeeMakerLv2": {
        "areaId": "CoffeeMaker",
        "categoryId": "KitchenArea",
        "level": 2,
        "upgradeName": "Coffee Maker",
        "upgradeDesc": "In-raid hydration drain -20%",
        "price": 200000,
        "exchange": {
            "misc_b_nut": 3,
            "misc_barcleaner": 2,
            "misc_b_gameconsole": 1,
            "misc_b_saltcan": 4
        },
        "levelConditions": {
            "KitchenArea": 2,
            "Player": 23,
            "CoffeeMaker": 1
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.ingame.hydration_recovery.scale",
                "perkClass": "InGameRecoveryHydra_C",
                "description": "In-Raid Hydration Consumption -10%",
                "value": 0.8
            }
        ],
        "levelUpIcon": "CoffeeMakerLv2"
    },
    "CoffeeMakerLv3": {
        "areaId": "CoffeeMaker",
        "categoryId": "KitchenArea",
        "level": 3,
        "upgradeName": "Coffee Maker",
        "upgradeDesc": "In-raid hydration drain -30%",
        "price": 300000,
        "exchange": {
            "misc_b_nut": 8,
            "misc_b_electricdrill": 2,
            "misc_copperwire": 2,
            "misc_b_lighter": 2
        },
        "levelConditions": {
            "KitchenArea": 3,
            "Player": 32,
            "CoffeeMaker": 2
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.survival.ingame.hydration_recovery.scale",
                "perkClass": "InGameRecoveryHydra_C",
                "description": "In-Raid Hydration Consumption -15%",
                "value": 0.7
            }
        ],
        "levelUpIcon": "CoffeeMakerLv3"
    },
    "IntelligentLv1": {
        "areaId": "Intelligent",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Intel Center",
        "upgradeDesc": "Item Market Price Visible",
        "price": 100000,
        "exchange": {
            "misc_b_opticaldisc": 2,
            "misc_b_1battery": 2,
            "misc_1batterie_2": 2,
            "misc_b_oldphone": 1
        },
        "levelConditions": {},
        "relatedQuests": [
            "task.na.c.02"
        ],
        "perks": [
            {
                "key": "warfare.area.intelligence.perk.value",
                "perkClass": "IntelligencePerk_C",
                "description": "Show item prices with M.I.C.A.",
                "value": 1
            },
            {
                "key": "warfare.progression.intelligence_experience_boost.value",
                "perkClass": "ExpBonus_Intelligence_C",
                "description": "Increased Experiece gain: +2%",
                "value": null
            }
        ],
        "levelUpIcon": "IntelligentLv1"
    },
    "IntelligentLv2": {
        "areaId": "Intelligent",
        "categoryId": "None",
        "level": 2,
        "upgradeName": "Intel Center",
        "upgradeDesc": "Experience gain +10%",
        "price": 160000,
        "exchange": {
            "misc_b_opticaldisc": 3,
            "misc_b_tape": 2,
            "misc_notebook": 2,
            "misc_radio": 2
        },
        "levelConditions": {
            "WorkshopZone": 1,
            "Player": 18,
            "Intelligent": 1
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.area.intelligence.perk.value",
                "perkClass": "IntelligencePerk_C",
                "description": "Show item prices with M.I.C.A.",
                "value": 1
            },
            {
                "key": "warfare.progression.intelligence_experience_boost.value",
                "perkClass": "ExpBonus_Intelligence_C",
                "description": "Increased Experiece gain: +5%",
                "value": 0.1
            }
        ],
        "levelUpIcon": "IntelligentLv2"
    },
    "IntelligentLv3": {
        "areaId": "Intelligent",
        "categoryId": "None",
        "level": 3,
        "upgradeName": "Intel Center",
        "upgradeDesc": "Experience gain +20%\nUnlocks: Valuables Storage Lv3",
        "price": 320000,
        "exchange": {
            "misc_b_opticaldisc": 4,
            "misc_b_tape": 2,
            "misc_videotape": 2,
            "misc_b_powerbank": 2
        },
        "levelConditions": {
            "Intelligent": 2,
            "Generator": 3,
            "Player": 31
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.area.intelligence.perk.value",
                "perkClass": "IntelligencePerk_C",
                "description": "Show item prices with M.I.C.A.",
                "value": 1
            },
            {
                "key": "warfare.progression.intelligence_experience_boost.value",
                "perkClass": "ExpBonus_Intelligence_C",
                "description": "Increased Experiece gain: +10%",
                "value": 0.2
            }
        ],
        "levelUpIcon": "IntelligentLv3"
    },
    "IntelligentLv4": {
        "areaId": "Intelligent",
        "categoryId": "None",
        "level": 4,
        "upgradeName": "Intel Center",
        "upgradeDesc": "Experience gain +30%\nUnlocks: Storage Room D",
        "price": 500000,
        "exchange": {
            "misc_b_opticaldisc": 7,
            "misc_b_digitalsensor": 3,
            "misc_floppydisk": 2,
            "misc_b_visionmodule": 1
        },
        "levelConditions": {
            "Intelligent": 3,
            "RestRoom": 3,
            "Player": 40
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.area.intelligence.perk.value",
                "perkClass": "IntelligencePerk_C",
                "description": "Show item prices with M.I.C.A.",
                "value": 1
            },
            {
                "key": "warfare.progression.intelligence_experience_boost.value",
                "perkClass": "ExpBonus_Intelligence_C",
                "description": "Increased Experiece gain: +10%",
                "value": 0.3
            }
        ],
        "levelUpIcon": "IntelligentLv4"
    },
    "CryptoMiningLv1": {
        "areaId": "CryptoMining",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Bitcoin Mine",
        "upgradeDesc": "Generate periodic income using GPUs.",
        "price": 100000,
        "exchange": {
            "misc_bpu": 1,
            "misc_b_rustedcleaner": 3,
            "misc_b_ram": 4,
            "misc_b_harddrive": 3
        },
        "levelConditions": {
            "GeneratorZone": 1
        },
        "relatedQuests": [
            "task.mall.b.02"
        ],
        "perks": [],
        "levelUpIcon": "CryptoMiningLv1"
    },
    "CryptoMiningLv2": {
        "areaId": "CryptoMining",
        "categoryId": "None",
        "level": 2,
        "upgradeName": "Bitcoin Mine",
        "upgradeDesc": "Unlock more slots; Increase money output.",
        "price": 200000,
        "exchange": {
            "misc_bpu": 3,
            "misc_b_pcfan": 4,
            "misc_b_ram": 3,
            "misc_floppydisk": 3
        },
        "levelConditions": {
            "CryptoMining": 1,
            "Player": 24
        },
        "relatedQuests": [],
        "perks": [],
        "levelUpIcon": "CryptoMiningLv2"
    },
    "CryptoMiningLv3": {
        "areaId": "CryptoMining",
        "categoryId": "None",
        "level": 3,
        "upgradeName": "Bitcoin Mine",
        "upgradeDesc": "Unlock more slots; Increase money output.",
        "price": 300000,
        "exchange": {
            "misc_bpu": 3,
            "misc_b_pcfan": 5,
            "misc_b_ram": 4,
            "misc_b_harddrive": 4
        },
        "levelConditions": {
            "CryptoMining": 2,
            "Generator": 3,
            "Player": 36
        },
        "relatedQuests": [],
        "perks": [],
        "levelUpIcon": "CryptoMiningLv3"
    },
    "CryptoMiningLv4": {
        "areaId": "CryptoMining",
        "categoryId": "None",
        "level": 4,
        "upgradeName": "Bitcoin Mine",
        "upgradeDesc": "Unlock more slots; Increase money output.",
        "price": 400000,
        "exchange": {
            "misc_bpu": 4,
            "misc_b_pcfan": 7,
            "misc_b_ram": 5,
            "misc_b_harddrive": 4
        },
        "levelConditions": {
            "CryptoMining": 3,
            "Player": 40
        },
        "relatedQuests": [],
        "perks": [],
        "levelUpIcon": "CryptoMiningLv4"
    },
    "GeneratorLv1": {
        "areaId": "Generator",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Generator",
        "upgradeDesc": "Increase Fuel capacity, reduce power consumption.\nSupport upgrades for more facilities.",
        "price": 10000,
        "exchange": {},
        "levelConditions": {
            "GeneratorZone": 1,
            "Player": 7
        },
        "relatedQuests": [],
        "perks": [],
        "levelUpIcon": "GeneratorLv1"
    },
    "GeneratorLv2": {
        "areaId": "Generator",
        "categoryId": "None",
        "level": 2,
        "upgradeName": "Generator",
        "upgradeDesc": "Increase Fuel capacity, reduce power consumption.\nSupport upgrades for more facilities.",
        "price": 100000,
        "exchange": {
            "misc_b_lighterfluid": 4,
            "misc_oilcan": 5,
            "misc_b_insulatingtape": 4,
            "misc_b_sparkplug": 1
        },
        "levelConditions": {
            "Generator": 1
        },
        "relatedQuests": [
            "task.mall.b.01"
        ],
        "perks": [],
        "levelUpIcon": "GeneratorLv2"
    },
    "GeneratorLv3": {
        "areaId": "Generator",
        "categoryId": "None",
        "level": 3,
        "upgradeName": "Generator",
        "upgradeDesc": "Increase Fuel capacity, reduce power consumption.\nSupport upgrades for more facilities.",
        "price": 300000,
        "exchange": {
            "misc_b_visionmodule": 3,
            "misc_b_sparkplug": 3,
            "misc_b_transformer": 2,
            "misc_b_marinestoragebattery": 2
        },
        "levelConditions": {
            "Generator": 2,
            "Player": 29
        },
        "relatedQuests": [],
        "perks": [],
        "levelUpIcon": "GeneratorLv3"
    },
    "ShootingRangeLv1": {
        "areaId": "ShootingRange",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Shooting Range",
        "upgradeDesc": "Infinite ammo for firearms testing.",
        "price": 50000,
        "exchange": {
            "misc_b_gunoil": 2,
            "misc_b_insulatingtape": 2,
            "misc_b_ceramic_adhesive": 1,
            "misc_b_tire_sealant": 2
        },
        "levelConditions": {},
        "relatedQuests": [
            "task.mall.c.06"
        ],
        "perks": [],
        "levelUpIcon": "ShootingRangeLv1"
    },
    "WorkshopZoneLv1": {
        "areaId": "WorkshopZone",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Workshop",
        "upgradeDesc": "Access to more stroage spaces.\nAccess to Armor Repair, Ammo loader and Keys hanger.",
        "price": 0,
        "exchange": {},
        "levelConditions": {},
        "relatedQuests": [
            "task.na.c.03"
        ],
        "perks": [],
        "levelUpIcon": "WorkshopZoneLv1"
    },
    "StorageExpansionStartLv1": {
        "areaId": "StorageExpansionStart",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Starter‘s Storage Expansion",
        "upgradeDesc": "Expand storage capacity in the Terminal area.",
        "price": 80000,
        "exchange": {
            "misc_b_screw": 2,
            "misc_b_nut": 2,
            "misc_barcleaner": 1,
            "misc_b_wrench": 2
        },
        "levelConditions": {
            "StorageZoneLock1": 1,
            "Player": 11
        },
        "relatedQuests": [],
        "perks": [],
        "levelUpIcon": "StorageExpansionStartLv1"
    },
    "StorageZoneLock1Lv1": {
        "areaId": "StorageZoneLock1",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Storage Room A",
        "upgradeDesc": "Access to storage room A",
        "price": 80000,
        "exchange": {
            "misc_b_nail": 2,
            "misc_b_screw": 2,
            "misc_b_disinfectingwipes": 2,
            "misc_b_gastank_large": 2
        },
        "levelConditions": {
            "Generator": 1,
            "Player": 10
        },
        "relatedQuests": [],
        "perks": [],
        "levelUpIcon": "StorageZoneLock1Lv1"
    },
    "StorageZoneLock2Lv1": {
        "areaId": "StorageZoneLock2",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Storage Room B",
        "upgradeDesc": "Access to storage room B",
        "price": 400000,
        "exchange": {
            "misc_b_gastank_large": 4,
            "misc_b_wrench": 4,
            "misc_screwdriver": 4,
            "misc_b_batter_large": 4
        },
        "levelConditions": {
            "StorageZoneLock1": 1,
            "Player": 21
        },
        "relatedQuests": [],
        "perks": [],
        "levelUpIcon": "StorageZoneLock2Lv1"
    },
    "StorageZoneLock3Lv1": {
        "areaId": "StorageZoneLock3",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Storage Room C",
        "upgradeDesc": "Access to storage room C",
        "price": 400000,
        "exchange": {
            "misc_gunpowder": 7,
            "misc_b_smokelesspowder": 7,
            "misc_b_piezometer": 5,
            "misc_b_visionmodule": 4
        },
        "levelConditions": {
            "StorageZoneLock2": 1,
            "Player": 41
        },
        "relatedQuests": [],
        "perks": [],
        "levelUpIcon": "StorageZoneLock3Lv1"
    },
    "StorageZoneLock4Lv1": {
        "areaId": "StorageZoneLock4",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Storage Room D",
        "upgradeDesc": "Access to storage room D",
        "price": 760000,
        "exchange": {
            "misc_b_lightbulb": 7,
            "misc_b_wrench": 7,
            "misc_b_medicalscissors": 3,
            "misc_b_defibrillator": 3
        },
        "levelConditions": {
            "StorageZoneLock3": 1,
            "Intelligent": 4,
            "Player": 41
        },
        "relatedQuests": [],
        "perks": [],
        "levelUpIcon": "StorageZoneLock4Lv1"
    },
    "GunsmithLv1": {
        "areaId": "Gunsmith",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Gunsmith",
        "upgradeDesc": "Weapon parts storage capacity + 10kg",
        "price": 10000,
        "exchange": {
            "misc_b_screw": 2,
            "misc_b_gastank": 2,
            "misc_b_rustedcleaner": 2,
            "misc_barcleaner": 2
        },
        "levelConditions": {
            "ShootingRange": 1
        },
        "relatedQuests": [
            "task.gunsmith.002"
        ],
        "perks": [
            {
                "key": "warfare.area.gunsmith.perk.value",
                "perkClass": "GunSmithPerk_C",
                "description": "",
                "value": 30
            }
        ],
        "levelUpIcon": "GunsmithLv1"
    },
    "GunsmithLv2": {
        "areaId": "Gunsmith",
        "categoryId": "None",
        "level": 2,
        "upgradeName": "Gunsmith",
        "upgradeDesc": "Weapon parts storage capacity + 10kg",
        "price": 80000,
        "exchange": {
            "misc_b_pipeline": 2,
            "misc_b_nail": 4,
            "misc_b_ceramic_adhesive": 5,
            "misc_floppydisk": 2
        },
        "levelConditions": {
            "Player": 24,
            "Gunsmith": 1
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.area.gunsmith.perk.value",
                "perkClass": "GunSmithPerk_C",
                "description": "",
                "value": 40
            }
        ],
        "levelUpIcon": "GunsmithLv2"
    },
    "GunsmithLv3": {
        "areaId": "Gunsmith",
        "categoryId": "None",
        "level": 3,
        "upgradeName": "Gunsmith",
        "upgradeDesc": "Weapon parts storage capacity + 10kg",
        "price": 200000,
        "exchange": {
            "misc_b_powerbank": 4,
            "misc_b_oldphone": 7,
            "misc_b_sparkplug": 4,
            "misc_b_civilradio": 3
        },
        "levelConditions": {
            "Generator": 3,
            "Player": 33,
            "Gunsmith": 2
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.area.gunsmith.perk.value",
                "perkClass": "GunSmithPerk_C",
                "description": "",
                "value": 50
            }
        ],
        "levelUpIcon": "GunsmithLv3"
    },
    "GunsmithLv4": {
        "areaId": "Gunsmith",
        "categoryId": "None",
        "level": 4,
        "upgradeName": "Gunsmith",
        "upgradeDesc": "Weapon parts storage capacity + 10kg",
        "price": 400000,
        "exchange": {
            "misc_b_superglue": 7,
            "misc_b_newphone": 7,
            "misc_b_glue_large": 5,
            "misc_b_electricdrill": 4
        },
        "levelConditions": {
            "Gunsmith": 3,
            "Player": 38
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.area.gunsmith.perk.value",
                "perkClass": "GunSmithPerk_C",
                "description": "",
                "value": 60
            }
        ],
        "levelUpIcon": "GunsmithLv4"
    },
    "GeneratorZoneLv1": {
        "areaId": "GeneratorZone",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Unlock Generator Zone",
        "upgradeDesc": "Unlock Generator Zone",
        "price": 0,
        "exchange": {},
        "levelConditions": {},
        "relatedQuests": [
            "task.mall.c.02"
        ],
        "perks": [],
        "levelUpIcon": "GeneratorZoneLv1"
    },
    "RestroomZoneLv1": {
        "areaId": "RestroomZone",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Unlock Restroom",
        "upgradeDesc": "Unlock Restroom",
        "price": 10000,
        "exchange": {},
        "levelConditions": {},
        "relatedQuests": [
            "task.mall.c.05"
        ],
        "perks": [],
        "levelUpIcon": "RestroomZoneLv1"
    },
    "BlackmarketMoreitemLv1": {
        "areaId": "BlackmarketMoreitem",
        "categoryId": "HQPAD",
        "level": 1,
        "upgradeName": "Procurement System",
        "upgradeDesc": "More goods",
        "price": 120000,
        "exchange": {
            "misc_hammer": 2,
            "misc_b_recorder": 2,
            "misc_b_1battery": 3
        },
        "levelConditions": {
            "AreaUpgradeArea": 1,
            "Player": 16
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.black_market.item_count.add",
                "perkClass": "BlackmarketMoreitem_C",
                "description": "The supply market can provide a wider range of goods",
                "value": null
            }
        ],
        "levelUpIcon": "BlackmarketMoreitemLv1"
    },
    "BlackmarketMoreitemLv2": {
        "areaId": "BlackmarketMoreitem",
        "categoryId": "HQPAD",
        "level": 2,
        "upgradeName": "Procurement System",
        "upgradeDesc": "More goods",
        "price": 280000,
        "exchange": {
            "misc_b_recorder": 2,
            "misc_b_powerbank": 2,
            "misc_b_oldphone": 3,
            "misc_b_militaryusbdrive": 2
        },
        "levelConditions": {
            "BlackmarketMoreitem": 1,
            "Player": 25
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.black_market.item_count.add",
                "perkClass": "BlackmarketMoreitem_C",
                "description": "The supply market can provide a wider range of goods",
                "value": null
            }
        ],
        "levelUpIcon": "BlackmarketMoreitemLv2"
    },
    "BlackmarketQualityLv1": {
        "areaId": "BlackmarketQuality",
        "categoryId": "HQPAD",
        "level": 1,
        "upgradeName": "Procurement Quality",
        "upgradeDesc": "Higher quality",
        "price": 120000,
        "exchange": {
            "misc_b_recorder": 2,
            "misc_b_powerbank": 2,
            "misc_b_ram": 2,
            "misc_b_tape": 5
        },
        "levelConditions": {
            "BlackmarketMoreitem": 1,
            "Player": 17
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.black_market.quality.value",
                "perkClass": "BlackmarketQuality_C",
                "description": "The quality of goods provided by the supply market is higher",
                "value": null
            }
        ],
        "levelUpIcon": "BlackmarketQualityLv1"
    },
    "BlackmarketQualityLv2": {
        "areaId": "BlackmarketQuality",
        "categoryId": "HQPAD",
        "level": 2,
        "upgradeName": "Procurement Quality",
        "upgradeDesc": "Higher quality",
        "price": 300000,
        "exchange": {
            "misc_bpu": 3,
            "misc_copperwire": 6,
            "misc_b_transformer": 2,
            "misc_b_piezometer": 3
        },
        "levelConditions": {
            "BlackmarketQuality": 1,
            "Player": 27
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.black_market.quality.value",
                "perkClass": "BlackmarketQuality_C",
                "description": "The quality of goods provided by the supply market is higher",
                "value": null
            }
        ],
        "levelUpIcon": "BlackmarketQualityLv2"
    },
    "BlackmarketQualityLv3": {
        "areaId": "BlackmarketQuality",
        "categoryId": "HQPAD",
        "level": 3,
        "upgradeName": "Procurement Quality",
        "upgradeDesc": "Higher quality",
        "price": 520000,
        "exchange": {
            "misc_graphiccard": 2,
            "misc_b_militaryusbdrive": 2,
            "misc_b_militaryharddrive": 1,
            "misc_b_digitalsensor": 2
        },
        "levelConditions": {
            "BlackmarketQuality": 2,
            "Generator": 3,
            "Player": 40
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.black_market.quality.value",
                "perkClass": "BlackmarketQuality_C",
                "description": "The quality of goods provided by the supply market is higher",
                "value": null
            }
        ],
        "levelUpIcon": "BlackmarketQualityLv3"
    },
    "AreaUpgradeAreaLv1": {
        "areaId": "AreaUpgradeArea",
        "categoryId": "HQPAD",
        "level": 1,
        "upgradeName": "Storage",
        "upgradeDesc": "Expand Junk Box Capacity",
        "price": 488500,
        "exchange": {
            "misc_wastechip": 2,
            "misc_b_flashlight": 2,
            "misc_b_ionbattery": 2,
            "misc_b_tapeplayer": 1
        },
        "levelConditions": {
            "StorageZoneLock1": 1,
            "Player": 14
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.area.upgrade.perk.value",
                "perkClass": "UpgradeAreaPerk_C",
                "description": "",
                "value": 40
            }
        ],
        "levelUpIcon": "AreaUpgradeAreaLv1"
    },
    "AreaUpgradeAreaLv2": {
        "areaId": "AreaUpgradeArea",
        "categoryId": "HQPAD",
        "level": 2,
        "upgradeName": "Storage",
        "upgradeDesc": "Expand Junk Box Capacity",
        "price": 807000,
        "exchange": {
            "misc_b_wirecutting": 3,
            "misc_wastechip": 2,
            "misc_screwdriver": 2,
            "misc_b_storagebattery": 1
        },
        "levelConditions": {
            "AreaUpgradeArea": 1,
            "Player": 23
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.area.upgrade.perk.value",
                "perkClass": "UpgradeAreaPerk_C",
                "description": "",
                "value": 60
            }
        ],
        "levelUpIcon": "AreaUpgradeAreaLv2"
    },
    "AreaUpgradeAreaLv3": {
        "areaId": "AreaUpgradeArea",
        "categoryId": "HQPAD",
        "level": 3,
        "upgradeName": "Storage",
        "upgradeDesc": "Expand Junk Box Capacity",
        "price": 1530200,
        "exchange": {
            "misc_wastechip": 5,
            "misc_screwdriver": 5,
            "misc_b_storagebattery": 2,
            "misc_b_militaryharddrive": 1
        },
        "levelConditions": {
            "AreaUpgradeArea": 2,
            "Intelligent": 3,
            "Player": 35
        },
        "relatedQuests": [],
        "perks": [
            {
                "key": "warfare.area.upgrade.perk.value",
                "perkClass": "UpgradeAreaPerk_C",
                "description": "",
                "value": 80
            }
        ],
        "levelUpIcon": "AreaUpgradeAreaLv3"
    }
} as const;

/** Quest text for the upgrades `relatedQuests` points at. Curated - not in the game files. */
export const hideoutUpgradesTasks = {
    "task.mall.1": {
        "name": "Lights On",
        "info": "Hope that safe container is serving you well.\nNow, if you're interested—I can also upgrade your hideout. Just check the [Hideout tab] in your terminal, or come find me directly. I can upgrade specific rooms and utilities.\nRight now though… it's pitch black in there. I;m working under emergency lighting.\nHelp me out and find some [flammables]—I'll use them to mix fuel and get the generator running again.",
    },
    "task.mall.2": {
        "name": "The Source of Life",
        "info": "[Unlocks Water Collector's upgrades]\nWater has become super valuable these days, but those scavengers messed up our water collection system's pipes.\nI'm in the middle of fixing the pipes, but I'd really appreciate it if you could go [deal with those troublemakers] and show them they can't just mess with our stuff.\nAfter that, the medical area will can be available for upgrade, allowing you to recover health faster in the hideout.",
    },
    "task.mall.3": {
        "name": "Handy Tool",
        "info": "[Unlocks Generator's upgrades]\nBy the way, upgrading the the facilities will help you grow. My personal tip is to upgrade the generator first, since having power is the foundation for upgrading other facility.\nIf you need to upgrade the generator, could you help me out by getting my trusty drill back? I remember leaving it behind at the [bakery] in [Hyder Town] when I escaped.",
    },
    "task.mall.4": {
        "name": "Homecoming",
        "info": "[Unlocks Lounge/Book Shelf/Sofa's upgrades]\nYou've really done a great job setting this place up; it reminds me of home... Sorry, I guess I'm just missing my family a bit. Maybe you could do me a favor, and I can help you spruce up the lounge area a bit. Having a nice, comfortable space to rest will really help you in battle.\nCould you check out [Hyder Town] for me? My house is the first one at the east entrance of the town. If you could grab my precious [family videotapes], I'd really appreciate it. Looking forward to hearing from you!",
    },
    "task.mall.5": {
        "name": "Speaking of Finance",
        "info": "[Unlocks Bitcoin Mine's upgrades]\nIf you're looking to secure some steady income, I recommend building and upgrading your [Bitcoin mining rig]. It'll use up some power but will bring you in some money every now and then. The more graphics cards you can get and install in there, the more money your mine can make. Just remember to keep an eye on the [generator's fuel level].\nIf you want to set up the Bitcoin mining rig, could you grab me [5 electronic devices]? I'll get those machines sorted out.",
    },
    "task.mall.6": {
        "name": "Target Practice",
        "info": "[Unlocks Shooting Range's upgrades]\nHi there, I heard from Maggie that you helped her retrieve the radio, and I'm glad to see her research is going smoothly. By the way, while I was rummaging through some old stuff, I found the blueprints for our HQ.\nHere's some good news: I figured out how to unlock the shooting range behind the house. However, I still need a little favor from you. Could you please bring back the [small key] from the [office room] on the [1F of the police station in Hyder town]? I know this is nothing for you! Good luck!",
    }
} as const;

/**
 * Pin icons, keyed by area and by category. Paths are relative to `/images/hideout/`.
 */
export const areaIcons = {
    "RestRoom": {
        "icon": "areas/RestRoom.webp",
        "alt": "Toilet"
    },
    "Sofa": {
        "icon": "areas/Sofa.webp",
        "alt": "Sofa"
    },
    "Bookcase": {
        "icon": "areas/Bookcase.webp",
        "alt": "Bookdesk"
    },
    "TVSet": {
        "icon": "areas/TVSet.webp",
        "alt": "TV Set"
    },
    "MedicalArea": {
        "icon": "areas/MedicalArea.webp",
        "alt": "Medical Area"
    },
    "OperationBed": {
        "icon": "areas/OperationBed.webp",
        "alt": "Operating Bed"
    },
    "Planting": {
        "icon": "areas/Planting.webp",
        "alt": "Plant Stand"
    },
    "MedDesk": {
        "icon": "areas/MedDesk.webp",
        "alt": "Med Desk"
    },
    "WaterCollector": {
        "icon": "areas/WaterCollector.webp",
        "alt": "Water Collector"
    },
    "KitchenArea": {
        "icon": "areas/KitchenArea.webp",
        "alt": "Kitchen Area"
    },
    "Refrigerator": {
        "icon": "areas/Refrigerator.webp",
        "alt": "Refrigerator"
    },
    "MicrowaveOven": {
        "icon": "areas/MicrowaveOven.webp",
        "alt": "Microwave"
    },
    "CoffeeMaker": {
        "icon": "areas/CoffeeMaker.webp",
        "alt": "Coffee Maker"
    },
    "Intelligent": {
        "icon": "areas/Intelligent.webp",
        "alt": "Intel Center"
    },
    "CryptoMining": {
        "icon": "areas/CryptoMining.webp",
        "alt": "Bitcoin Mine"
    },
    "Generator": {
        "icon": "areas/Generator.webp",
        "alt": "Generator"
    },
    "ShootingRange": {
        "icon": "areas/ShootingRange.webp",
        "alt": "Shooting Range"
    },
    "WorkshopZone": {
        "icon": "areas/WorkshopZone.webp",
        "alt": "Workshop"
    },
    "StorageExpansionStart": {
        "icon": "areas/StorageExpansionStart.webp",
        "alt": "Starter‘s Storage Expansion"
    },
    "StorageZoneLock1": {
        "icon": "areas/StorageZoneLock1.webp",
        "alt": "Storage Room A"
    },
    "StorageZoneLock2": {
        "icon": "areas/StorageZoneLock2.webp",
        "alt": "Storage Room B"
    },
    "StorageZoneLock3": {
        "icon": "areas/StorageZoneLock3.webp",
        "alt": "Storage Room C"
    },
    "StorageZoneLock4": {
        "icon": "areas/StorageZoneLock4.webp",
        "alt": "Storage Room D"
    },
    "Gunsmith": {
        "icon": "areas/Gunsmith.webp",
        "alt": "Gunsmith"
    },
    "GeneratorZone": {
        "icon": "areas/GeneratorZone.webp",
        "alt": "Unlock Generator Zone"
    },
    "RestroomZone": {
        "icon": "areas/RestroomZone.webp",
        "alt": "Unlock Restroom"
    },
    "BlackmarketMoreitem": {
        "icon": "areas/BlackmarketMoreitem.webp",
        "alt": "Procurement System"
    },
    "BlackmarketQuality": {
        "icon": "areas/BlackmarketQuality.webp",
        "alt": "Procurement Quality"
    },
    "AreaUpgradeArea": {
        "icon": "areas/AreaUpgradeArea.webp",
        "alt": "Storage"
    },
    "HQPAD": {
        "icon": "areas/HQPAD.webp",
        "alt": "Storage Zone"
    },
    "Lounge": {
        "icon": "areas/Lounge.webp",
        "alt": "Lounge"
    },
    "None": {
        "icon": "Image_bg_close.webp",
        "alt": "Back"
    }
} as const;

/**
 * Categories that are not also areas, so the map has to add a pin for them explicitly. `Lounge`
 * has always been one; S5 adds `HQPAD`. Derived, so next season maintains itself.
 */
export const categoriesWithoutArea: readonly string[] = ["HQPAD","Lounge"];
