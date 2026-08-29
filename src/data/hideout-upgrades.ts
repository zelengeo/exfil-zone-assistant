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

export const hideoutUpgrades = {
    "RestRoomLv1": {
        "areaId": "RestRoom",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Toilet",
        "upgradeDesc": "Increased EXP Gain",
        "price": 120000,
        "exchange": {
            "misc_b_toiletpaper": 2,
            "misc_hammer": 1,
            "misc_b_pesticide": 1,
            "misc_b_rustedcleaner": 1
        },
        "levelConditions": {
            "WaterCollector": 1,
            "RestroomZone": 1
        },
        "relatedQuests": [
            "task.mall.4"
        ],
        "levelUpIcon": "RestRoomLv1"
    },
    "RestRoomLv2": {
        "areaId": "RestRoom",
        "categoryId": "None",
        "level": 2,
        "upgradeName": "Toilet",
        "upgradeDesc": "Increased EXP Gain",
        "price": 228000,
        "exchange": {
            "misc_b_toiletpaper": 3,
            "misc_b_beardoil": 3,
            "misc_barcleaner": 3,
            "misc_b_shampoo": 3
        },
        "levelConditions": {
            "RestRoom": 1,
            "Player": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "RestRoomLv2"
    },
    "RestRoomLv3": {
        "areaId": "RestRoom",
        "categoryId": "None",
        "level": 3,
        "upgradeName": "Toilet",
        "upgradeDesc": "Increased EXP Gain",
        "price": 350000,
        "exchange": {
            "misc_b_toiletpaper": 8,
            "misc_b_deodorant": 8,
            "misc_b_shampoo": 5,
            "misc_b_piezometer": 5
        },
        "levelConditions": {
            "RestRoom": 1,
            "Player": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "RestRoomLv3"
    },
    "SofaLv1": {
        "areaId": "Sofa",
        "categoryId": "Lounge",
        "level": 1,
        "upgradeName": "Sofa",
        "upgradeDesc": "Increased Carry Weight Capacity",
        "price": 50000,
        "exchange": {
            "misc_blimbingrope": 5,
            "misc_b_tire_sealant": 3,
            "misc_b_plier_large": 3,
            "misc_hammer": 5
        },
        "levelConditions": {
            "WorkshopZone": 1,
            "RestroomZone": 1
        },
        "relatedQuests": [
            "task.mall.4"
        ],
        "levelUpIcon": "SofaLv1"
    },
    "SofaLv2": {
        "areaId": "Sofa",
        "categoryId": "Lounge",
        "level": 2,
        "upgradeName": "Sofa",
        "upgradeDesc": "Increased Carry Weight Capacity",
        "price": 128000,
        "exchange": {
            "misc_b_superglue": 2,
            "misc_b_magazine": 5,
            "misc_b_insulatingtape": 8,
            "misc_blimbingrope": 5
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "SofaLv2"
    },
    "SofaLv3": {
        "areaId": "Sofa",
        "categoryId": "Lounge",
        "level": 3,
        "upgradeName": "Sofa",
        "upgradeDesc": "Increased Carry Weight Capacity",
        "price": 500000,
        "exchange": {
            "misc_b_gameconsole": 2,
            "misc_b_tire_sealant": 8,
            "misc_b_deodorant": 6,
            "misc_b_defibrillator": 1
        },
        "levelConditions": {
            "Generator": 3
        },
        "relatedQuests": [],
        "levelUpIcon": "SofaLv3"
    },
    "BookcaseLv1": {
        "areaId": "Bookcase",
        "categoryId": "Lounge",
        "level": 1,
        "upgradeName": "Bookdesk",
        "upgradeDesc": "Reduced Magazine Load Time",
        "price": 50000,
        "exchange": {
            "misc_b_flashlight": 5,
            "misc_b_lightbulb": 5,
            "misc_b_socket": 3,
            "misc_b_civilradio": 2
        },
        "levelConditions": {
            "WorkshopZone": 1,
            "RestroomZone": 1
        },
        "relatedQuests": [
            "task.mall.4"
        ],
        "levelUpIcon": "BookcaseLv1"
    },
    "BookcaseLv2": {
        "areaId": "Bookcase",
        "categoryId": "Lounge",
        "level": 2,
        "upgradeName": "Bookdesk",
        "upgradeDesc": "Reduced Magazine Load Time",
        "price": 180000,
        "exchange": {
            "misc_b_tape": 8,
            "misc_b_antiquebook": 4,
            "misc_b_recorder": 5,
            "misc_b_powerbank": 4
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "BookcaseLv2"
    },
    "BookcaseLv3": {
        "areaId": "Bookcase",
        "categoryId": "Lounge",
        "level": 3,
        "upgradeName": "Bookdesk",
        "upgradeDesc": "Reduced Magazine Load Time",
        "price": 420000,
        "exchange": {
            "misc_b_transformer": 2,
            "misc_bomputertextbook": 8,
            "misc_b_digitalsensor": 2,
            "misc_b_antiquebook": 6
        },
        "levelConditions": {
            "Generator": 3
        },
        "relatedQuests": [],
        "levelUpIcon": "BookcaseLv3"
    },
    "TVSetLv1": {
        "areaId": "TVSet",
        "categoryId": "Lounge",
        "level": 1,
        "upgradeName": "TV Set",
        "upgradeDesc": "Reduced Scav Mode Cooldown",
        "price": 50000,
        "exchange": {
            "misc_1batterie_2": 3,
            "misc_b_1battery": 3,
            "misc_b_ionbattery": 3,
            "misc_b_civilradio": 3
        },
        "levelConditions": {
            "Player": 5,
            "WorkshopZone": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "TVSetLv1"
    },
    "TVSetLv2": {
        "areaId": "TVSet",
        "categoryId": "Lounge",
        "level": 2,
        "upgradeName": "TV Set",
        "upgradeDesc": "Reduced Scav Mode Cooldown",
        "price": 180000,
        "exchange": {
            "misc_1batterie_2": 5,
            "misc_b_1battery": 5,
            "misc_videotape": 1,
            "misc_b_electricdrill": 1
        },
        "levelConditions": {
            "Generator": 2,
            "Player": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "TVSetLv2"
    },
    "TVSetLv3": {
        "areaId": "TVSet",
        "categoryId": "Lounge",
        "level": 3,
        "upgradeName": "TV Set",
        "upgradeDesc": "Reduced Scav Mode Cooldown",
        "price": 420000,
        "exchange": {
            "misc_1batterie_2": 8,
            "misc_b_1battery": 8,
            "misc_videotape": 5,
            "misc_b_rat_poison": 2
        },
        "levelConditions": {
            "Generator": 3,
            "Player": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "TVSetLv3"
    },
    "MedicalAreaLv1": {
        "areaId": "MedicalArea",
        "categoryId": "MedicalArea",
        "level": 1,
        "upgradeName": "Medical Area",
        "upgradeDesc": "Slowly regenerate health while in HQ;\r\nUnlocks Operation Bed, Planting, and Med Desk.",
        "price": 70000,
        "exchange": {
            "misc_b_disinfectingwipes": 1,
            "misc_b_bandaid": 2,
            "misc_b_toiletpaper": 2
        },
        "levelConditions": {},
        "relatedQuests": [
            "task.doc.c.04"
        ],
        "levelUpIcon": "MedicalAreaLv1"
    },
    "OperationBedLv1": {
        "areaId": "OperationBed",
        "categoryId": "MedicalArea",
        "level": 1,
        "upgradeName": "Operating Bed",
        "upgradeDesc": "Faster HP Regeneration in HQ",
        "price": 60000,
        "exchange": {
            "misc_b_medicalkit": 2,
            "misc_b_flashlight": 2,
            "misc_b_pipeline": 1,
            "misc_b_iodophor": 1
        },
        "levelConditions": {
            "MedicalArea": 1
        },
        "relatedQuests": [
            "task.doc.b.06"
        ],
        "levelUpIcon": "OperationBedLv1"
    },
    "OperationBedLv2": {
        "areaId": "OperationBed",
        "categoryId": "MedicalArea",
        "level": 2,
        "upgradeName": "Operating Bed",
        "upgradeDesc": "Faster HP Regeneration in HQ",
        "price": 120000,
        "exchange": {
            "misc_b_bottledglucose": 5,
            "misc_b_medicalscissors": 3,
            "misc_b_bandaid": 2,
            "misc_bentrifuge": 1
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "OperationBedLv2"
    },
    "OperationBedLv3": {
        "areaId": "OperationBed",
        "categoryId": "MedicalArea",
        "level": 3,
        "upgradeName": "Operating Bed",
        "upgradeDesc": "Faster HP Regeneration in HQ",
        "price": 240000,
        "exchange": {
            "misc_b_bottledglucose": 10,
            "misc_b_medicalscissors": 5,
            "misc_b_uvlight": 3,
            "misc_bentrifuge": 1
        },
        "levelConditions": {
            "Player": 1,
            "WaterCollector": 3
        },
        "relatedQuests": [],
        "levelUpIcon": "OperationBedLv3"
    },
    "PlantingLv1": {
        "areaId": "Planting",
        "categoryId": "MedicalArea",
        "level": 1,
        "upgradeName": "Plant Stand",
        "upgradeDesc": "Improved Food Recovery Efficiency",
        "price": 70000,
        "exchange": {
            "misc_b_disinfectingwipes": 2,
            "misc_b_pipeline": 1,
            "misc_b_lightbulb": 2,
            "misc_b_insulatingtape": 1
        },
        "levelConditions": {
            "MedicalArea": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "PlantingLv1"
    },
    "PlantingLv2": {
        "areaId": "Planting",
        "categoryId": "MedicalArea",
        "level": 2,
        "upgradeName": "Plant Stand",
        "upgradeDesc": "Improved Food Recovery Efficiency",
        "price": 220000,
        "exchange": {
            "misc_b_moldboard": 6,
            "misc_b_aspire": 2,
            "misc_b_pesticide": 5,
            "misc_b_gaspipewrench": 2
        },
        "levelConditions": {
            "Generator": 2,
            "Player": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "PlantingLv2"
    },
    "PlantingLv3": {
        "areaId": "Planting",
        "categoryId": "MedicalArea",
        "level": 3,
        "upgradeName": "Plant Stand",
        "upgradeDesc": "Improved Food Recovery Efficiency",
        "price": 340000,
        "exchange": {
            "misc_b_moldboard": 12,
            "misc_b_match": 6,
            "misc_b_iodophor": 6,
            "misc_b_gaspipewrench": 3
        },
        "levelConditions": {
            "WaterCollector": 3,
            "Player": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "PlantingLv3"
    },
    "MedDeskLv1": {
        "areaId": "MedDesk",
        "categoryId": "MedicalArea",
        "level": 1,
        "upgradeName": "Med Desk",
        "upgradeDesc": "Improved Hydration Recovery Efficiency",
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
        "relatedQuests": [],
        "levelUpIcon": "MedDeskLv1"
    },
    "MedDeskLv2": {
        "areaId": "MedDesk",
        "categoryId": "MedicalArea",
        "level": 2,
        "upgradeName": "Med Desk",
        "upgradeDesc": "Improved Hydration Recovery Efficiency",
        "price": 220000,
        "exchange": {
            "misc_b_uvlight": 3,
            "misc_b_medicalkit": 6,
            "misc_b_asthmamedication": 4,
            "misc_bentrifuge": 2
        },
        "levelConditions": {
            "WaterCollector": 1,
            "Generator": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "MedDeskLv2"
    },
    "MedDeskLv3": {
        "areaId": "MedDesk",
        "categoryId": "MedicalArea",
        "level": 3,
        "upgradeName": "Med Desk",
        "upgradeDesc": "Improved Hydration Recovery Efficiency",
        "price": 340000,
        "exchange": {
            "misc_b_uvlight": 5,
            "misc_b_medicalkit": 9,
            "misc_b_asthmamedication": 5,
            "misc_bentrifuge": 3
        },
        "levelConditions": {
            "WaterCollector": 3
        },
        "relatedQuests": [],
        "levelUpIcon": "MedDeskLv3"
    },
    "WaterCollectorLv1": {
        "areaId": "WaterCollector",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Water Collector",
        "upgradeDesc": "Faster Hydration Regeneration in HQ",
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
        "levelUpIcon": "WaterCollectorLv1"
    },
    "WaterCollectorLv2": {
        "areaId": "WaterCollector",
        "categoryId": "None",
        "level": 2,
        "upgradeName": "Water Collector",
        "upgradeDesc": "Faster Hydration Regeneration in HQ",
        "price": 50000,
        "exchange": {
            "misc_b_pipeline": 5,
            "misc_b_insulatingtape": 5,
            "misc_b_nail": 6,
            "misc_b_spraycan": 2
        },
        "levelConditions": {
            "WaterCollector": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "WaterCollectorLv2"
    },
    "WaterCollectorLv3": {
        "areaId": "WaterCollector",
        "categoryId": "None",
        "level": 3,
        "upgradeName": "Water Collector",
        "upgradeDesc": "Faster Hydration Regeneration in HQ",
        "price": 100000,
        "exchange": {
            "misc_b_pipeline": 10,
            "misc_barcleaner": 4,
            "misc_b_storagebattery": 3,
            "misc_b_piezometer": 1
        },
        "levelConditions": {
            "WaterCollector": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "WaterCollectorLv3"
    },
    "KitchenAreaLv1": {
        "areaId": "KitchenArea",
        "categoryId": "KitchenArea",
        "level": 1,
        "upgradeName": "Kitchen Area",
        "upgradeDesc": "Unlocks Coffee Machine, Microwave, Refrigerator\r\nIncreased Energy & Hydration Cap",
        "price": 70000,
        "exchange": {
            "misc_b_oliveoil": 3,
            "misc_b_saltcan": 2,
            "misc_b_gastank": 1,
            "misc_b_plier_large": 1
        },
        "levelConditions": {
            "WaterCollector": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "KitchenAreaLv1"
    },
    "KitchenAreaLv2": {
        "areaId": "KitchenArea",
        "categoryId": "KitchenArea",
        "level": 2,
        "upgradeName": "Kitchen Area",
        "upgradeDesc": "Increased Energy & Hydration Cap",
        "price": 220000,
        "exchange": {
            "misc_b_gastank": 4,
            "misc_b_insulatingtape": 4,
            "misc_b_pesticide": 5,
            "misc_b_wd40": 5
        },
        "levelConditions": {
            "KitchenArea": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "KitchenAreaLv2"
    },
    "KitchenAreaLv3": {
        "areaId": "KitchenArea",
        "categoryId": "KitchenArea",
        "level": 3,
        "upgradeName": "Kitchen Area",
        "upgradeDesc": "Increased Energy & Hydration Cap",
        "price": 330000,
        "exchange": {
            "misc_b_oliveoil": 5,
            "misc_b_insulatingtape": 4,
            "misc_b_saltcan": 6,
            "misc_b_lighter": 4
        },
        "levelConditions": {
            "KitchenArea": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "KitchenAreaLv3"
    },
    "KitchenAreaLv4": {
        "areaId": "KitchenArea",
        "categoryId": "KitchenArea",
        "level": 4,
        "upgradeName": "Kitchen Area",
        "upgradeDesc": "Increased Energy & Hydration Cap",
        "price": 450000,
        "exchange": {
            "misc_copperwire": 5,
            "misc_b_gaspipewrench": 4,
            "misc_b_insulatingtape": 4,
            "misc_b_lighter": 5
        },
        "levelConditions": {
            "KitchenArea": 3
        },
        "relatedQuests": [],
        "levelUpIcon": "KitchenAreaLv4"
    },
    "RefrigeratorLv1": {
        "areaId": "Refrigerator",
        "categoryId": "KitchenArea",
        "level": 1,
        "upgradeName": "Refrigerator",
        "upgradeDesc": "Faster Energy Regeneration in HQ",
        "price": 90000,
        "exchange": {
            "misc_oilcan": 2,
            "misc_blimbingrope": 2,
            "misc_b_spraycan": 1,
            "misc_b_plier_large": 1
        },
        "levelConditions": {
            "KitchenArea": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "RefrigeratorLv1"
    },
    "RefrigeratorLv2": {
        "areaId": "Refrigerator",
        "categoryId": "KitchenArea",
        "level": 2,
        "upgradeName": "Refrigerator",
        "upgradeDesc": "Faster Energy Regeneration in HQ",
        "price": 160000,
        "exchange": {
            "misc_b_oliveoil": 2,
            "misc_b_match": 2,
            "misc_b_wirecutting": 4,
            "misc_b_socket": 2
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "RefrigeratorLv2"
    },
    "RefrigeratorLv3": {
        "areaId": "Refrigerator",
        "categoryId": "KitchenArea",
        "level": 3,
        "upgradeName": "Refrigerator",
        "upgradeDesc": "Faster Energy Regeneration in HQ",
        "price": 240000,
        "exchange": {
            "misc_b_oliveoil": 4,
            "misc_b_match": 4,
            "misc_b_plier_large": 8,
            "misc_copperwire": 2
        },
        "levelConditions": {},
        "relatedQuests": [],
        "levelUpIcon": "RefrigeratorLv3"
    },
    "MicrowaveOvenLv1": {
        "areaId": "MicrowaveOven",
        "categoryId": "KitchenArea",
        "level": 1,
        "upgradeName": "Microwave",
        "upgradeDesc": "Slower In-Raid Energy Drain",
        "price": 90000,
        "exchange": {
            "misc_b_oliveoil": 2,
            "misc_b_plier_large": 1,
            "misc_b_tire_sealant": 2,
            "misc_b_moldboard": 1
        },
        "levelConditions": {
            "KitchenArea": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "MicrowaveOvenLv1"
    },
    "MicrowaveOvenLv2": {
        "areaId": "MicrowaveOven",
        "categoryId": "KitchenArea",
        "level": 2,
        "upgradeName": "Microwave",
        "upgradeDesc": "Slower In-Raid Energy Drain",
        "price": 200000,
        "exchange": {
            "misc_b_plier_large": 8,
            "misc_b_gastank": 8,
            "misc_wastechip": 5,
            "misc_b_oliveoil": 3
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "MicrowaveOvenLv2"
    },
    "MicrowaveOvenLv3": {
        "areaId": "MicrowaveOven",
        "categoryId": "KitchenArea",
        "level": 3,
        "upgradeName": "Microwave",
        "upgradeDesc": "Slower In-Raid Energy Drain",
        "price": 300000,
        "exchange": {
            "misc_copperwire": 6,
            "misc_b_lighter": 6,
            "misc_b_wd40": 12,
            "misc_b_digitalsensor": 2
        },
        "levelConditions": {
            "Generator": 3
        },
        "relatedQuests": [],
        "levelUpIcon": "MicrowaveOvenLv3"
    },
    "CoffeeMakerLv1": {
        "areaId": "CoffeeMaker",
        "categoryId": "KitchenArea",
        "level": 1,
        "upgradeName": "Coffee Maker",
        "upgradeDesc": "Slower In-Raid Hydration Drain",
        "price": 90000,
        "exchange": {
            "misc_b_gastank": 2,
            "misc_b_plier_large": 1,
            "misc_wastechip": 2,
            "misc_b_wirecutting": 1
        },
        "levelConditions": {
            "KitchenArea": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "CoffeeMakerLv1"
    },
    "CoffeeMakerLv2": {
        "areaId": "CoffeeMaker",
        "categoryId": "KitchenArea",
        "level": 2,
        "upgradeName": "Coffee Maker",
        "upgradeDesc": "Slower In-Raid Hydration Drain",
        "price": 200000,
        "exchange": {
            "misc_b_nut": 5,
            "misc_barcleaner": 3,
            "misc_b_gameconsole": 1,
            "misc_b_saltcan": 6
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "CoffeeMakerLv2"
    },
    "CoffeeMakerLv3": {
        "areaId": "CoffeeMaker",
        "categoryId": "KitchenArea",
        "level": 3,
        "upgradeName": "Coffee Maker",
        "upgradeDesc": "Slower In-Raid Hydration Drain",
        "price": 300000,
        "exchange": {
            "misc_b_nut": 12,
            "misc_b_electricdrill": 3,
            "misc_copperwire": 3,
            "misc_b_lighter": 3
        },
        "levelConditions": {
            "Generator": 3
        },
        "relatedQuests": [],
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
        "relatedQuests": [],
        "levelUpIcon": "IntelligentLv1"
    },
    "IntelligentLv2": {
        "areaId": "Intelligent",
        "categoryId": "None",
        "level": 2,
        "upgradeName": "Intel Center",
        "upgradeDesc": "Increased EXP Gain",
        "price": 160000,
        "exchange": {
            "misc_b_opticaldisc": 4,
            "misc_b_tape": 3,
            "misc_notebook": 3,
            "misc_radio": 2
        },
        "levelConditions": {
            "WorkshopZone": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "IntelligentLv2"
    },
    "IntelligentLv3": {
        "areaId": "Intelligent",
        "categoryId": "None",
        "level": 3,
        "upgradeName": "Intel Center",
        "upgradeDesc": "Increased EXP Gain",
        "price": 320000,
        "exchange": {
            "misc_b_opticaldisc": 6,
            "misc_b_tape": 3,
            "misc_videotape": 2,
            "misc_b_powerbank": 3
        },
        "levelConditions": {
            "Intelligent": 2,
            "RestRoom": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "IntelligentLv3"
    },
    "IntelligentLv4": {
        "areaId": "Intelligent",
        "categoryId": "None",
        "level": 4,
        "upgradeName": "Intel Center",
        "upgradeDesc": "Increased EXP Gain",
        "price": 500000,
        "exchange": {
            "misc_b_opticaldisc": 10,
            "misc_b_digitalsensor": 4,
            "misc_floppydisk": 3,
            "misc_b_visionmodule": 1
        },
        "levelConditions": {
            "Intelligent": 3,
            "RestRoom": 3
        },
        "relatedQuests": [],
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
            "misc_b_rustedcleaner": 5,
            "misc_b_ram": 6,
            "misc_b_harddrive": 5
        },
        "levelConditions": {},
        "relatedQuests": [
            "task.mall.b.02"
        ],
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
            "misc_bpu": 4,
            "misc_b_pcfan": 6,
            "misc_b_ram": 4,
            "misc_floppydisk": 4
        },
        "levelConditions": {
            "CryptoMining": 1
        },
        "relatedQuests": [],
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
            "misc_bpu": 4,
            "misc_b_pcfan": 8,
            "misc_b_ram": 6,
            "misc_b_harddrive": 6
        },
        "levelConditions": {
            "CryptoMining": 2
        },
        "relatedQuests": [],
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
            "misc_bpu": 6,
            "misc_b_pcfan": 10,
            "misc_b_ram": 8,
            "misc_b_harddrive": 6
        },
        "levelConditions": {
            "CryptoMining": 3,
            "Generator": 3
        },
        "relatedQuests": [],
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
        "levelConditions": {},
        "relatedQuests": [],
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
            "misc_b_lighterfluid": 6,
            "misc_oilcan": 8,
            "misc_b_insulatingtape": 6,
            "misc_b_sparkplug": 1
        },
        "levelConditions": {
            "Generator": 1
        },
        "relatedQuests": [
            "task.mall.3"
        ],
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
            "misc_b_visionmodule": 4,
            "misc_b_sparkplug": 4,
            "misc_b_transformer": 2,
            "misc_b_marinestoragebattery": 3
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [],
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
            "misc_b_tire_sealant": 3
        },
        "levelConditions": {},
        "relatedQuests": [
            "task.mall.c.06"
        ],
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
            "task.na.c.02"
        ],
        "levelUpIcon": "WorkshopZoneLv1"
    },
    "StorageExpansionStartLv1": {
        "areaId": "StorageExpansionStart",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Starter‘s Storage Expansion",
        "upgradeDesc": "Access to Starter‘s Storage",
        "price": 80000,
        "exchange": {
            "misc_b_screw": 2,
            "misc_b_nut": 2,
            "misc_barcleaner": 1,
            "misc_b_wrench": 2
        },
        "levelConditions": {},
        "relatedQuests": [],
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
            "misc_b_nail": 3,
            "misc_b_screw": 3,
            "misc_b_disinfectingwipes": 3,
            "misc_b_gastank_large": 3
        },
        "levelConditions": {
            "WorkshopZone": 1
        },
        "relatedQuests": [],
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
            "misc_b_gastank_large": 6,
            "misc_b_wrench": 6,
            "misc_screwdriver": 6,
            "misc_b_batter_large": 6
        },
        "levelConditions": {
            "WorkshopZone": 1
        },
        "relatedQuests": [],
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
            "misc_gunpowder": 10,
            "misc_b_smokelesspowder": 10,
            "misc_b_piezometer": 8,
            "misc_b_visionmodule": 6
        },
        "levelConditions": {
            "WorkshopZone": 1
        },
        "relatedQuests": [],
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
            "misc_b_lightbulb": 10,
            "misc_b_wrench": 10,
            "misc_b_medicalscissors": 5,
            "misc_b_defibrillator": 4
        },
        "levelConditions": {
            "WorkshopZone": 1,
            "StorageZoneLock3": 1
        },
        "relatedQuests": [],
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
            "WorkshopZone": 1
        },
        "relatedQuests": [],
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
            "misc_b_nail": 6,
            "misc_b_ceramic_adhesive": 8,
            "misc_floppydisk": 2
        },
        "levelConditions": {
            "WorkshopZone": 1
        },
        "relatedQuests": [],
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
            "misc_b_powerbank": 6,
            "misc_b_oldphone": 10,
            "misc_b_sparkplug": 6,
            "misc_b_civilradio": 4
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [],
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
            "misc_b_superglue": 10,
            "misc_b_newphone": 10,
            "misc_b_glue_large": 8,
            "misc_b_electricdrill": 6
        },
        "levelConditions": {
            "Generator": 3
        },
        "relatedQuests": [],
        "levelUpIcon": "GunsmithLv4"
    },
    "GeneratorZoneLv1": {
        "areaId": "GeneratorZone",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "GeneratorZone",
        "upgradeDesc": "Unlock Generator Zone",
        "price": 0,
        "exchange": {},
        "levelConditions": {},
        "relatedQuests": [
            "task.mall.c.01"
        ],
        "levelUpIcon": "GeneratorZoneLv1"
    },
    "RestroomZoneLv1": {
        "areaId": "RestroomZone",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Rest Area",
        "upgradeDesc": "Unlock Restroom",
        "price": 10000,
        "exchange": {},
        "levelConditions": {},
        "relatedQuests": [
            "task.mall.c.05"
        ],
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
            "misc_b_recorder": 3,
            "misc_b_1battery": 5
        },
        "levelConditions": {},
        "relatedQuests": [],
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
            "misc_b_recorder": 3,
            "misc_b_powerbank": 2,
            "misc_b_oldphone": 4,
            "misc_b_militaryusbdrive": 2
        },
        "levelConditions": {
            "BlackmarketMoreitem": 1
        },
        "relatedQuests": [],
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
            "misc_b_tape": 8
        },
        "levelConditions": {},
        "relatedQuests": [],
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
            "misc_bpu": 5,
            "misc_copperwire": 9,
            "misc_b_transformer": 2,
            "misc_b_piezometer": 4
        },
        "levelConditions": {
            "BlackmarketQuality": 1
        },
        "relatedQuests": [],
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
            "misc_graphiccard": 3,
            "misc_b_militaryusbdrive": 2,
            "misc_b_militaryharddrive": 1,
            "misc_b_digitalsensor": 2
        },
        "levelConditions": {
            "BlackmarketQuality": 2,
            "Generator": 3
        },
        "relatedQuests": [],
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
        "levelConditions": {},
        "relatedQuests": [],
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
            "misc_b_wirecutting": 4,
            "misc_wastechip": 3,
            "misc_screwdriver": 3,
            "misc_b_storagebattery": 1
        },
        "levelConditions": {
            "AreaUpgradeArea": 1
        },
        "relatedQuests": [],
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
            "misc_wastechip": 8,
            "misc_screwdriver": 8,
            "misc_b_storagebattery": 2,
            "misc_b_militaryharddrive": 1
        },
        "levelConditions": {
            "AreaUpgradeArea": 2,
            "Generator": 3
        },
        "relatedQuests": [],
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
        "alt": "GeneratorZone"
    },
    "RestroomZone": {
        "icon": "areas/RestroomZone.webp",
        "alt": "Rest Area"
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
