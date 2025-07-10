export const hideoutUpgrades = {
    // Paste the entire JSON data here

    "RestRoomLv1": {
        "areaId": "RestRoom",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Toilet",
        "upgradeDesc": "Character experience gain +2%",
        "price": 120000,
        "exchange": {
            "misc_b_toiletpaper": 1,
            "misc_b_rustedcleaner": 2,
            "misc_b_pesticide": 2,
            "misc_b_soap": 1
        },
        "levelConditions": {
            "WaterCollector": 1
        },
        "relatedQuests": [
            "task.mall.4"
        ],
        "levelUpIcon": "Image_rest_room"
    },
    "RestRoomLv2": {
        "areaId": "RestRoom",
        "categoryId": "None",
        "level": 2,
        "upgradeName": "Toilet",
        "upgradeDesc": "Character experience gain +5%",
        "price": 228000,
        "exchange": {
            "misc_b_shampoo": 3,
            "misc_b_ceramic_adhesive": 3,
            "misc_b_beardoil": 3,
            "misc_b_rat_poison": 1
        },
        "levelConditions": {
            "RestRoom": 1,
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_rest_room"
    },
    "RestRoomLv3": {
        "areaId": "RestRoom",
        "categoryId": "None",
        "level": 3,
        "upgradeName": "Toilet",
        "upgradeDesc": "Character experience gain +10%",
        "price": 350000,
        "exchange": {
            "misc_b_lightbulb": 8,
            "misc_b_pipeline": 5,
            "misc_b_spraycan": 5,
            "misc_b_piezometer": 3
        },
        "levelConditions": {
            "RestRoom": 1,
            "Player": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_rest_room"
    },
    "SofaLv1": {
        "areaId": "Sofa",
        "categoryId": "Lounge",
        "level": 1,
        "upgradeName": "Sofa",
        "upgradeDesc": "Increase weight bearing capacity to 75",
        "price": 50000,
        "exchange": {
            "misc_b_insulatingtape": 5,
            "misc_b_superglue": 3,
            "misc_b_glue_large": 3,
            "misc_b_deodorant": 5
        },
        "levelConditions": {
            "WorkshopZone": 1
        },
        "relatedQuests": [
            "task.mall.4"
        ],
        "levelUpIcon": "Image_Rest_sofa"
    },
    "SofaLv2": {
        "areaId": "Sofa",
        "categoryId": "Lounge",
        "level": 2,
        "upgradeName": "Sofa",
        "upgradeDesc": "Increase weight bearing capacity to 80",
        "price": 128000,
        "exchange": {
            "misc_b_gameconsole": 4,
            "misc_b_magazine": 4,
            "misc_b_insulatingtape": 10,
            "misc_blimbingrope": 3
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Rest_sofa"
    },
    "SofaLv3": {
        "areaId": "Sofa",
        "categoryId": "Lounge",
        "level": 3,
        "upgradeName": "Sofa",
        "upgradeDesc": "Increase weight bearing capacity to 90",
        "price": 500000,
        "exchange": {
            "misc_b_superglue": 4,
            "misc_b_deodorant": 8,
            "misc_b_tire_sealant": 6,
            "misc_b_defibrillator": 1
        },
        "levelConditions": {
            "Generator": 3
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Rest_sofa"
    },
    "BookcaseLv1": {
        "areaId": "Bookcase",
        "categoryId": "Lounge",
        "level": 1,
        "upgradeName": "Bookdesk",
        "upgradeDesc": "Manual ammo reloading time -10%",
        "price": 50000,
        "exchange": {
            "misc_notebook": 5,
            "misc_b_horrornovel": 5,
            "misc_b_magazine": 3,
            "misc_bomputertextbook": 2
        },
        "levelConditions": {
            "WorkshopZone": 1
        },
        "relatedQuests": [
            "task.mall.4"
        ],
        "levelUpIcon": "lImage_Mine_book"
    },
    "BookcaseLv2": {
        "areaId": "Bookcase",
        "categoryId": "Lounge",
        "level": 2,
        "upgradeName": "Bookdesk",
        "upgradeDesc": "Manual ammo reloading time -20%",
        "price": 180000,
        "exchange": {
            "misc_b_glue_large": 8,
            "misc_b_civilradio": 4,
            "misc_bomputertextbook": 5,
            "misc_b_antiquebook": 4
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "lImage_Mine_book"
    },
    "BookcaseLv3": {
        "areaId": "Bookcase",
        "categoryId": "Lounge",
        "level": 3,
        "upgradeName": "Bookdesk",
        "upgradeDesc": "Manual ammo reloading time -30%",
        "price": 420000,
        "exchange": {
            "misc_b_horrornovel": 10,
            "misc_bomputertextbook": 8,
            "misc_b_digitalsensor": 1,
            "misc_b_antiquebook": 6
        },
        "levelConditions": {
            "Generator": 3
        },
        "relatedQuests": [],
        "levelUpIcon": "lImage_Mine_book"
    },
    "TVSetLv1": {
        "areaId": "TVSet",
        "categoryId": "Lounge",
        "level": 1,
        "upgradeName": "TV Set",
        "upgradeDesc": "Scavenger mode CD -10%",
        "price": 50000,
        "exchange": {
            "misc_remote": 1,
            "misc_1batterie_2": 5,
            "misc_b_1battery": 5,
            "misc_b_civilradio": 2
        },
        "levelConditions": {
            "Player": 5,
            "WorkshopZone": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "lImage_Mine_TV"
    },
    "TVSetLv2": {
        "areaId": "TVSet",
        "categoryId": "Lounge",
        "level": 2,
        "upgradeName": "TV Set",
        "upgradeDesc": "Scavenger mode CD -20%",
        "price": 180000,
        "exchange": {
            "misc_b_transformer": 1,
            "misc_b_gaspipewrench": 3,
            "misc_videotape": 2,
            "misc_b_electricdrill": 1
        },
        "levelConditions": {
            "Generator": 2,
            "Player": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "lImage_Mine_TV"
    },
    "TVSetLv3": {
        "areaId": "TVSet",
        "categoryId": "Lounge",
        "level": 3,
        "upgradeName": "TV Set",
        "upgradeDesc": "Scavenger mode CD -30%",
        "price": 420000,
        "exchange": {
            "misc_b_dataline": 8,
            "misc_remote": 4,
            "misc_videotape": 2,
            "misc_b_rat_poison": 2
        },
        "levelConditions": {
            "Generator": 3,
            "Player": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "lImage_Mine_TV"
    },
    "MedicalAreaLv1": {
        "areaId": "MedicalArea",
        "categoryId": "MedicalArea",
        "level": 1,
        "upgradeName": "Medical Area",
        "upgradeDesc": "Access to a syringe holder.\nUnlocks Med Desk, Plant Stand, Operating Bed",
        "price": 100000,
        "exchange": {
            "misc_b_asthmamedication": 2,
            "misc_b_bandaid": 3,
            "misc_b_aspire": 1,
            "misc_b_iodophor": 1
        },
        "levelConditions": {
            "WaterCollector": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Medical_station"
    },
    "OperationBedLv1": {
        "areaId": "OperationBed",
        "categoryId": "MedicalArea",
        "level": 1,
        "upgradeName": "Operating Bed",
        "upgradeDesc": "Free limb damage repair available every hour.\r\nFaster health regeneration in Hideout.",
        "price": 60000,
        "exchange": {
            "misc_b_medicalscissors": 2,
            "misc_b_bottledglucose": 1,
            "misc_b_aspire": 1,
            "misc_b_iodophor": 1
        },
        "levelConditions": {
            "MedicalArea": 1,
            "RestRoom": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Operation_bed"
    },
    "OperationBedLv2": {
        "areaId": "OperationBed",
        "categoryId": "MedicalArea",
        "level": 2,
        "upgradeName": "Operating Bed",
        "upgradeDesc": "Faster health regeneration in Hideout.",
        "price": 120000,
        "exchange": {
            "misc_b_medicalscissors": 3,
            "misc_b_disinfectingwipes": 4,
            "misc_b_medicalkit": 2,
            "misc_bentrifuge": 1
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Operation_bed"
    },
    "OperationBedLv3": {
        "areaId": "OperationBed",
        "categoryId": "MedicalArea",
        "level": 3,
        "upgradeName": "Operating Bed",
        "upgradeDesc": "Faster health regeneration in Hideout.",
        "price": 240000,
        "exchange": {
            "misc_b_medicalscissors": 4,
            "misc_b_asthmamedication": 3,
            "misc_b_bandaid": 3,
            "misc_bentrifuge": 1
        },
        "levelConditions": {
            "Player": 1,
            "WaterCollector": 3
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Operation_bed"
    },
    "PlantingLv1": {
        "areaId": "Planting",
        "categoryId": "MedicalArea",
        "level": 1,
        "upgradeName": "Plant Stand",
        "upgradeDesc": "Food recovery +10%.",
        "price": 80000,
        "exchange": {
            "misc_b_smallshovel": 2,
            "misc_b_socket": 2,
            "misc_b_lightbulb": 5,
            "misc_b_rat_poison": 1
        },
        "levelConditions": {
            "MedicalArea": 1,
            "Player": 1,
            "RestRoom": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_plantiog"
    },
    "PlantingLv2": {
        "areaId": "Planting",
        "categoryId": "MedicalArea",
        "level": 2,
        "upgradeName": "Plant Stand",
        "upgradeDesc": "Food recovery +20%.",
        "price": 220000,
        "exchange": {
            "misc_b_moldboard": 6,
            "misc_b_gaspipewrench": 2,
            "misc_b_pesticide": 5,
            "misc_b_ceramic_adhesive": 2
        },
        "levelConditions": {
            "Generator": 2,
            "Player": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_plantiog"
    },
    "PlantingLv3": {
        "areaId": "Planting",
        "categoryId": "MedicalArea",
        "level": 3,
        "upgradeName": "Plant Stand",
        "upgradeDesc": "Food recovery +30%.",
        "price": 340000,
        "exchange": {
            "misc_b_smallshovel": 8,
            "misc_b_match": 14,
            "misc_b_flashlight": 8,
            "misc_b_gaspipewrench": 3
        },
        "levelConditions": {
            "WaterCollector": 3,
            "Player": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_plantiog"
    },
    "MedDeskLv1": {
        "areaId": "MedDesk",
        "categoryId": "MedicalArea",
        "level": 1,
        "upgradeName": "Med Desk",
        "upgradeDesc": "Drink recovery +10%.",
        "price": 80000,
        "exchange": {
            "misc_b_uvlight": 3,
            "misc_b_disinfectingwipes": 3,
            "misc_b_medicalkit": 2,
            "misc_b_bottledglucose": 3
        },
        "levelConditions": {
            "WaterCollector": 1,
            "MedicalArea": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Medical_station2"
    },
    "MedDeskLv2": {
        "areaId": "MedDesk",
        "categoryId": "MedicalArea",
        "level": 2,
        "upgradeName": "Med Desk",
        "upgradeDesc": "Drink recovery +20%.",
        "price": 220000,
        "exchange": {
            "misc_b_uvlight": 5,
            "misc_b_aspire": 6,
            "misc_b_medicalkit": 4,
            "misc_bentrifuge": 2
        },
        "levelConditions": {
            "WaterCollector": 1,
            "Generator": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Medical_station2"
    },
    "MedDeskLv3": {
        "areaId": "MedDesk",
        "categoryId": "MedicalArea",
        "level": 3,
        "upgradeName": "Med Desk",
        "upgradeDesc": "Drink recovery +30%.",
        "price": 340000,
        "exchange": {
            "misc_b_toiletpaper": 8,
            "misc_b_bottledglucose": 4,
            "misc_b_iodophor": 5,
            "misc_bentrifuge": 3
        },
        "levelConditions": {
            "WaterCollector": 3
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Medical_station2"
    },
    "WaterCollectorLv1": {
        "areaId": "WaterCollector",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Water Collector",
        "upgradeDesc": "Access to a drink holder.\r\nRegenerate Hydration faster inside Hideout.",
        "price": 10000,
        "exchange": {
            "misc_b_wire": 1,
            "misc_barcleaner": 1,
            "misc_screwdriver": 1,
            "misc_b_plier_large": 1
        },
        "levelConditions": {},
        "relatedQuests": [
            "task.mall.2"
        ],
        "levelUpIcon": "Image_water_collector"
    },
    "WaterCollectorLv2": {
        "areaId": "WaterCollector",
        "categoryId": "None",
        "level": 2,
        "upgradeName": "Water Collector",
        "upgradeDesc": "Regenerate Hydration faster inside Hideout.",
        "price": 50000,
        "exchange": {
            "misc_b_pipeline": 3,
            "misc_b_insulatingtape": 5,
            "misc_b_nail": 6,
            "misc_b_piezometer": 2
        },
        "levelConditions": {},
        "relatedQuests": [],
        "levelUpIcon": "Image_water_collector"
    },
    "WaterCollectorLv3": {
        "areaId": "WaterCollector",
        "categoryId": "None",
        "level": 3,
        "upgradeName": "Water Collector",
        "upgradeDesc": "Regenerate Hydration faster inside Hideout.",
        "price": 100000,
        "exchange": {
            "misc_b_spraycan": 5,
            "misc_barcleaner": 4,
            "misc_b_storagebattery": 1,
            "misc_b_piezometer": 3
        },
        "levelConditions": {},
        "relatedQuests": [],
        "levelUpIcon": "Image_water_collector"
    },
    "KitchenAreaLv1": {
        "areaId": "KitchenArea",
        "categoryId": "KitchenArea",
        "level": 1,
        "upgradeName": "Kitchen Area",
        "upgradeDesc": "Unlocks Coffee Machine, Microwave, Refrigerator",
        "price": 80000,
        "exchange": {
            "misc_b_match": 3,
            "misc_b_lighter": 2,
            "misc_b_gastank": 1,
            "misc_oilcan": 1
        },
        "levelConditions": {
            "WaterCollector": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_keachen"
    },
    "RefrigeratorLv1": {
        "areaId": "Refrigerator",
        "categoryId": "KitchenArea",
        "level": 1,
        "upgradeName": "Refrigerator",
        "upgradeDesc": "Food and drinks Storage.\r\nRegenerate Energy faster inside Hideout.",
        "price": 100000,
        "exchange": {
            "misc_b_rustedcleaner": 2,
            "misc_b_saltcan": 2,
            "misc_b_wd40": 2,
            "misc_copperwire": 1
        },
        "levelConditions": {
            "KitchenArea": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Refrigerator"
    },
    "RefrigeratorLv2": {
        "areaId": "Refrigerator",
        "categoryId": "KitchenArea",
        "level": 2,
        "upgradeName": "Refrigerator",
        "upgradeDesc": "Regenerate Energy faster inside Hideout.",
        "price": 160000,
        "exchange": {
            "misc_b_wirecutting": 3,
            "misc_b_saltcan": 3,
            "misc_b_oliveoil": 1,
            "misc_b_socket": 2
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Refrigerator"
    },
    "RefrigeratorLv3": {
        "areaId": "Refrigerator",
        "categoryId": "KitchenArea",
        "level": 3,
        "upgradeName": "Refrigerator",
        "upgradeDesc": "Regenerate Energy faster inside Hideout.",
        "price": 240000,
        "exchange": {
            "misc_wastechip": 3,
            "misc_b_gaspipewrench": 4,
            "misc_b_plier_large": 3,
            "misc_b_wrench": 2
        },
        "levelConditions": {},
        "relatedQuests": [],
        "levelUpIcon": "Image_Refrigerator"
    },
    "MicrowaveOvenLv1": {
        "areaId": "MicrowaveOven",
        "categoryId": "KitchenArea",
        "level": 1,
        "upgradeName": "Microwave",
        "upgradeDesc": "In-Raid Energy Consumption -5%",
        "price": 100000,
        "exchange": {
            "misc_b_plier": 4,
            "misc_b_wirecutting": 4,
            "misc_wastechip": 1,
            "misc_b_pcfan": 6
        },
        "levelConditions": {
            "KitchenArea": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_microwave_oven"
    },
    "MicrowaveOvenLv2": {
        "areaId": "MicrowaveOven",
        "categoryId": "KitchenArea",
        "level": 2,
        "upgradeName": "Microwave",
        "upgradeDesc": "In-Raid Energy Consumption -5%",
        "price": 200000,
        "exchange": {
            "misc_b_nut": 8,
            "misc_b_screw": 8,
            "misc_wastechip": 5,
            "misc_b_oliveoil": 3
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_microwave_oven"
    },
    "MicrowaveOvenLv3": {
        "areaId": "MicrowaveOven",
        "categoryId": "KitchenArea",
        "level": 3,
        "upgradeName": "Microwave",
        "upgradeDesc": "In-Raid Energy Consumption -5%",
        "price": 300000,
        "exchange": {
            "misc_copperwire": 6,
            "misc_b_wire": 12,
            "misc_b_wd40": 12,
            "misc_b_digitalsensor": 1
        },
        "levelConditions": {
            "Generator": 3
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_microwave_oven"
    },
    "CoffeeMakerLv1": {
        "areaId": "CoffeeMaker",
        "categoryId": "KitchenArea",
        "level": 1,
        "upgradeName": "Coffee Maker",
        "upgradeDesc": "In-Raid Hydration Consumption -5%",
        "price": 100000,
        "exchange": {
            "misc_b_screw": 5,
            "misc_b_socket": 2,
            "misc_b_wire": 5,
            "misc_b_nut": 5
        },
        "levelConditions": {
            "KitchenArea": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "Frame_6172"
    },
    "CoffeeMakerLv2": {
        "areaId": "CoffeeMaker",
        "categoryId": "KitchenArea",
        "level": 2,
        "upgradeName": "Coffee Maker",
        "upgradeDesc": "In-Raid Hydration Consumption -10%",
        "price": 200000,
        "exchange": {
            "misc_b_electricdrill": 2,
            "misc_barcleaner": 5,
            "misc_copperwire": 5,
            "misc_b_saltcan": 6
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "Frame_6172"
    },
    "CoffeeMakerLv3": {
        "areaId": "CoffeeMaker",
        "categoryId": "KitchenArea",
        "level": 3,
        "upgradeName": "Coffee Maker",
        "upgradeDesc": "In-Raid Hydration Consumption -15%",
        "price": 300000,
        "exchange": {
            "misc_b_civilradio": 6,
            "misc_b_nut": 12,
            "misc_b_gameconsole": 4,
            "misc_b_antiqueteaset": 1
        },
        "levelConditions": {
            "Generator": 3
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_coffee_maker"
    },
    "IntelligentLv1": {
        "areaId": "Intelligent",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Intel Center",
        "upgradeDesc": "Show item prices with M.I.C.A.",
        "price": 100000,
        "exchange": {
            "misc_mouse": 2,
            "misc_b_opticaldisc": 2,
            "misc_b_dataline": 2,
            "misc_b_oldphone": 1
        },
        "levelConditions": {},
        "relatedQuests": [],
        "levelUpIcon": "Image_Rest_room112"
    },
    "IntelligentLv2": {
        "areaId": "Intelligent",
        "categoryId": "None",
        "level": 2,
        "upgradeName": "Intel Center",
        "upgradeDesc": "Character experience gain +15%",
        "price": 160000,
        "exchange": {
            "misc_b_insulatingtape": 4,
            "misc_b_harddrive": 3,
            "misc_b_opticaldisc": 3,
            "misc_b_civilradio": 2
        },
        "levelConditions": {
            "WorkshopZone": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Rest_room112"
    },
    "IntelligentLv3": {
        "areaId": "Intelligent",
        "categoryId": "None",
        "level": 3,
        "upgradeName": "Intel Center",
        "upgradeDesc": "Character experience gain +20%",
        "price": 320000,
        "exchange": {
            "misc_b_recorder": 2,
            "misc_b_tape": 3,
            "misc_videotape": 2,
            "misc_b_powerbank": 3
        },
        "levelConditions": {
            "Intelligent": 2,
            "RestRoom": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Rest_room112"
    },
    "IntelligentLv4": {
        "areaId": "Intelligent",
        "categoryId": "None",
        "level": 4,
        "upgradeName": "Intel Center",
        "upgradeDesc": "Character experience gain +30%",
        "price": 500000,
        "exchange": {
            "misc_b_wirecutting": 6,
            "misc_notebook": 6,
            "misc_floppydisk": 3,
            "misc_b_visionmodule": 1
        },
        "levelConditions": {
            "Intelligent": 3,
            "RestRoom": 3
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Rest_room112"
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
            "misc_b_pcfan": 5,
            "misc_b_ceramic_adhesive": 6,
            "misc_b_harddrive": 5
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [
            "task.mall.5"
        ],
        "levelUpIcon": "Image_Mine_field"
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
            "misc_b_ceramic_adhesive": 4,
            "misc_floppydisk": 4
        },
        "levelConditions": {
            "CryptoMining": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Mine_field"
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
            "misc_b_ceramic_adhesive": 6,
            "misc_b_harddrive": 6
        },
        "levelConditions": {
            "CryptoMining": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Mine_field"
    },
    "CryptoMiningLv4": {
        "areaId": "CryptoMining",
        "categoryId": "None",
        "level": 4,
        "upgradeName": "Bitcoin Mine",
        "upgradeDesc": "Unlock more slots; Increase money output.",
        "price": 400000,
        "exchange": {
            "misc_b_visionmodule": 6,
            "misc_b_dataline": 10,
            "misc_floppydisk": 8,
            "misc_b_militaryusbdrive": 6
        },
        "levelConditions": {
            "CryptoMining": 3,
            "Generator": 3
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_Mine_field"
    },
    "GeneratorLv1": {
        "areaId": "Generator",
        "categoryId": "None",
        "level": 1,
        "upgradeName": "Generator",
        "upgradeDesc": "Increase Fuel capacity, reduce power consumption.\nSupport upgrades for more facilities.",
        "price": 0,
        "exchange": {},
        "levelConditions": {},
        "relatedQuests": [],
        "levelUpIcon": "Image_dynamo"
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
            "misc_b_wire": 12,
            "misc_b_transformer": 6
        },
        "levelConditions": {
            "Generator": 1
        },
        "relatedQuests": [
            "task.mall.3"
        ],
        "levelUpIcon": "Image_dynamo"
    },
    "GeneratorLv3": {
        "areaId": "Generator",
        "categoryId": "None",
        "level": 3,
        "upgradeName": "Generator",
        "upgradeDesc": "Increase Fuel capacity, reduce power consumption.\nSupport upgrades for more facilities.",
        "price": 300000,
        "exchange": {
            "misc_b_visionmodule": 8,
            "misc_oilcan": 12,
            "misc_b_transformer": 8,
            "misc_b_marinestoragebattery": 3
        },
        "levelConditions": {
            "Generator": 2
        },
        "relatedQuests": [],
        "levelUpIcon": "Image_dynamo"
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
            "misc_gunpowder": 1,
            "misc_b_ceramic_adhesive": 1,
            "misc_b_tire_sealant": 3
        },
        "levelConditions": {},
        "relatedQuests": [
            "task.mall.6"
        ],
        "levelUpIcon": "Frame_6174"
    },
    "WorkshopZoneLv1": {
        "areaId": "WorkshopZone",
        "categoryId": "Storage",
        "level": 1,
        "upgradeName": "Workshop",
        "upgradeDesc": "Access to more stroage spaces.\nAccess to Armor Repair, Ammo loader and Keys hanger.",
        "price": 50000,
        "exchange": {
            "misc_b_tapemeasure": 1,
            "misc_b_wrench": 1,
            "misc_screwdriver": 2,
            "misc_b_wd40": 2
        },
        "levelConditions": {},
        "relatedQuests": [],
        "levelUpIcon": "Image_rest_room"
    },
    "StorageZoneLock1Lv1": {
        "areaId": "StorageZoneLock1",
        "categoryId": "Storage",
        "level": 1,
        "upgradeName": "Storage Room A",
        "upgradeDesc": "Access to storage room A",
        "price": 80000,
        "exchange": {
            "misc_b_batter_large": 1,
            "misc_b_flashlight": 6,
            "misc_b_nail": 8,
            "misc_hammer": 1
        },
        "levelConditions": {
            "WorkshopZone": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "lImage_Mine_lock"
    },
    "StorageZoneLock2Lv1": {
        "areaId": "StorageZoneLock2",
        "categoryId": "Storage",
        "level": 1,
        "upgradeName": "Storage Room B",
        "upgradeDesc": "Access to storage room B",
        "price": 400000,
        "exchange": {
            "misc_b_moldboard": 6,
            "misc_b_nail": 10,
            "misc_hammer": 6,
            "misc_blimbingrope": 3
        },
        "levelConditions": {
            "WorkshopZone": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "StorageZone2_gearwall"
    },
    "StorageZoneLock3Lv1": {
        "areaId": "StorageZoneLock3",
        "categoryId": "Storage",
        "level": 1,
        "upgradeName": "Storage Room C",
        "upgradeDesc": "Access to storage room C",
        "price": 400000,
        "exchange": {
            "misc_gunpowder": 10,
            "misc_b_smokelesspowder": 10,
            "misc_b_gunoil": 12,
            "misc_b_visionmodule": 6
        },
        "levelConditions": {
            "WorkshopZone": 1
        },
        "relatedQuests": [],
        "levelUpIcon": "StorageZone2_gearrack"
    }
} as const;

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

export const areaIcons = {
    "Lounge": {
        "icon": "Frame_6936png.webp",
        "alt": "Lounge"
    },
    "MedicalArea": {
        "icon": "Image_bg_icon25.webp",
        "alt": "Medical Area"
    },
    "KitchenArea": {
        "icon": "Frame_6073.webp",
        "alt": "Kitchen Area"
    },
    "Storage": {
        "icon": "Image_bg_icon42.webp",
        "alt": "Storage"
    },
    "RestRoom": {
        "icon": "Frame_5782.webp",
        "alt": "Rest Room"
    },
    "WaterCollector": {
        "icon": "Image_bg_icon24.webp",
        "alt": "Water Collector"
    },
    "Intelligent": {
        "icon": "Frame_6076.webp",
        "alt": "Intel Center"
    },
    "CryptoMining": {
        "icon": "Frame_6075.webp",
        "alt": "Bitcoin Mine"
    },
    "Generator": {
        "icon": "Frame_6074.webp",
        "alt": "Generator"
    },
    "ShootingRange": {
        "icon": "Frame_6071.webp",
        "alt": "Shooting Range"
    },
    "None": {
        "icon": "Image_bg_close.webp",
        "alt": "Back"
    },
    "Sofa": {
        "icon": "Image_bg_icon2.webp",
        "alt": "Sofa"
    },
    "Bookcase": {
        "icon": "Image_bg_icon32.webp",
        "alt": "Bookcase"
    },
    "TVSet": {
        "icon": "Image_bg_icon3.webp",
        "alt": "TV Set"
    },
    "OperationBed": {
        "icon": "Frame_6924.webp",
        "alt": "Operation Bed"
    },
    "Planting": {
        "icon": "Frame_6077.webp",
        "alt": "Planting"
    },
    "MedDesk": {
        "icon": "Image_bg_icon27.webp",
        "alt": "Medical Desk"
    },
    "Refrigerator": {
        "icon": "Frame_6082.webp",
        "alt": "Refrigerator"
    },
    "MicrowaveOven": {
        "icon": "Frame_6080.webp",
        "alt": "Microwave Oven"
    },
    "CoffeeMaker": {
        "icon": "Frame_6079.webp",
        "alt": "Coffee Maker"
    },
    "WorkshopZone": {
        "icon": "Image_bg_icon21.webp",
        "alt": "Workshop"
    },
    "StorageZoneLock1": {
        "icon": "Frame_6932.webp",
        "alt": "Storage Room A"
    },
    "StorageZoneLock2": {
        "icon": "Frame_6933.webp",
        "alt": "Storage Room B"
    },
    "StorageZoneLock3": {
        "icon": "Frame_6934.webp",
        "alt": "Storage Room C"
    }
} as const;