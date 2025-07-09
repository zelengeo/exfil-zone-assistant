import {Corp, Task, TaskMap, TasksDatabase} from '@/types/tasks';

export const corps: Record<string, Corp> = {
    "ark": {
        name: "ARK",
        icon: "/images/tasks/icon_Arkshop1_nobg.webp",
        merchant: "Tommy",
        merchantIcon: "/images/tasks/img_ark1Merchant.webp",
        ogImage: "/og/og-image-ark-task.jpg",
        levelCap: [100, 300, 800]
    },
    "ntg": {
        name: "N.T.G",
        icon: "/images/tasks/icon_NTGshop_nobg.webp",
        merchant: "Maggie",
        merchantIcon: "/images/tasks/img_DocMerchant.webp",
        ogImage: "/og/og-image-ntg-task.jpg",
        levelCap: [100, 300, 800]
    },
    "trupiks": {
        name: "TRUPIK'S",
        icon: "/images/tasks/icon_TPshop_nobg.webp",
        merchant: "Johnny",
        merchantIcon: "/images/tasks/img_TPMerchant.webp",
        ogImage: "/og/og-image-trupik-task.jpg",
        levelCap: []
    },
    "regiment": {
        name: "REGIMENT",
        icon: "/images/tasks/icon_Regishop_nobg.webp",
        merchant: "Igor",
        merchantIcon: "/images/tasks/img_RegiMerchant.webp",
        ogImage: "/og/og-image-regiment-task.jpg",
        levelCap: [100, 300, 800]
    },
    "forge": {
        name: "BOULDER FORGE",
        icon: "/images/tasks/icon_Arkshop2_nobg.webp",
        merchant: "Maximilian",
        merchantIcon: "/images/tasks/img_ar2Merchant.webp",
        ogImage: "/og/og-image-forge-task.jpg",
        levelCap: [100, 300, 800]
    }
} as const;

export type CorpId = keyof typeof corps;


export const tasksData: TasksDatabase = {
    "ark_1": {
        "id": "ark_1",
        "name": "Handshake",
        "gameId": "task.na.1",
        "description": "Hi! I don't think I've seen you before. I'm Tommy from ARK Industries. Since that incident on the island, ARK's power has been considerably weakened. So we need to enlist some help from others like you. But before we start, you need to prove that you have the skills to survive in a war zone; it's not a place to be taken lightly. So go explore the island and [come back alive].",
        "objectives": [
            "Successfully extract from Suburb Area"
        ],
        "corpId": "ark",
        "type": [
            "extract"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-9x19-tracer",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-bx4",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_9x19mm_25_2",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [],
        "requiredLevel": 0,
        "tips": "Check the 'Extraction' tab in the menu or use the M.I.C.A. map to find extraction points.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us"
            }
        ],
        "order": 1
    },
    "ark_2": {
        "id": "ark_2",
        "name": "Friendly Reminder",
        "gameId": "task.na.2",
        "description": "It seems you've been doing well on the island, but now it's time to get serious. You may have noticed that there are many scavengers wandering around; they will shoot any outsiders without warning. Thanks to them, we've lost some excellent soldiers. [Eliminate 4 of them] as a friendly reminder.",
        "objectives": [
            "Eliminate 4 contractors or scavengers"
        ],
        "corpId": "ark",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "experience",
                "quantity": 1569
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-556x45-mk318",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-m4a1-factory",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_556x45_30_stanag",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_1"
        ],
        "requiredLevel": 0,
        "tips": "Scavengers can be deadly. Try to fight one at a time and use cover",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 34
            }
        ],
        "order": 2
    },
    "ark_3": {
        "id": "ark_3",
        "name": "Recon 1",
        "gameId": "task.na.13",
        "description": "The situation on the island is in complete chaos. Gathering some military intel might prove helpful for us.\nHead to the [Suburb area], where [intel items] are often found. Locate the [Northern Military Camp] and collect several intel documents.",
        "objectives": [
            "Reach the Military Camp",
            "Turn in 6 Intel Items Found In Raid"
        ],
        "corpId": "ark",
        "type": [
            "reach",
            "submit"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 1807
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-9x19-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-mp9-t",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_9x19mm_30_mp9",
                "quantity": 2
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_2"
        ],
        "requiredLevel": 0,
        "tips": "The Military Camp is north of the Mall. [Intel items](https://www.exfil-zone-assistant.app/items?category=misc&subcategory=Intel) are commonly found in that area.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 64
            }
        ],
        "order": 3
    },
    "ark_4": {
        "id": "ark_4",
        "name": "Lost and Found",
        "gameId": "task.na.3",
        "description": "Urgent mission! One of our soldiers is missing. Her last signal was near the [high-rise building] north of the [motel] in the [suburban area]. Her phone contains intel clues. We need you to find her or at least retrieve [her phone].",
        "objectives": [
            "Reach the Office Building Near the Motel",
            "Find Intel phone the \"ARK Soldier\" was Carrying",
            "Turn in Intel Phone"
        ],
        "corpId": "ark",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "experience",
                "quantity": 1807
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-45acp-tracer",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-m1911",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_45acp_11",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_3"
        ],
        "requiredLevel": 0,
        "tips": "The phone is in a small room on the second floor of the office building, which is near the motel.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "4WsA_31tZKo"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 90
            }
        ],
        "order": 4
    },
    "ark_5": {
        "id": "ark_5",
        "name": "Enemies on All Sides",
        "gameId": "task.na.z14",
        "description": "I discovered that someone has been deliberately leaking ARK's information. There may be a traitor within us. We've been put in a vulnerable position, and some of our allies have already been ambushed by scavengers.\nFor now, go to the [Suburb area] and [weaken the scavenger] presence. I'll continue the investigation.",
        "objectives": [
            "Eliminate 15 Scavengers in Suburb Area"
        ],
        "corpId": "ark",
        "type": [
            "eliminate"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 18000
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-556x45-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-aug-a3-cqb",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_556x45_30",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_3"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 124
            }
        ],
        "order": 5
    },
    "ark_6": {
        "id": "ark_6",
        "name": "Coastal Manhunt",
        "gameId": "task.na.4",
        "description": "Unfortunately, we have lost a soldier... Based on the clues in her phone, her death is likely related to an armed forces  from [Resort Area] on the northern side of the island. Given the previous violent incident, please investigate:\r\nThe [Whitesails hospital east building] to the south, the [Rua Algasol] and the [Hotel] in the north. Lastly, [Extract] safely.",
        "objectives": [
            "Reach the shopping street Rua Algasol",
            "Reach victoria golden hotel",
            "Reach east of White sails Hospital",
            "Extract from resort"
        ],
        "corpId": "ark",
        "type": [
            "reach",
            "extract"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "experience",
                "quantity": 2178
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 20
            },
            {
                "type": "item",
                "item_id": "rail_default__mp5_railattachment",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "scope_ocp7",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "ammo-9x19-tracer",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-mp5a3",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_9x19mm_30_mp5",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_4",
            "ark_5"
        ],
        "requiredLevel": 0,
        "tips": "Careful, most of players rush Bank on the start.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "9q5RGDIiAMs"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 186
            }
        ],
        "order": 6
    },
    "ark_7": {
        "id": "ark_7",
        "name": "Surveillance 1",
        "gameId": "task.na.5",
        "description": "These people don't seem like locals—they look more like gang members. We need to stay cautious and gather more intel.\nI had a [binoculars] set up at the [hospital security booth] for surveillance, but someone messed with it. Could you help me reposition it [on the table] in the [backyard of the Seafoam Scoops]?",
        "objectives": [
            "Find ARK Telescope",
            "Place telescope in the seafoam Scoops' Backyard"
        ],
        "corpId": "ark",
        "type": [
            "retrieve",
            "place"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "experience",
                "quantity": 2178
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-9x19-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-mp9",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_9x19mm_30_mp9",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_6"
        ],
        "requiredLevel": 0,
        "tips": "[ARK's Telescope](https://www.exfil-zone-assistant.app/items/taskitem_placement_tommy_telescope)",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "6MkGTEHSq_o"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 222
            }
        ],
        "order": 7
    },
    "ark_8": {
        "id": "ark_8",
        "name": "Through the Narrow Lens",
        "gameId": "task.na.6",
        "description": "The previous violent incident caused all the police forces from the Hyder Police Station to be concentrated here. Although they mean no harm, our identity makes it inconvenient to deal with them openly. Approach the bank carefully, then use [this phone] to take a few photos of the [police cars] in front of and behind the bank. Be sure to use FotoVision+ Phone. [Successfully taken photos will be automatically uploaded] to me.",
        "objectives": [
            "Take photo of a police car (Front of the bank)",
            "Take photo of a police car (Back of the bank)"
        ],
        "corpId": "ark",
        "type": [
            "photo"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "experience",
                "quantity": 2178
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-556x45-mk318",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-m4a1-agent",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_556x45_30_stanag",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_photophone",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ark_7"
        ],
        "requiredLevel": 0,
        "tips": "Phone does not have to be extracted.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "w_8khHE_o1A"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 264
            }
        ],
        "order": 8
    },
    "ark_9": {
        "id": "ark_9",
        "name": "Crime Control",
        "gameId": "task.na.7",
        "description": "It looks like gang members looted the vault. Seems the [Resort Area] was hit by a robbery right when that incident happened on the island.\nIf we don't intervene, chaos might spiral out of control. Head to the [Fire Station], [East Military Camp], and [Halif Travel Agency], and [eliminate some of the scavengers].",
        "objectives": [
            "Reach the Fire station",
            "Reach the East Military camp",
            "Reach the Halif voyage",
            "Eliminate 6 scavengers"
        ],
        "corpId": "ark",
        "type": [
            "reach",
            "eliminate"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 5518
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-9x19-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-glock18c",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_9x19mm_17",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_8"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "AcsdXNUqR1k"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 296
            }
        ],
        "order": 9
    },
    "ark_10": {
        "id": "ark_10",
        "name": "The Imposter",
        "gameId": "task.na.z6",
        "description": "After the police were reassigned to the [Resort Area], some scavengers took advantage of the situation and seized control of Hyder Police Station. Among them, a figure known as \"Iron Wolf\" seems to have significant influence.\nWe need to prevent the scavengers from forming an organized fighting force. Eliminate \"Iron Wolf\" at [Hyder Police Station] before things get out of hand.",
        "objectives": [
            "Reach the Hyder Town Police Station",
            "Eliminate Iron Wolf in Police Station"
        ],
        "corpId": "ark",
        "type": [
            "reach",
            "eliminate"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 5518
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "ammo-762x51-fmj",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-hk51",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x51_10_2",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_8"
        ],
        "requiredLevel": 0,
        "tips": "Almost Unarmored, wears [Police Vest](https://www.exfil-zone-assistant.app/items/armor-police-vest) and [Red Beret](https://www.exfil-zone-assistant.app/items/helmet-red-beret), drops [UMP](https://www.exfil-zone-assistant.app/items/weapon-ump45) or [MP9](https://www.exfil-zone-assistant.app/items/weapon-mp9-t)",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 338
            }
        ],
        "order": 10
    },
    "ark_11": {
        "id": "ark_11",
        "name": "Tracking Device",
        "gameId": "task.na.8",
        "description": "We left behind a lot of useful supplies on the island.\nTo locate them, we'll need to craft some trackers.\nIf you can bring me [2 electronic items] and [2 energy items],\nI'll be able to start making them right away.",
        "objectives": [
            "Turn in 3 Electric Items",
            "Turn in 2 Batteries"
        ],
        "corpId": "ark",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 5518
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-556x45-mk318",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-aug-a1",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_556x45_30",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_9"
        ],
        "requiredLevel": 0,
        "tips": "[Electric Item](https://www.exfil-zone-assistant.app/items?category=misc&subcategory=Electric), [Power Items](https://www.exfil-zone-assistant.app/items?category=misc&subcategory=Power)",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 385
            }
        ],
        "order": 11
    },
    "ark_12": {
        "id": "ark_12",
        "name": "A Test Run",
        "gameId": "task.na.9",
        "description": "Let's put the finished trackers to the test. [To mark a target, hold the tracker, approach the object you want to tag, and release when prompted—the tracker will stick to the target.]\r\nNow, take them to the [Resort Area] and mark any 3 [BMPs]. use one per target.",
        "objectives": [
            "Mark 3 BMPs on resort"
        ],
        "corpId": "ark",
        "type": [
            "mark"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-9x19-tracer",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-scorpion-evo3",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_9x19mm_30_evo",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_tracking_device",
                "quantity": 3
            }
        ],
        "requiredTasks": [
            "ark_11"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "8Z4xxRQxK84"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 410
            }
        ],
        "order": 12
    },
    "ark_13": {
        "id": "ark_13",
        "name": "Tracing the Crime",
        "gameId": "task.na.10",
        "description": "The current state of the [Resort Area] is largely the work of those gang members. They've been causing chaos everywhere, supposedly in search of a priceless jewel.\nTrack their movements and investigate the [vault breach], then check the [construction site], [Waste Disposal Site], and [worker dormitory]. We need [intel] and clues to identify their leader.",
        "objectives": [
            "Reach the Bank vault breach",
            "Reach the Construction site",
            "Reach the Waste station",
            "Reach the basketball court",
            "Turn in 3 intel items"
        ],
        "corpId": "ark",
        "type": [
            "reach",
            "submit"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "item",
                "item_id": "ammo-9x19-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-mp9-n",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_9x19mm_30_mp9",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_12"
        ],
        "requiredLevel": 0,
        "tips": "[Intel Items](https://www.exfil-zone-assistant.app/items?category=misc&subcategory=Intel)",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 438
            }
        ],
        "order": 13
    },
    "ark_14": {
        "id": "ark_14",
        "name": "Deterrence 1",
        "gameId": "task.na.11",
        "description": "The clues lead to the [worker dormitory]—the gang leader must be there.\nBefore we move in, I want you to get fully comfortable with the M4A1 series and weaken their forces in the process. Head to the [Resort Area] and eliminate [10 enemies] using an M4A1 to prove you've mastered its capabilities.",
        "objectives": [
            "Eliminate 10 targets with M4A1 series"
        ],
        "corpId": "ark",
        "type": [
            "eliminate"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-556x45-mk318",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-m4a1-cqbr",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_556x45_30_stanag",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_13"
        ],
        "requiredLevel": 0,
        "tips": "Any M4A1: [M4A1 CQBR](https://www.exfil-zone-assistant.app/items/weapon-m4a1-cqbr) ",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 490
            }
        ],
        "order": 14
    },
    "ark_15": {
        "id": "ark_15",
        "name": "Resort Reckoning",
        "gameId": "task.na.12",
        "description": "You're ready. Head to the [worker dormitory] in the [Resort Area].\nWhatever their goal is, these gang members have caused enough trouble. Eliminate their leader, [Butcher], and restore order to the resort.\nBe advised: the target has distinct tattoos and a black-and-white skull face paint. Stay sharp.",
        "objectives": [
            "Eliminate worker dorm's butcher"
        ],
        "corpId": "ark",
        "type": [
            "eliminate"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 7928
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 50
            },
            {
                "type": "item",
                "item_id": "ammo-556x45-mk318",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "weapon-hk416",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_556x45_30_stanag",
                "quantity": 2
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_14",
            "ark_10"
        ],
        "requiredLevel": 0,
        "tips": "Unarmored, easy target. Does not spawn every game though.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 531
            }
        ],
        "order": 15
    },
    "ark_16": {
        "id": "ark_16",
        "name": "Where Did The Trucks Go",
        "gameId": "task.na.14",
        "description": "The situation in the resort area has come to a close—for now. Next thing to do is rather easy to handle. We've left some [ARK trucks] around [Trupiks Mall] in the [suburb area], loaded with important cargo.\nUse the trackers to mark 3 of them—one per target. Don't waste any resources.\nGood luck finding the trucks.",
        "objectives": [
            "Mark 3 ARK trucks with marker device"
        ],
        "corpId": "ark",
        "type": [
            "mark"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "mag_9x19mm_50_evo",
                "quantity": 2
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_tracking_device",
                "quantity": 3
            }
        ],
        "requiredTasks": [
            "ark_15"
        ],
        "requiredLevel": 0,
        "tips": "Trucks are all over the map.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "TejY5XxbxXs"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 566
            }
        ],
        "order": 16
    },
    "ark_17": {
        "id": "ark_17",
        "name": "Surveillance 2",
        "gameId": "task.na.15",
        "description": "The cameras I deployed earlier have been destroyed by troublemakers. Please go to the [warehouse] next to the [office building and pick up 2 cameras]. Redeploy them at the following locations:\r\n[Foodtruck pickup window] next to Altibuy, and on the [barrel next to the warehouse entrance].",
        "objectives": [
            "Find Tommy's Cam",
            "Place at Foodtruck",
            "Place on the warehouse barrel"
        ],
        "corpId": "ark",
        "type": [
            "retrieve",
            "place"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 7928
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-45acp-apv1",
                "quantity": 60
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_16"
        ],
        "requiredLevel": 0,
        "tips": "[Tommy's Surveillance Cam](https://www.exfil-zone-assistant.app/items/taskitem_placement_tommy_surveillancecam)",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "91ZLjp02aDY"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 597
            }
        ],
        "order": 17
    },
    "ark_18": {
        "id": "ark_18",
        "name": "Island Logs",
        "gameId": "task.na.z15",
        "description": "NTG seems to be making a move on the island as well. I'm worried they might try to monopolize the medical supplies here.\nI've heard that one of their research teams is conducting investigations and recording footage on the island. Find and retrieve [visual recordings (videotapes)] and submit them to me.",
        "objectives": [
            "Turn in 3 Videotape"
        ],
        "corpId": "ark",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 18000
            },
            {
                "type": "experience",
                "quantity": 7928
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-762x51-M80",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-ar308",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x51_10",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_16"
        ],
        "requiredLevel": 0,
        "tips": "[Videotape](https://www.exfil-zone-assistant.app/items/misc_videotape) can be often found near the TVs",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 650
            }
        ],
        "order": 18
    },
    "ark_19": {
        "id": "ark_19",
        "name": "Captured on Site",
        "gameId": "task.na.16",
        "description": "New findings—someone spotted a person matching our target’s description at [TRUPIKS mall].\nMy data is outdated, so I need you to head to these locations and take photos:\n[the Burger Shop on 1F], [the Repair Station on 2F] and [the Outdoor Gear Shop on 3F]",
        "objectives": [
            "Find the Burger Store on the 1F of TRUPIK'S Mall and take a photo.",
            "Find the Repair Store on the 2F of TRUPIK'S Mall and take a photo.",
            "Find the Out-door gear store on the 3F of TRUPIK'S Mall and take a photo."
        ],
        "corpId": "ark",
        "type": [
            "reach",
            "photo"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-556x45-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-aug-a3-stg77",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_556x45_30",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_photophone",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ark_17",
            "ark_18"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "_OUY4xMCIUc"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 662
            }
        ],
        "order": 19
    },
    "ark_20": {
        "id": "ark_20",
        "name": "Deterrence 2",
        "gameId": "task.na.17",
        "description": "We need to prepare for the operation to eliminate the traitor. Before that, I want you to complete another combat drill and master the use of the M16A2 —this reliable series of weapons will be key in the upcoming mission.\nEliminate [15 enemies] using an [M16A2] to prove you've fully grasped its capabilities.",
        "objectives": [
            "Eliminate 12 targets with: M16A2 Series"
        ],
        "corpId": "ark",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-556x45-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-m16a2",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_556x45_30_stanag",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_19"
        ],
        "requiredLevel": 0,
        "tips": "Any M16A2: [M16A2 ](https://www.exfil-zone-assistant.app/items/weapon-m16a2-lv2) ",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 704
            }
        ],
        "order": 20
    },
    "ark_21": {
        "id": "ark_21",
        "name": "The Betrayer",
        "gameId": "task.na.18",
        "description": "We've tracked the traitor's latest movements. His code name is [Ravager]. He's conducting a covert operation inside [TRUPIKS Mall] and has hidden a critical data disk on the rooftop.\nThe final moment has arrived—[eliminate the traitor] and his forces at TRUPIKS, [retrieve the disk from the rooftop], and secure it at all costs.",
        "objectives": [
            "Find the Rooftop of TRUPIK'S Mall",
            "Eliminate Ravager at the Mall",
            "Find ARK Floppydisk",
            "Turn in ARK Floppydisk"
        ],
        "corpId": "ark",
        "type": [
            "eliminate",
            "reach",
            "submit",
            "retrieve"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 50
            },
            {
                "type": "item",
                "item_id": "ammo-762x51-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-hk51k",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x51_20_3",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_20"
        ],
        "requiredLevel": 0,
        "tips": "Use grenades, akimbo, everything you can think of. Good luck.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 749
            }
        ],
        "order": 21
    },
    "ark_22": {
        "id": "ark_22",
        "name": "Recon 2",
        "gameId": "task.na.19",
        "description": "Scavengers have attacked the dock, and I need you to retrieve a secret surveillance device I planted there.\nHead to the dock in the [Dam Area], enter the [office building], and find a camouflaged [baseball] on the 2F shelf—it contains the collected data.\nI've sent you the vault key for the office via email—keep it safe.",
        "objectives": [
            "Find the Dock Office",
            "Find Tommy's Baseball Cam",
            "Turn in Tommy's Baseball Cam"
        ],
        "corpId": "ark",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "mag_556x45_50",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_21"
        ],
        "requiredLevel": 0,
        "tips": "One of the hot spots. Consider getting there closer to the end of a raid.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "gqbXu1XbELg"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 829
            }
        ],
        "order": 22
    },
    "ark_23": {
        "id": "ark_23",
        "name": "Inviting Troubles",
        "gameId": "task.na.z19",
        "description": "ARK is in a weakened state, and scavengers have attacked the dock in the [Dam Area], even blowing up the transport routes.\nHead to the [Dam Area], eliminate the scavengers, and make sure they understand they messed with the wrong people.",
        "objectives": [
            "Eliminate 12 scavengers in Dam area"
        ],
        "corpId": "ark",
        "type": [
            "eliminate"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 28000
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-762x51-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-scar17-fde",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x51_20_5",
                "quantity": 2
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_21"
        ],
        "requiredLevel": 0,
        "tips": "Lots of scavengers at Factory",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 857
            }
        ],
        "order": 23
    },
    "ark_24": {
        "id": "ark_24",
        "name": "The Saboteur",
        "gameId": "task.na.20",
        "description": "A critical transport bridge has been deliberately sabotaged, disrupting both logistics and movement.\nI need you to head to the [broken bridge site], inspect the damage on [both sides] of the bridge, and [mark the destroyed piers] while gathering intel.",
        "objectives": [
            "Reach the East Broken Bridge",
            "Reach the West Broken Bridge",
            "Mark East Broken Bridge Pier",
            "Mark West Broken Bridge Pier"
        ],
        "corpId": "ark",
        "type": [
            "reach",
            "mark"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "mag_556x45_60_sf",
                "quantity": 2
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_tracking_device",
                "quantity": 2
            }
        ],
        "requiredTasks": [
            "ark_22",
            "ark_23"
        ],
        "requiredLevel": 0,
        "tips": "north side of map, located east of dock & west of clifton, walk on top of both bridges, mark the standalone bridge column in front of both broken bridges.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "sKc6B8RQefg"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 904
            }
        ],
        "order": 24
    },
    "ark_25": {
        "id": "ark_25",
        "name": "Recon 3",
        "gameId": "task.na.21",
        "description": "Thanks for your help, but I’m unsure if other areas in the [Dam Area] have sustained damage.\nPlease check the following locations in [Clifton] to evaluate their suitability as rest points or evacuation sites: [Ellie's Shop], [the grocery Store], and the [Southeastern Extraction Point].",
        "objectives": [
            "Find the Grocery store in Clifton",
            "Find the Ellie’s Shop in Clifton",
            "Successfully extract from Southeast Road"
        ],
        "corpId": "ark",
        "type": [
            "reach",
            "extract"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "grip_verticalgrip_sg",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "tactical_laser_peq",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "scope_eotechhologramsight",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "supressor_m4sd",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_24"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "5uY7-lpuh6Y"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 930
            }
        ],
        "order": 25
    },
    "ark_26": {
        "id": "ark_26",
        "name": "Step Up the Track",
        "gameId": "task.na.22",
        "description": "You should be quite familiar with using trackers by now. Based on our past work together, you're the one I trust for this task.\nFind the [A1 and A2 warehouses] in the [Factory] in the [Dam Area] and mark the [green tanks] in them. They seem to be storing chemical substances in, I need precise data before initiating recovery.",
        "objectives": [
            "Reach Factory A Zone",
            "Mark the 3 Green Storage tank in Factory A Zone"
        ],
        "corpId": "ark",
        "type": [
            "reach",
            "mark"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "ammo-556x45-mk318",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-psg1",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_556x45_30_stanag",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_tracking_device",
                "quantity": 3
            }
        ],
        "requiredTasks": [
            "ark_25"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "mF3yc9qY4ao"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 961
            }
        ],
        "order": 26
    },
    "ark_27": {
        "id": "ark_27",
        "name": "Deterrence 3",
        "gameId": "task.na.23",
        "description": "We're launching an operation against the scavengers who sabotaged our transport routes. Before that, I want you to train with the AR-15, a lightweight, gas-operated semi-auto rifle—I think you’ll like it.\nEliminate [10 scavengers] using an [AR-15 series weapon].",
        "objectives": [
            "Eliminate 10 targets with AR15 series"
        ],
        "corpId": "ark",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "ammo-556x45-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-aug-a3-cqb",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_556x45_30",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_26"
        ],
        "requiredLevel": 0,
        "tips": "[AR-15 Pistol](https://www.exfil-zone-assistant.app/items/weapon-ar15-pistol) or [AR-15 Hunter](https://www.exfil-zone-assistant.app/items/weapon-m4a1-hunter)",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 988
            }
        ],
        "order": 27
    },
    "ark_28": {
        "id": "ark_28",
        "name": "The Battle of the Dam",
        "gameId": "task.na.24",
        "description": "Your training will be crucial for this strike. Head to the [Dam Area] and eliminate a high-threat scavenger leader wearing [skull-patterned gear].\nTarget identify himself as [Skull], last seen [below the dam]—proceed with caution.",
        "objectives": [
            "Find the Dam Interior Substation",
            "Eliminate Dam BOSS"
        ],
        "corpId": "ark",
        "type": [
            "reach",
            "eliminate"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 42000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 80
            },
            {
                "type": "item",
                "item_id": "mag_556x45_42",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_27"
        ],
        "requiredLevel": 0,
        "tips": "Caged room bottom of dam. Boss is relatively easy but POE is hot spot.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 1044
            }
        ],
        "order": 28
    },
    "ark_29": {
        "id": "ark_29",
        "name": "The Way Down",
        "gameId": "task.na.25",
        "description": "You're ready to push deeper into the island. Scout the [Metro Area] at these locations:\r\n[Hound Statue in Metro Station], [Public Bathhouse in lower Levels] and the [Medical Base at the bottom level].\r\nBeware—poor lighting and complex terrain will limit M.I.C.A. map functions. Stay sharp!\r\nBe sure to take a [Metro entry ticket] with you!",
        "objectives": [
            "Find the Hound Statue",
            "Find the Public Shower room",
            "Find the Underground Medical Base's Hall"
        ],
        "corpId": "ark",
        "type": [
            "reach"
        ],
        "map": [
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 40
            },
            {
                "type": "item",
                "item_id": "ammo-762x51-apv2",
                "quantity": 60
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ark_28"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "HdTqbSk3eaY"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 1070
            }
        ],
        "order": 29
    },
    "ark_30": {
        "id": "ark_30",
        "name": "Undercurrents",
        "gameId": "task.na.z25",
        "description": "Scavengers have infiltrated the [Metro Area], threatening vital supplies and infrastructure. If left unchecked, they could form an armed faction.\n[Eliminate 15 scavengers] to prevent further escalation.",
        "objectives": [
            "Eliminate 15 scavengers in metro area"
        ],
        "corpId": "ark",
        "type": [
            "eliminate"
        ],
        "map": [
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 28000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-762x51-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-scar17-black",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x51_20_4",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ark_28"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 1096
            }
        ],
        "order": 30
    },
    "ark_31": {
        "id": "ark_31",
        "name": "Entangled Paths 1",
        "gameId": "task.na.26",
        "description": "The [Metro Area] is more complex than expected. Without routes or shortcuts, operations and supply transport will be difficult.\nFind the [hidden passageways] in the subway. Navigation is tricky, but M.I.C.A's compass might still help.",
        "objectives": [
            "Find the Secret Passage in the Restroom of the Metro",
            "Find the Secret Passage in the Warehouse of the Metro"
        ],
        "corpId": "ark",
        "type": [
            "reach"
        ],
        "map": [
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "ammo-762x51-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-hk51-ace",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x51_30",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ark_29"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "2fEEpOWBYHY"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 1138
            }
        ],
        "order": 31
    },
    "ark_32": {
        "id": "ark_32",
        "name": "Entangled Paths 2",
        "gameId": "task.na.27",
        "description": "Thanks to your scouting, we now understand metro area's layout. The next step is securing safe exits.\n[Extract] from the following locations to confirm the routes:\n[Military Base Exit], [Northern Sewer Exit].",
        "objectives": [
            "Successfully extract from Military base exit",
            "Successfully extract from Northern sewer"
        ],
        "corpId": "ark",
        "type": [
            "extract"
        ],
        "map": [
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 40
            },
            {
                "type": "item",
                "item_id": "ammo-556x45-apv2",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-m4a1-dd",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_556x45_30_pmag",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ark_31"
        ],
        "requiredLevel": 0,
        "tips": "Good luck getting the right extraction point.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 1164
            }
        ],
        "order": 32
    },
    "ark_33": {
        "id": "ark_33",
        "name": "Big Guys",
        "gameId": "task.na.28",
        "description": "The information you provided mentioned that the [Metro area] has been transformed for military usage, and several tanks have been spotted within it.\r\nThe next task is critical. I need you to help me [mark the positions of 3 tanks]. Please be careful [NOT to mark any tanks that DO NOT have gun barrels that have medical symbols].",
        "objectives": [
            "Mark 3 BMP tanks without the Medical signs"
        ],
        "corpId": "ark",
        "type": [
            "mark"
        ],
        "map": [
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 40
            },
            {
                "type": "item",
                "item_id": "ammo-762x51-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-scar17-ssr",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x51_20_4",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_tracking_device",
                "quantity": 3
            },
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ark_32"
        ],
        "requiredLevel": 0,
        "tips": "Don't have to be 3 different ones. You can mark the same BMP in multiple runs.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "9t1zLuov-sE"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 1202
            }
        ],
        "order": 33
    },
    "ark_34": {
        "id": "ark_34",
        "name": "Deterrence 4",
        "gameId": "task.na.29",
        "description": "The scavengers in the [Metro area] must have a leader. Before facing him, you'll need more training.\nThe AUG series is a compact, modular weapon with high precision—perfect for this mission.\nEliminate [15 targets] using an [AUG].",
        "objectives": [
            "Eliminated 15 targets with AUG series"
        ],
        "corpId": "ark",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 40
            },
            {
                "type": "item",
                "item_id": "ammo-762x51-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-ar308-lt",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x51_20",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ark_33"
        ],
        "requiredLevel": 0,
        "tips": "Any [AUG](https://www.exfil-zone-assistant.app/items/weapon-aug-a3-ris). ",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 1234
            }
        ],
        "order": 34
    },
    "ark_35": {
        "id": "ark_35",
        "name": "Ruler in the Depths",
        "gameId": "task.na.30",
        "description": "As I suspected, the sudden appearance of the scavengers in the [Metro area] is indeed due to a leader behind them called [Ironclad].\nRest assured, we have weakened most of his power, and now he is isolated with only a few loyalists following him. Please head to the [Metro area] and eliminate this threat to cut off his leadership over the scavengers in the Metro region.",
        "objectives": [
            "Find the Metro Control Room",
            "Eliminate Ironclad in Metro area"
        ],
        "corpId": "ark",
        "type": [
            "reach",
            "eliminate"
        ],
        "map": [
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 42000
            },
            {
                "type": "experience",
                "quantity": 25672
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 80
            },
            {
                "type": "item",
                "item_id": "ammo-68x51-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-xm5",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_68x51_25",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ark_34",
            "ntg_29"
        ],
        "requiredLevel": 0,
        "tips": "Boss wearing RYS-T, who loves to kill while you are loading.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "4eNHusxBbIU"
            },
            {
                "author": "radFoxVR",
                "ytId": "I5XTDO71-us",
                "startTs": 1297
            }
        ],
        "order": 35
    },
    "ntg_1": {
        "id": "ntg_1",
        "name": "Supply Shortage 1",
        "gameId": "task.doc.1",
        "description": "Hi there! I'm Maggie, from the international medical organization NTG.\nLooks like a lot of people got stranded on the island after that incident.\nSince you're here, maybe you can help me out. But first, you should know this: Bring any item close to M.I.C.A. to check its details.\nNow, please help me find [3 household items]—we're facing a serious supply shortage.\nTry searching around [Wyeth Farm], [Hyder Town], and the [Motel]. Good luck!\nYou can place items on the conveyor belt to submit them.",
        "objectives": [
            "Turn in 3 household items found in raid"
        ],
        "corpId": "ntg",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 10
            },
            {
                "type": "experience",
                "quantity": 1569
            },
            {
                "type": "item",
                "item_id": "food_energy_bar",
                "quantity": 2
            },
            {
                "type": "item",
                "item_id": "med-syringe-lv1",
                "quantity": 2
            }
        ],
        "preReward": [],
        "requiredTasks": [],
        "requiredLevel": 0,
        "tips": "[Household Items](https://www.exfil-zone-assistant.app/items?category=misc&subcategory=Household) - very common items.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE"
            }
        ],
        "order": 1
    },
    "ntg_2": {
        "id": "ntg_2",
        "name": "Payback Time",
        "gameId": "task.doc.2",
        "description": "Did you notice that guy from Trupiks over there? He's Johnny, a friend of mine. Not much of a talker, especially around strangers.\nWhen I first got here, everything was chaotic and I ended up leaving the camera Johnny lent me in the [restroom] at [Altibuy Supermarket]. Could you help me get it back? I'd really appreciate it!",
        "objectives": [
            "Reach Altibuy Market",
            "Find the Bathroom in Altibuy Market",
            "Find Maggie's precious camera",
            "Turn in Maggie's Precious Camera"
        ],
        "corpId": "ntg",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 10
            },
            {
                "type": "experience",
                "quantity": 1569
            },
            {
                "type": "item",
                "item_id": "med-bandage-lv1",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "med-limb-restorer-lv1",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "med-syringe-lv1",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_1"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "CAxLmaHZ8Qs"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 43
            }
        ],
        "order": 2
    },
    "ntg_3": {
        "id": "ntg_3",
        "name": "Health Basics",
        "gameId": "task.doc.3",
        "description": "Thank you! I bet that last exploration must've been tiring.\nBy the way, just in case you didn’t know—bandages on the shelves can stop bleeding. That iron-shaped device is a limb fixer—it'll patch up damaged body parts. And if that’s too much trouble, the nearby medical station can fully heal you.\nAlso, one more thing—I'm having some trouble with my [energy-saving lamp]. Could you help me find a replacement?",
        "objectives": [
            "Turn in energy-saving lamp"
        ],
        "corpId": "ntg",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 10
            },
            {
                "type": "experience",
                "quantity": 1569
            },
            {
                "type": "item",
                "item_id": "med-syringe-lv2",
                "quantity": 2
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_2"
        ],
        "requiredLevel": 0,
        "tips": "[Energy-saving lamp](https://www.exfil-zone-assistant.app/items/misc_b_lightbulb)",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 75
            }
        ],
        "order": 3
    },
    "ntg_4": {
        "id": "ntg_4",
        "name": "A Friendly Visit",
        "gameId": "task.doc.4",
        "description": "I'm missing a few specific medicine samples for one of my treatment studies. With how things are on the island, I've lost contact with NTG and can't get a new shipment.\nLuckily, I once met a resourceful trader during my work—he might know a way. He lives in that standalone [villa] southeast of the mall and supermarket.\nCould you pay him a visit and see if he's okay? And while you're there, [check if the supply station] east of the villa is still intact.",
        "objectives": [
            "Reach the Villa",
            "Reach the Supply station"
        ],
        "corpId": "ntg",
        "type": [
            "reach"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 20
            },
            {
                "type": "experience",
                "quantity": 1569
            },
            {
                "type": "item",
                "item_id": "food_chocolate",
                "quantity": 2
            },
            {
                "type": "item",
                "item_id": "med-bandage-lv2",
                "quantity": 2
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_3"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 86
            }
        ],
        "order": 4
    },
    "ntg_5": {
        "id": "ntg_5",
        "name": "Reconnect",
        "gameId": "task.doc.5",
        "description": "He's not there? I can only hope he's safe.\r\nMaybe it's time to try what Johnny suggested—find a way to communicate or investigate further.\r\nCan you head to the [resort area] in the north, and look for a [radio] inside the [locked room] on the [2F of the hospital's west wing]?\r\nCheck your mail for the [key].",
        "objectives": [
            "Reach the west of White Sails Hospital",
            "Reach the Hospital secret room",
            "Find Maggie's Radio",
            "Turn in Maggie's Radio"
        ],
        "corpId": "ntg",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 10000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 20
            },
            {
                "type": "experience",
                "quantity": 1569
            },
            {
                "type": "item",
                "item_id": "food_mineral_water",
                "quantity": 2
            },
            {
                "type": "item",
                "item_id": "med-limb-restorer-lv2",
                "quantity": 2
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_hospitalf2",
                "quantity": 2
            }
        ],
        "requiredTasks": [
            "ntg_1"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "0g5dymVNIgo"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 109
            }
        ],
        "order": 5
    },
    "ntg_6": {
        "id": "ntg_6",
        "name": "Supply Shortage 2",
        "gameId": "task.doc.6",
        "description": "Sorry to trouble you again, but my supplies are running low. There should still be useful resources around the island. Could you gather some medical supplies and general items for me?\nAnywhere is fine—just don't let others get to them first!",
        "objectives": [
            "Turn in 4 Medical Supplies found in raid"
        ],
        "corpId": "ntg",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 30
            },
            {
                "type": "experience",
                "quantity": 2176
            },
            {
                "type": "item",
                "item_id": "med-syringe-lv3",
                "quantity": 2
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_4",
            "ntg_5"
        ],
        "requiredLevel": 0,
        "tips": "[Medical Supplies](https://www.exfil-zone-assistant.app/items?category=misc&subcategory=Medicine) - common, very easy to obtain in Resort Hospital",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 158
            }
        ],
        "order": 6
    },
    "ntg_7": {
        "id": "ntg_7",
        "name": "Info for Aid",
        "gameId": "task.doc.7",
        "description": "Thanks to the radio you recovered, I got in touch with the hospital director in the Resort Area. I've promised to help him, and in return, he'll share some info useful.\r\nPlease [deliver this X-NAX medicine] to the [Modern Apartment]'s front desk in the [Resort Area] and bring back the [data USB] there.\r\nIf you lose the task item, please come back to me to repurchase it.",
        "objectives": [
            "Reach the Modern apartment",
            "Place X-NAX on the modern apartment frontdesk",
            "Find Maggie's USB",
            "Turn in Maggie's USB"
        ],
        "corpId": "ntg",
        "type": [
            "reach",
            "place",
            "retrieve",
            "submit"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 10
            },
            {
                "type": "experience",
                "quantity": 5518
            },
            {
                "type": "item",
                "item_id": "med-syringe-lv4",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "med-bandage-lv1",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_placement_maggie_medicine",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ntg_6"
        ],
        "requiredLevel": 0,
        "tips": "Drop the [X-NAX](https://www.exfil-zone-assistant.app/items/taskitem_placement_maggie_medicine) in the box at the Modern Apartment reception. [Pink USB](https://www.exfil-zone-assistant.app/items/taskitem_placement_maggie_usb) is there too. ",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "bFUfOW56zp0"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 185
            }
        ],
        "order": 7
    },
    "ntg_8": {
        "id": "ntg_8",
        "name": "Remedy from the East",
        "gameId": "task.doc.9",
        "description": "The director mentioned that tourists here come from all over the world, and some exotic medicines often find their way here.\r\nHe heard there's a recipe from the East in [Room 202] of the [Victoria Golden Hotel].\r\nPlease go there and [take 2 photos] of the [medicine recipe].",
        "objectives": [
            "Reach victoria golden hotel room 202",
            "Take photo of the first medicine recipe",
            "Take photo of the second medicine recipe"
        ],
        "corpId": "ntg",
        "type": [
            "reach",
            "photo"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 10
            },
            {
                "type": "experience",
                "quantity": 5518
            },
            {
                "type": "item",
                "item_id": "food_meat_can_l",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "med-syringe-lv3",
                "quantity": 2
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_photophone",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ntg_7"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "mxXxaHsasKw"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 215
            }
        ],
        "order": 8
    },
    "ntg_9": {
        "id": "ntg_9",
        "name": "Exotic Remedy",
        "gameId": "task.doc.10",
        "description": "I studied the recipe—it's not too hard to recreate, but I'm missing the tools and some ingredients.\nI heard Eastern medicine often uses plant-based extracts.\nPlease find and bring me: [Aspirin], [Asthma medicine], [Bottled glucose], and some [Exotic Herbs].\nYou'll likely find the herbs in White Sail general Hospital.",
        "objectives": [
            "Find Maggie's herb",
            "Turn in Maggie's herb",
            "Turn in 1 asthma med",
            "Turn in 1 aspirin box",
            "Turn in 1 bottle of glucose"
        ],
        "corpId": "ntg",
        "type": [
            "retrieve",
            "submit"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 10
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "item",
                "item_id": "food_soda_drink",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "food_meat_can",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "med-stimul-p4",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_8"
        ],
        "requiredLevel": 0,
        "tips": "[Medical Items](https://www.exfil-zone-assistant.app/items?category=misc&subcategory=Medicine) -",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 237
            }
        ],
        "order": 9
    },
    "ntg_10": {
        "id": "ntg_10",
        "name": "Clear the way",
        "gameId": "task.doc.11",
        "description": "Turns out that powerful Eastern remedy was… a laxative!\r\nSorry, I need to stay and look after poor Johnny.\r\nCould you check on the safety extractions in the [Resort Area] for me?\r\nI want to make sure the hospital director can get out safely.",
        "objectives": [
            "Extract from Broadsea Blvd East Tunnel",
            "Extract from North Beach"
        ],
        "corpId": "ntg",
        "type": [
            "extract"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 30
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "item",
                "item_id": "med-stimul-morphine",
                "quantity": 2
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_9"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 265
            }
        ],
        "order": 10
    },
    "ntg_11": {
        "id": "ntg_11",
        "name": "Signal boost",
        "gameId": "task.doc.12",
        "description": "There's an old memorial lighthouse on the west side of the Resort Area. It's been inactive for years, but the signal there should be strong.\nI've arranged for a radio to be placed there.\nPlease find [2 watchtowers] near the [ice cream shop].\nEach one should have a [signal enhancer]—take them and install both [on the radio] at the [top of the lighthouse].\nOnce you're done, [extract near the lighthouse].",
        "objectives": [
            "Find the 2 signal enhancers",
            "Reach the Watchtower south of the Seafoam scoops",
            "Reach the Watchtower north of the Seafoam scoops",
            "Place on top of the lighthouse"
        ],
        "corpId": "ntg",
        "type": [
            "reach",
            "retrieve",
            "place"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 40
            },
            {
                "type": "experience",
                "quantity": 6403
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_10"
        ],
        "requiredLevel": 0,
        "tips": "Two Watchtowers are located north and south of Seafoam Scoops (cafeteria near the bank) [Signal enhancers](https://www.exfil-zone-assistant.app/items/taskitem_placement_signalenhancer) are found in both towers. Grab and place both on top of the lighthouse",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 295
            }
        ],
        "order": 11
    },
    "ntg_12": {
        "id": "ntg_12",
        "name": "Where did the ambulances go?",
        "gameId": "task.doc.8",
        "description": "The Resort Area is in chaos. The hospital director also asked us to look for missing ambulances.\nUse the tracker to [mark 3 ambulances] in the [Resort Area].\nWe might find some extra supplies along the way.",
        "objectives": [
            "Mark 3 Ambulances"
        ],
        "corpId": "ntg",
        "type": [
            "mark"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 10
            },
            {
                "type": "experience",
                "quantity": 5518
            },
            {
                "type": "item",
                "item_id": "food_sausage",
                "quantity": 2
            },
            {
                "type": "item",
                "item_id": "med-syringe-lv3",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_tracking_device",
                "quantity": 3
            }
        ],
        "requiredTasks": [
            "ntg_11"
        ],
        "requiredLevel": 0,
        "tips": "There are more ambulances in the area. Mostly between Bank and Hospital. Mark any 3",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "NIGkh-lpDKw"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 335
            }
        ],
        "order": 12
    },
    "ntg_13": {
        "id": "ntg_13",
        "name": "Coffee Break",
        "gameId": "task.doc.z9",
        "description": "Oh, it's you. I've been trying to stretch our medical supply a bit longer.\nBy the way… have you seen any [coffee] out there? I could really use some to stay awake during night shifts.\nIt gets especially tough in the dark underground…Ah, forget I said that.\nIf you can find me some, I promise the first cup I brew will be yours!",
        "objectives": [
            "Submit 6 coffee drinks"
        ],
        "corpId": "ntg",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 20
            },
            {
                "type": "experience",
                "quantity": 5518
            },
            {
                "type": "item",
                "item_id": "backpack_odldos_black",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_12"
        ],
        "requiredLevel": 0,
        "tips": "Not full Coffee Drinks can be submitted too.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 367
            }
        ],
        "order": 13
    },
    "ntg_14": {
        "id": "ntg_14",
        "name": "When it rains, it pours",
        "gameId": "task.doc.z13",
        "description": "You're just in time—my workspace has been leaking since yesterday.\nThe drainage pipes are broken, and the high humidity is ruining my supplies.\nJohnny offered to fix it, but he's short on parts.\nCould you find [3 valve pipes] and [3 rolls of insulating tape]?",
        "objectives": [
            "Turn in 3 valves",
            "Turn is 3 insulating tape"
        ],
        "corpId": "ntg",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 10
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "item",
                "item_id": "food_mre",
                "quantity": 2
            },
            {
                "type": "item",
                "item_id": "food_water_bottle",
                "quantity": 2
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_12"
        ],
        "requiredLevel": 0,
        "tips": "[Insulating Tape](https://www.exfil-zone-assistant.app/items/misc_b_insulatingtape), [Valve](https://www.exfil-zone-assistant.app/items/misc_b_pipeline)",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 356
            }
        ],
        "order": 14
    },
    "ntg_15": {
        "id": "ntg_15",
        "name": "NTG's Investigation 1",
        "gameId": "task.doc.13",
        "description": "Those scavengers are messing with NTG's landing. I managed to contact NTG HQ via radio.\nThey don't fully understand what's happening on the island yet, but they've promised to investigate.\nHQ wants us to check the [locked room] on the [2F of a high-rise office building] north of the motel in the [Suburb area].\nI can't fight—please go check it out for me.",
        "objectives": [
            "Reach office building by motel",
            "Find 2nd floor office lock room",
            "Extract from suburb area"
        ],
        "corpId": "ntg",
        "type": [
            "reach",
            "extract"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 30
            },
            {
                "type": "experience",
                "quantity": 64030
            },
            {
                "type": "item",
                "item_id": "med-bandage-lv3",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_9"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "7zqCwM-Kuec"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 378
            }
        ],
        "order": 15
    },
    "ntg_16": {
        "id": "ntg_16",
        "name": "Final Message",
        "gameId": "task.doc.14",
        "description": "A scholar friend of mine sent a strange message from the [Suburb area].\nPlease go to the [motel], check [room 206], and retrieve [a vial of medicine] mentioned in his note.\nHere's a bag and key—use them to get in.",
        "objectives": [
            "Reach the motel",
            "Find Maggie's poison",
            "Turn in Maggie's poison"
        ],
        "corpId": "ntg",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 40
            },
            {
                "type": "experience",
                "quantity": 7928
            },
            {
                "type": "item",
                "item_id": "med-painkiller-lv3",
                "quantity": 2
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_motel_206",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "backpack_eliteops_green",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ntg_15"
        ],
        "requiredLevel": 0,
        "tips": "[Walkie-Talkie](https://www.exfil-zone-assistant.app/items/taskitem_placement_maggie_poison) The Key can be bought from Maggie.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "5uUVSGVt8pI"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 407
            }
        ],
        "order": 16
    },
    "ntg_17": {
        "id": "ntg_17",
        "name": "Rest in Deep",
        "gameId": "task.doc.15",
        "description": "That same scholar went missing.\r\nHe once mentioned looking for research samples near a farm.\r\nThere's a rumor a body was found in the basement at [Wyeth Farm] in [Suburb area].\r\nPlease check the [cellar], and send me a [photo of the body] so I can confirm the identity.",
        "objectives": [
            "Arrive at the Wyeth farmhouse",
            "Find the Basement",
            "Find the Missing Scholar",
            "Take photo of the corpse in Wyeth farm cellar"
        ],
        "corpId": "ntg",
        "type": [
            "reach",
            "photo"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 30000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 30
            },
            {
                "type": "experience",
                "quantity": 7928
            },
            {
                "type": "item",
                "item_id": "med-stimul-kb22",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_photophone",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ntg_16"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 448
            },
            {
                "author": "orbb",
                "ytId": "-IE9eU_ZIJw"
            }
        ],
        "order": 17
    },
    "ntg_18": {
        "id": "ntg_18",
        "name": "Private Clinic",
        "gameId": "task.doc.16",
        "description": "Hi. HQ is asking for combat-zone medical supplies for analysis.\r\nI once left a [medkit] at Dr. Blue's private clinic in [Palm Hill] in [Suburb area].\r\nIt's tricky to find—it's on the [2F of a detective agency].\r\nPlease retrieve it from the office for me.",
        "objectives": [
            "Find private clinic",
            "Find Maggie's medical bag",
            "Turn in Maggie's medical bag"
        ],
        "corpId": "ntg",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 30000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 30
            },
            {
                "type": "experience",
                "quantity": 7928
            },
            {
                "type": "item",
                "item_id": "med-stimul-p4",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_17"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "F5OLdAL41Rw"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 472
            }
        ],
        "order": 18
    },
    "ntg_19": {
        "id": "ntg_19",
        "name": "NTG's Investigation 2",
        "gameId": "task.doc.17",
        "description": "NTG wants me to investigate the [dock] in the northeast [Dam area].\nJohnny also asked me to keep an eye out for any [Trupiks trucks].\nPlease take the MS2000 tracker and [tag a few containers marked with Trupiks] at the dock. Good luck!",
        "objectives": [
            "Mark 3 TRUPIK's trucks with marker device"
        ],
        "corpId": "ntg",
        "type": [
            "mark"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 30000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 30
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "item",
                "item_id": "med-syringe-lv4",
                "quantity": 2
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_tracking_device",
                "quantity": 3
            }
        ],
        "requiredTasks": [
            "ntg_18"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "n3ycwwPxpDc"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 488
            }
        ],
        "order": 19
    },
    "ntg_20": {
        "id": "ntg_20",
        "name": "Gear Upgrade",
        "gameId": "task.doc.18",
        "description": "NTG's investigation is going slow, and we're running out of supplies.\nIf you can find me [2 police radios] and [2 civilian radios], Johnny can upgrade our old radio station.\nThat'll give me a chance to run my own investigation.",
        "objectives": [
            "Turn in 2 Radio scanner",
            "Turn in 2 Civil Radio"
        ],
        "corpId": "ntg",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 30000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 30
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "item",
                "item_id": "med-bandage-lv3",
                "quantity": 3
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_19"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 515
            }
        ],
        "order": 20
    },
    "ntg_21": {
        "id": "ntg_21",
        "name": "Medical Delivery",
        "gameId": "task.doc.19",
        "description": "Some lone scavengers contacted me asking for meds.\nI don't feel safe delivering them myself, but maybe you can help.\n[Please drop the medicine into the marked boxes] at these spots:\nThe [Italian Restaurant] at the -1F of [Modern apartment] in the [Resort Area],\nThe [tower crane] on the unfinished building rooftop in [Dam area],\nThe [lone cabin] on the [Dam's west side].\nIf you lose the task item, please come back to me to repurchase it.",
        "objectives": [
            "Place \"X-NAX\" in lone cabin on Dam",
            "Place \"X-NAX\" on unfinished rooftop on Dam",
            "Place \"X-NAX\" in italian restaurant on Suburb"
        ],
        "corpId": "ntg",
        "type": [
            "place"
        ],
        "map": [
            "resort",
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 30000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 30
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "item",
                "item_id": "food_meat_can",
                "quantity": 2
            },
            {
                "type": "item",
                "item_id": "med-syringe-lv4",
                "quantity": 2
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_placement_maggie_medicine",
                "quantity": 3
            }
        ],
        "requiredTasks": [
            "ntg_20"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "3W2xFtE2G8w"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 528
            }
        ],
        "order": 21
    },
    "ntg_22": {
        "id": "ntg_22",
        "name": "Keys To Safety 1",
        "gameId": "task.doc.z19",
        "description": "There are still some locked rooms in the city center of the [Resort Area]—could be supplies inside.\nPlease find and bring me these two: [House Key 1] and [Supermarket Storage Key]. Thanks!",
        "objectives": [
            "Turn in Found In Hospital 2F key",
            "Turn in hotel 208 Key"
        ],
        "corpId": "ntg",
        "type": [
            "submit"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 10
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "item",
                "item_id": "key_tunnel",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_21"
        ],
        "requiredLevel": 0,
        "tips": "Can be bought from Maggie. Used Keys can be submitted.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 561
            }
        ],
        "order": 22
    },
    "ntg_23": {
        "id": "ntg_23",
        "name": "Keys To Safety 2",
        "gameId": "task.doc.z20",
        "description": "I need to relocate some medical supplies to a safer location.\r\nTo do that, I need the [keys] to [Motel Room 201 and Room 206].\r\nIf you come across them during your operations, please bring them back.",
        "objectives": [
            "Turn in motel 206 Key",
            "Turn in motel 201 Key"
        ],
        "corpId": "ntg",
        "type": [
            "submit"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 20
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "item",
                "item_id": "key_beartown_h1",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_22"
        ],
        "requiredLevel": 0,
        "tips": "Can be bought from Maggie. Used Keys can be submitted.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 577
            }
        ],
        "order": 23
    },
    "ntg_24": {
        "id": "ntg_24",
        "name": "Key To Safety 3",
        "gameId": "task.doc.z21",
        "description": "Thanks again! Now I can secure the stash points near the suburb area.\nBut there are two more areas I need to secure in the northern [Dam area:\nthe [East Intake tower] and [West Intake tower].\nPlease locate the keys to these two hidden rooms.\nIt may take a while, but I'll be waiting for your good news.",
        "objectives": [
            "Turn in East Dam Inlet Key",
            "Turn in West Dam Inlet Key"
        ],
        "corpId": "ntg",
        "type": [
            "submit"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 10
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "item",
                "item_id": "key_dockhouse",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_23"
        ],
        "requiredLevel": 0,
        "tips": "Used Keys can be submitted.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "2df8BKPx6rw"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 592
            }
        ],
        "order": 24
    },
    "ntg_25": {
        "id": "ntg_25",
        "name": "NTG's Investigation 3",
        "gameId": "task.doc.20",
        "description": "Johnny mentioned an abandoned church near [Clifton], in the [Dam area].\nI think it's perfect as a temporary medical outpost and investigation base.\nPlease head over there and [mark the 2 windmills] beside the church—we'll send the coordinates to NTG.",
        "objectives": [
            "Mark the Windmill #1 in Clifton",
            "Mark the Windmill #2 in Clifton"
        ],
        "corpId": "ntg",
        "type": [
            "mark"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 30
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "item",
                "item_id": "med-bandage-lv3",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "med-syringe-lv4",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_20"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "LLb0-C95KHw"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 613
            }
        ],
        "order": 25
    },
    "ntg_26": {
        "id": "ntg_26",
        "name": "Shadows of the truth 1",
        "gameId": "task.doc.21",
        "description": "I picked up some chatter from NTG through the upgraded radio. They've been hiding investigation progress from me.\nApparently, a staff member once gathered bio-samples in the [Dam area], and left behind [2 medical reports].\nThey might contain clues about the incident.\nPlease search these spots: [East Intake Tower by the Dam] and [Factory Area, Zone C].",
        "objectives": [
            "Reach the East Inlet towers",
            "Reach Factory C zone",
            "Find 2 NTG medical reports",
            "Turn in 2 NTG medical reports"
        ],
        "corpId": "ntg",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 30
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "item",
                "item_id": "backpack_eliteops_green",
                "quantity": 3
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_25"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "M3-BtDmPK78"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 640
            }
        ],
        "order": 26
    },
    "ntg_27": {
        "id": "ntg_27",
        "name": "Bearing Burdens",
        "gameId": "task.doc.22",
        "description": "The upgraded radio is very powerful, but to ensure that I don't miss any useful information, I have to keep it on at all times, so the power consumption has become a problem.\nI'm sorry to ask, but could you please find me [3 storage batteries]? That way, even at night, I won't miss any crucial contact information. By the way, those batteries are quite large, so remember to bring a bigger backpack.",
        "objectives": [
            "Turn in 3 Vehicle Battery"
        ],
        "corpId": "ntg",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 30
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "item",
                "item_id": "med-stimul-kb22",
                "quantity": 3
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_26"
        ],
        "requiredLevel": 0,
        "tips": "[Car Battery](https://www.exfil-zone-assistant.app/items/misc_b_storagebattery)",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 666
            }
        ],
        "order": 27
    },
    "ntg_28": {
        "id": "ntg_28",
        "name": "Path to Escape 1",
        "gameId": "task.doc.23",
        "description": "I think I know what NTG is planning—resource monopoly, medical control, all of it.\nBut I'm not interested. I just want to leave this place.\nTo do that, I need to map out some exit routes.\nPlease scout the [Northern Dock] and [Broken Bridge Coastline] in the Dam area, and try returning safely—just to make sure they're viable.",
        "objectives": [
            "Successfully extract from the Northern Dock",
            "Successfully extract from the coast under the broken bridge"
        ],
        "corpId": "ntg",
        "type": [
            "extract"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 30
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "item",
                "item_id": "med-syringe-lv4",
                "quantity": 3
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "ntg_27"
        ],
        "requiredLevel": 0,
        "tips": "Located north on dam in valley between both broken bridges, north of dock office at the end of pier",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "0AkItVBOwi0"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 677
            }
        ],
        "order": 28
    },
    "ntg_29": {
        "id": "ntg_29",
        "name": "Shrouded in Shadows",
        "gameId": "task.doc.28",
        "description": "Everything—you, NTG's delays—it was all part of my plan.\nI've been the one sabotaging their landing.\nNow that I've nearly mapped out the metro facility, it's only a matter of time before I take full control.\nGo to the [Medical Base] and retrieve my [Medical Kit]—it contains evidence that could expose me.\nThen, mark the [4 body bags] inside.\nI want NTG to know loud and clear:\nThey have no place here anymore.",
        "objectives": [
            "Mark all 4 body bags",
            "Find Maggie's medical bag",
            "Turn in Maggie's medical bag"
        ],
        "corpId": "ntg",
        "type": [
            "mark",
            "retrieve",
            "submit"
        ],
        "map": [
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 50
            },
            {
                "type": "experience",
                "quantity": 25672
            },
            {
                "type": "item",
                "item_id": "backpack_gnjbackpack",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "med-stimul-hc",
                "quantity": 2
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ntg_28",
            "regiment_35"
        ],
        "requiredLevel": 0,
        "tips": "Bodies and medical bag are on the lowest level. ",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "zhZlEVICwsU"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 712
            }
        ],
        "order": 29
    },
    "ntg_30": {
        "id": "ntg_30",
        "name": "Return to the dark",
        "gameId": "task.doc.24",
        "description": "You've been to the [Metro area], right? I used to work down there… It’s familiar, but also changed.\nCan you help me check if things are still the same?\nTake photos of the following, then make it back safely:\n[Metro Control Panel] in the Control Room.\n[Green Plants] in the Medical base center.\n[Bulletin Board] in the Inspection Room under the conference room.",
        "objectives": [
            "Take photo of control room",
            "Take photo of plants in medical base",
            "Take photo of bulletin board in the inspection room"
        ],
        "corpId": "ntg",
        "type": [
            "photo"
        ],
        "map": [
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 30
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "item",
                "item_id": "med-limb-restorer-lv3",
                "quantity": 2
            },
            {
                "type": "item",
                "item_id": "med-stimul-p4",
                "quantity": 2
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "taskitem_photophone",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ntg_28"
        ],
        "requiredLevel": 0,
        "tips": "take photo control console in the bomb room, bulletin located in room below conference room, photo of plants in bed base room",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "5d6THOTrYgA"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 744
            }
        ],
        "order": 30
    },
    "ntg_31": {
        "id": "ntg_31",
        "name": "Shadows of the truth 2",
        "gameId": "task.doc.25",
        "description": "The underground facility has changed more than I expected.\nI need to know what's inside those locked rooms.\nPlease find me the [keys] to [the Armory] and the [Sewer's Room] in the metro area.",
        "objectives": [
            "Turn in Armory key",
            "Turn in Sewer's room key"
        ],
        "corpId": "ntg",
        "type": [
            "submit"
        ],
        "map": [
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 50
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "item",
                "item_id": "key_exitlock_f3_sewer",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ntg_30"
        ],
        "requiredLevel": 0,
        "tips": "Can be bought from Maggie. Used Keys can be submitted.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 773
            }
        ],
        "order": 31
    },
    "ntg_32": {
        "id": "ntg_32",
        "name": "Death by deception",
        "gameId": "task.doc.26",
        "description": "Maybe you've noticed the bodies in the lower subway levels…\nThey were the NTG research team.\nI did what I had to—kept them from reporting back.\nNow I need you to recover their final [reports] from:\n[Suburb area], a [tent] in B1 Parking Lot of the mall.\n[Dam area], [crashed truck] below the bridge.\n[Metro area], bathroom in the medical Base.",
        "objectives": [
            "Find NTG Medical Reports at Suburb Mall -1F",
            "Find NTG Medical Reports at Dam Accident Truck",
            "Find NTG Medical Reports at Metro bathroom in the medical Base",
            "Turn in 3 medical reports"
        ],
        "corpId": "ntg",
        "type": [
            "retrieve",
            "submit"
        ],
        "map": [
            "dam",
            "suburb",
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 40
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "item",
                "item_id": "key_factory_b",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "med-stimul-adrenaline",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ntg_31"
        ],
        "requiredLevel": 0,
        "tips": "1st, lower part of dam in the back of crashed semi; 2nd, suburb in mall parking -1F east of escalators in military tent on shelf,3rd metro basement level, in bathroom located at end of hallway by med base(circle), enter bathroom, first sink left",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "g-j_4tw4zrw"
            },
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 788
            }
        ],
        "order": 32
    },
    "ntg_33": {
        "id": "ntg_33",
        "name": "Path to Escape 2",
        "gameId": "task.doc.27",
        "description": "NTG just reached out again. Seems the team's disappearance finally got their attention.\nWe need to move fast.\nJust like before, find the [easternmost] and [westernmost] exits in the Subway system, and make sure they're safe.\nThen, take this [poison] and place it in the [sink] inside the [Surgery Room] at the deepest level of the [Medical Base].\nIf you lose the task item, please come back to me to repurchase it.",
        "objectives": [
            "Successfully extract from coast under the West Railways, & East Metro Exit",
            "place poison in surgery room sink"
        ],
        "corpId": "ntg",
        "type": [
            "extract",
            "place"
        ],
        "map": [
            "metro"
        ],
        "reward": [
            {
                "type": "reputation",
                "corpId": "ntg",
                "quantity": 50
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "item",
                "item_id": "med-stimul-adrenaline",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "med-stimul-hc",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "med-stimul-kb22",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "med-stimul-p4",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 2
            },
            {
                "type": "item",
                "item_id": "taskitem_placement_maggie_poison",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "ntg_32"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "ZOuSedSDlUE",
                "startTs": 831
            }
        ],
        "order": 33
    },
    "trupiks_1": {
        "id": "trupiks_1",
        "name": "Secure Support",
        "gameId": "task.mall.z1",
        "description": "Hey there. I'm Johnny, former logistics manager for Trupiks. I'm handy with repairs and gear.\nI've noticed you're often out there risking your neck—so I'm building you a special secure safe container. It mounts to your lower back and is built to withstand just about anything you'll face on the battlefield.\nWhile I work on it, I need you to check on the security of 3 spots in the [Suburb area]: [Hyder Town], the [Power Plant] and the [Warehouse east] of the [office building].",
        "objectives": [
            "Reach the warehouses",
            "Reach the power plant",
            "Reach Hydertown"
        ],
        "corpId": "trupiks",
        "type": [
            "reach"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 30000
            },
            {
                "type": "experience",
                "quantity": 3311
            },
            {
                "type": "item",
                "item_name": "Pluto secure container",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [],
        "requiredLevel": 0,
        "tips": "Power plant is marked on the map, near the western bunker. Warehouses are just east next to the office building.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "quTZvsysQCQ"
            },
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc"
            }
        ],
        "order": 1
    },
    "trupiks_2": {
        "id": "trupiks_2",
        "name": "Lights On",
        "gameId": "task.mall.1",
        "description": "Hope that safe container is serving you well.\nNow, if you're interested—I can also upgrade your hideout. Just check the [Hideout tab] in your terminal, or come find me directly. I can upgrade specific rooms and utilities.\nRight now though… it's pitch black in there. I;m working under emergency lighting.\nHelp me out and find some [flammables]—I'll use them to mix fuel and get the generator running again.",
        "objectives": [
            "Turn in combustible items found in raid"
        ],
        "corpId": "trupiks",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 26000
            },
            {
                "type": "experience",
                "quantity": 1807
            },
            {
                "type": "item",
                "item_name": "HQ Power Fuel Can L",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "trupiks_1"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 58
            }
        ],
        "order": 2
    },
    "trupiks_3": {
        "id": "trupiks_3",
        "name": "The Source of Life",
        "gameId": "task.mall.2",
        "description": "[Unlocks Water Collector's upgrades]\nWater has become super valuable these days, but those scavengers messed up our water collection system's pipes.\nI'm in the middle of fixing the pipes, but I'd really appreciate it if you could go [deal with those troublemakers] and show them they can't just mess with our stuff.\nAfter that, the medical area will can be available for upgrade, allowing you to recover health faster in the hideout.",
        "objectives": [
            "Eliminate scavengers in the suburb area"
        ],
        "corpId": "trupiks",
        "type": [
            "eliminate"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 26000
            },
            {
                "type": "experience",
                "quantity": 1807
            },
            {
                "type": "item",
                "item_name": "45 acp ammo box",
                "quantity": 1
            },
            {
                "type": "item",
                "item_name": "5.56x54 ammo box",
                "quantity": 1
            },
            {
                "type": "item",
                "item_name": "9x19 ammo box",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "trupiks_2"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 101
            }
        ],
        "order": 3
    },
    "trupiks_4": {
        "id": "trupiks_4",
        "name": "Handy Tools",
        "gameId": "task.mall.3",
        "description": "[Unlocks Generator's upgrades]\nBy the way, upgrading the the facilities will help you grow. My personal tip is to upgrade the generator first, since having power is the foundation for upgrading other facility.\nIf you need to upgrade the generator, could you help me out by getting my trusty drill back? I remember leaving it behind at the [bakery] in [Hyder Town] when I escaped.",
        "objectives": [
            "Find Bearkery",
            "Find Johnny's drill",
            "Turn in Johnny's drill"
        ],
        "corpId": "trupiks",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "experience",
                "quantity": 3311
            },
            {
                "type": "item",
                "item_name": "12ga ammo box",
                "quantity": 1
            },
            {
                "type": "item",
                "item_name": "5.45x39 ammo box",
                "quantity": 1
            },
            {
                "type": "item",
                "item_name": "7.62x39 ammo box",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "trupiks_3"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "IWDA_Giw4qo"
            },
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 183
            }
        ],
        "order": 4
    },
    "trupiks_5": {
        "id": "trupiks_5",
        "name": "Homecoming",
        "gameId": "task.mall.4",
        "description": "[Unlocks Lounge/Book Shelf/Sofa's upgrades]\nYou've really done a great job setting this place up; it reminds me of home... Sorry, I guess I'm just missing my family a bit. Maybe you could do me a favor, and I can help you spruce up the lounge area a bit. Having a nice, comfortable space to rest will really help you in battle.\nCould you check out [Hyder Town] for me? My house is the first one at the east entrance of the town. If you could grab my precious [family videotapes], I'd really appreciate it. Looking forward to hearing from you!",
        "objectives": [
            "Reach Hyder Town",
            "Find Johnny's FamilyTapeTurn in Johnny's FamilyTape"
        ],
        "corpId": "trupiks",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 26000
            },
            {
                "type": "experience",
                "quantity": 1807
            },
            {
                "type": "item",
                "item_name": "Collection Box",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "trupiks_4"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "lDhfK8lld7U"
            },
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 206
            }
        ],
        "order": 5
    },
    "trupiks_6": {
        "id": "trupiks_6",
        "name": "Speaking of Finance",
        "gameId": "task.mall.5",
        "description": "[Unlocks Bitcoin Mine's upgrades]\nIf you're looking to secure some steady income, I recommend building and upgrading your [Bitcoin mining rig]. It'll use up some power but will bring you in some money every now and then. The more graphics cards you can get and install in there, the more money your mine can make. Just remember to keep an eye on the [generator's fuel level].\nIf you want to set up the Bitcoin mining rig, could you grab me [5 electronic devices]? I'll get those machines sorted out.",
        "objectives": [
            "Turn in 5 electrical items found in raid"
        ],
        "corpId": "trupiks",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 30000
            },
            {
                "type": "experience",
                "quantity": 3311
            },
            {
                "type": "item",
                "item_name": "Medical box",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "trupiks_5"
        ],
        "requiredLevel": 0,
        "tips": "[Electric items](https://www.exfil-zone-assistant.app/items?category=misc&subcategory=Electric) Recommend PC fan or RAM",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 226
            }
        ],
        "order": 6
    },
    "trupiks_7": {
        "id": "trupiks_7",
        "name": "Target Practice",
        "gameId": "task.mall.6",
        "description": "[Unlocks Shooting Range's upgrades]\nHi there, I heard from Maggie that you helped her retrieve the radio, and I'm glad to see her research is going smoothly. By the way, while I was rummaging through some old stuff, I found the blueprints for our HQ.\nHere's some good news: I figured out how to unlock the shooting range behind the house. However, I still need a little favor from you. Could you please bring back the [small key] from the [office room] on the [1F of the police station in Hyder town]? I know this is nothing for you! Good luck!",
        "objectives": [
            "Reach Hyder Town Police Station",
            "Find shooting range key",
            "Turn in shooting range key"
        ],
        "corpId": "trupiks",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 31000
            },
            {
                "type": "experience",
                "quantity": 3311
            },
            {
                "type": "item",
                "item_name": "Mag&attchament box",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "trupiks_2",
            "ntg_5"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "0c5zNm33Dx0"
            },
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 124
            }
        ],
        "order": 7
    },
    "trupiks_8": {
        "id": "trupiks_8",
        "name": "Capacity Upgrade 1",
        "gameId": "task.mall.z2",
        "description": "How's the safe container working out?\nI've been studying the design, and I can now build a larger version of it. I bet you want that too.\nBut I'm short on one key item—a special [Parts Box]. Head over to the [Auto Repair Shop in the Suburb area] and see if you can find one.",
        "objectives": [
            "Reach the \"24hr Car Repair\"",
            "Find Jonny's safebox",
            "Turn in Find Jonny's safebox"
        ],
        "corpId": "trupiks",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 30000
            },
            {
                "type": "experience",
                "quantity": 3311
            },
            {
                "type": "item",
                "item_name": "mercury box",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "trupiks_2"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 151
            }
        ],
        "order": 8
    },
    "trupiks_9": {
        "id": "trupiks_9",
        "name": "Canal Run",
        "gameId": "task.mall.z3",
        "description": "Got a strange one for you.\nSomeone told me they spotted some of my missing cargo near the [canal bridges west of Trupiks].\nProblem is… I don't know which bridge they meant.\nI need you to go check all [three canal bridges] and see what you can find.",
        "objectives": [
            "Reach the canal bridge 1",
            "Reach the canal bridge 2",
            "Reach the canal bridge 3"
        ],
        "corpId": "trupiks",
        "type": [
            "reach"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 10000
            },
            {
                "type": "experience",
                "quantity": 3311
            },
            {
                "type": "item",
                "item_name": "HQ Power Fuel Can L",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "trupiks_8",
            "ark_16"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "_gVFJBMxPr8"
            },
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 241
            }
        ],
        "order": 9
    },
    "trupiks_10": {
        "id": "trupiks_10",
        "name": "Capacity Upgrade 2",
        "gameId": "task.mall.z4",
        "description": "I need another [Parts Box]—try your luck in the [Resort Area]. Look around at the [worker's dorm], check the [Laundry room] and bring that box back if you find it.\nIf we get it, I'll get started on building a third-tier safe container.",
        "objectives": [
            "Find Johnny's safebox",
            "Turn in Johnny's safebox"
        ],
        "corpId": "trupiks",
        "type": [
            "retrieve",
            "submit"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 30000
            },
            {
                "type": "experience",
                "quantity": 3311
            },
            {
                "type": "item",
                "item_name": "Venus Container",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "trupiks_9"
        ],
        "requiredLevel": 0,
        "tips": "Located at the Workers Dormitory. At the laundry mat.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 292
            }
        ],
        "order": 10
    },
    "trupiks_11": {
        "id": "trupiks_11",
        "name": "Salvage Mission 1",
        "gameId": "task.mall.z5",
        "description": "I'm trying to recover rare components from a specific model of TV—the same one I used to have back home.\nI've scavenged most of them already, except the [northeast side of the Suburb area].\nHead up there and [photograph any TVs] you find in those northern houses.\nI'll handle the recovery once I see what's left.",
        "objectives": [
            "Take Picture of Tv #1, #2, & #3 in yellow house",
            "take picture of Tv #4 & #5 in red house"
        ],
        "corpId": "trupiks",
        "type": [
            "photo"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 10000
            },
            {
                "type": "experience",
                "quantity": 3311
            },
            {
                "type": "item",
                "item_name": "medical box",
                "quantity": 3
            },
            {
                "type": "item",
                "item_name": "mag pouch M",
                "quantity": 2
            },
            {
                "type": "item",
                "item_name": "mag pouch s",
                "quantity": 2
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_photophone",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "trupiks_10"
        ],
        "requiredLevel": 0,
        "tips": "Take Picture of Tv #1, #2, & #3 located in yellow houses on hill by military base; take picture of Tv #4 & #5 in houses behind yellow houses close to bunker extract ",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "DrK25Bnw38g"
            },
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 317
            }
        ],
        "order": 11
    },
    "trupiks_12": {
        "id": "trupiks_12",
        "name": "One Last Mile",
        "gameId": "task.mall.z6",
        "description": "We've been having issues with security along our logistics routes.\r\nI need to deploy a comms relay setup to make sure messages get through without a hitch.\r\nHead to the [garbage station on the east of Whitesail hospital], and collect [3 walkie-talkies] from its back alley.\r\nThen go to the [skate park], locate [3 stashing cardboard boxes], and plant the walkies there.",
        "objectives": [
            "Find Johnny's 3 Walkie-Talkies",
            "Place in Skate park"
        ],
        "corpId": "trupiks",
        "type": [
            "retrieve",
            "place"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 10000
            },
            {
                "type": "experience",
                "quantity": 3311
            },
            {
                "type": "item",
                "item_name": "Mag&attchament box",
                "quantity": 1
            },
            {
                "type": "item",
                "item_name": "Mag pouch M",
                "quantity": 3
            },
            {
                "type": "item",
                "item_name": "Mag pouch S",
                "quantity": 3
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "trupiks_11"
        ],
        "requiredLevel": 0,
        "tips": "[Walkie-Talkie](https://www.exfil-zone-assistant.app/items/taskitem_placement_johnny_walkietalkie)",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "kAvBXhqCx6c"
            },
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 360
            }
        ],
        "order": 12
    },
    "trupiks_13": {
        "id": "trupiks_13",
        "name": "Salvage Mission 2",
        "gameId": "task.mall.z7",
        "description": "Word is, the [Dam Area] still shows traces of past military activity.\nI want you to survey [3 old military camps] out there and use this [tracker] to tag [two tanks] for me.\nI'll go in afterward to recover anything salvageable.",
        "objectives": [
            "Find the military camp next to dam",
            "Find second military camp next to dam",
            "Find 3rd military camp next to broken bridge",
            "Mark all 3 tanks next to military camps"
        ],
        "corpId": "trupiks",
        "type": [
            "reach",
            "mark"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 30000
            },
            {
                "type": "experience",
                "quantity": 3311
            },
            {
                "type": "item",
                "item_name": "Titan Container",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_tracking_device",
                "quantity": 3
            }
        ],
        "requiredTasks": [
            "trupiks_12"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "JFgC9jfom3g"
            },
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 387
            }
        ],
        "order": 13
    },
    "trupiks_14": {
        "id": "trupiks_14",
        "name": "Like Finds Like 1",
        "gameId": "task.mall.z8",
        "description": "Repairs and production eat up resources fast.\nI'm stocking up on supplies—and the first category is [household items].\nHere's a list. See what you can find.",
        "objectives": [
            "Turn in 5 Cleanser",
            "Turn in 5 Cleaner",
            "Turn in 5 Deodorant",
            "Turn in 5 Pesticide",
            "Turn in 5 Toilet Paper",
            "Turn in 5 Soap",
            "Turn in 5 Beard Oil",
            "Turn in 5 Toothpaste"
        ],
        "corpId": "trupiks",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 30000
            },
            {
                "type": "experience",
                "quantity": 3311
            },
            {
                "type": "item",
                "item_name": "Mag double pouch",
                "quantity": 2
            },
            {
                "type": "item",
                "item_name": "Mag pouch M",
                "quantity": 2
            },
            {
                "type": "item",
                "item_name": "Mag pouch S",
                "quantity": 2
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "trupiks_13"
        ],
        "requiredLevel": 50,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 425
            }
        ],
        "order": 14
    },
    "trupiks_15": {
        "id": "trupiks_15",
        "name": "Like Finds Like 2",
        "gameId": "task.mall.z9",
        "description": "Thanks for the last delivery. Since you're already helping, let's keep going.\nThis time I'm looking for [specific tools].\nYou'll need to collect the ones listed here exactly—no substitutes. Much appreciated.",
        "objectives": [
            "Turn in 5 Screwdriver",
            "Turn in 5 Wrench",
            "Turn in 5 Hammer",
            "Turn in 5 Measuring Tape",
            "Turn in 5 Wire Cutter",
            "Turn in 5 Small Wrench",
            "Turn in 5 Spark Plug",
            "Turn in 5 Electric Drill"
        ],
        "corpId": "trupiks",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 30000
            },
            {
                "type": "experience",
                "quantity": 3311
            },
            {
                "type": "item",
                "item_name": "Mag double pouch",
                "quantity": 2
            },
            {
                "type": "item",
                "item_name": "Mag pouch M",
                "quantity": 2
            },
            {
                "type": "item",
                "item_name": "Mag pouch S",
                "quantity": 2
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "trupiks_14"
        ],
        "requiredLevel": 50,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 450
            }
        ],
        "order": 15
    },
    "trupiks_16": {
        "id": "trupiks_16",
        "name": "Like Finds Like 3",
        "gameId": "task.mall.z10",
        "description": "Next up—[storage media].\nI'm particular about these. I need the right types to ensure data integrity.\nCheck the list and get me what you can.",
        "objectives": [
            "Turn in 5 CD",
            "Turn in 5 Horror Novel",
            "Turn in 5 Magazine",
            "Turn in 5 Recorder",
            "Turn in 5 Computer Manual",
            "Turn in 5 Antiquarian Book",
            "Turn in 5 Tape",
            "Turn in 5 Floppy Disc"
        ],
        "corpId": "trupiks",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 30000
            },
            {
                "type": "experience",
                "quantity": 3311
            },
            {
                "type": "item",
                "item_name": "Mag double pouch",
                "quantity": 3
            },
            {
                "type": "item",
                "item_name": "Mag pouch M",
                "quantity": 3
            },
            {
                "type": "item",
                "item_name": "Mag pouch S",
                "quantity": 3
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "trupiks_15"
        ],
        "requiredLevel": 50,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 465
            }
        ],
        "order": 16
    },
    "trupiks_17": {
        "id": "trupiks_17",
        "name": "Like Finds Like 4",
        "gameId": "task.mall.z11",
        "description": "You've gotten me this far—thank you.\nThis is the final set of supplies I need: [energy-based items].\nThese are vital to keeping our systems running smoothly. As always, here's the list. I appreciate your help.",
        "objectives": [
            "Turn in 5 Oil Can",
            "Turn in 5 Gunpowder",
            "Turn in 5 Gas Can",
            "Turn in 5 Gun Oil",
            "Turn in 5 Large Gas Can",
            "Turn in 5 WD40",
            "Turn in 5 Smokeless Powder",
            "Turn in 5 Olive Oil"
        ],
        "corpId": "trupiks",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 30000
            },
            {
                "type": "experience",
                "quantity": 3311
            },
            {
                "type": "item",
                "item_name": "Neptune container",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "trupiks_16"
        ],
        "requiredLevel": 50,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "DIjbTZN_Wxc",
                "startTs": 480
            }
        ],
        "order": 17
    },
    "regiment_1": {
        "id": "regiment_1",
        "name": "A Different Style",
        "gameId": "task.wp.1",
        "description": "Hey buddy, looks like you're running errands for that guy from... what's it called again, ARK Industry? I've seen their stuff—just a bunch of fancy toys for play-pretend made by high-and-mighty types! Ha! Want to try the real deal instead? Everything I have here packs a genuine punch... What? My weapon supply isn't the same as theirs. If you want the good stuff, just come to me, Igor. You won't regret it. Here, take this and give it a whirl.",
        "objectives": [
            "Eliminate 8 targets with: rifle"
        ],
        "corpId": "regiment",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "experience",
                "quantity": 1807
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "weapon-thompson-m1928",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_45acp_25",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "ammo-45acp-fmj",
                "quantity": 30
            }
        ],
        "preReward": [],
        "requiredTasks": [],
        "requiredLevel": 0,
        "tips": "Keep reward [Thompson]https://www.exfil-zone-assistant.app/items/weapon-thompson-m1928 for following tasks.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY"
            }
        ],
        "order": 1
    },
    "regiment_2": {
        "id": "regiment_2",
        "name": "Taste of Life 1",
        "gameId": "task.wp.2",
        "description": "Not bad! So, what do you think? Told you my gear's in a league of its own! Haha. Hold up—if you want more of the good stuff, you've gotta play by my rules.\nListen up, friend: getting on my good side is simple. Bring me [2 beers], but don't even think about trying to pass off the cheap stuff from those other folks. I've got refined tastes. Try looking around [TRUPIKS], [Altibuy], and [the graveyard]—you might just find the kind of beer I'm after.",
        "objectives": [
            "Submit 2 Beer"
        ],
        "corpId": "regiment",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "experience",
                "quantity": 1807
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-545x39-fmj",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-aks74u",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_545x39_30_black",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_1"
        ],
        "requiredLevel": 0,
        "tips": "Graveyard on suburb might be a 100% spawn,but food location could have it. Keep reward [AKS74u](https://www.exfil-zone-assistant.app/items/weapon-aks74u) for following tasks.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 38
            }
        ],
        "order": 2
    },
    "regiment_3": {
        "id": "regiment_3",
        "name": "Explosive Romance",
        "gameId": "task.wp.3",
        "description": "Hic! Ahh, it's been a long time since I had a taste like this! Hey, you, come closer—I've got something to tell ya. I know where some gunpowder's stashed. Don't ask who put it there; just go grab it for me! Hic. What? This isn't stealing. Now, enough chit-chat, get moving!\nRemember, the stuff's on the [rooftop of the Altibuy] and at the [power station east of Altibuy]. Bring it back, and of course, I'll have a nice reward for you.",
        "objectives": [
            "Find Igor's AltiBuy GunPowder",
            "Find Igor's PowerStation GunPowder",
            "Turn in 2 GunPowder"
        ],
        "corpId": "regiment",
        "type": [
            "retrieve",
            "submit"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "experience",
                "quantity": 1807
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "grenade-rgn-frag",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "grenade-rgo-frag",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "grenade-vod25-frag",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_2"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "FkiWA6Eb7fo"
            },
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 54
            }
        ],
        "order": 3
    },
    "regiment_4": {
        "id": "regiment_4",
        "name": "Shades for Boom",
        "gameId": "task.wp.4",
        "description": "You know what's better than booze? Watching explosions while drinking, ha! Nothing gets the blood pumping like that!\nBut lately… damn flash burns got my eyes hurting real bad.\nNo, no, don't go crying to Maggie—I don't need eye drops.\nWhat I need is… [sunglasses]!\nGo grab me a good pair from the [Fire Station] in [Resort area], and don't take all day. The next blast show's starting soon!",
        "objectives": [
            "Reach the the Fire Station",
            "Find Igor's Sunglasses",
            "Turn in Igor's Sunglasses"
        ],
        "corpId": "regiment",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "experience",
                "quantity": 2178
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "grenade-m67-frag",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "grenade-f1-frag",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "grenade-rgd5-frag",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_3"
        ],
        "requiredLevel": 0,
        "tips": "Glasses on front desk. Keep the rewards for the following quests.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "kFwjed9fWWI"
            },
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 96
            }
        ],
        "order": 4
    },
    "regiment_5": {
        "id": "regiment_5",
        "name": "Firepower Roundup 1",
        "gameId": "task.wp.z3",
        "description": "I'm taking weapons them apart for some fun— but I don't want to tear apart my own stuff! So, I need you to help me gather some weapons.\nI’ll make sure to reward you well. Let’s start simple: bring me [an M92], and [an M1928].\nI just need one of each. If you can’t find them, take a look at the scavengers. I've seen them wandering around with these weapons from time to time.",
        "objectives": [
            "Turn in M92 Found In Raid",
            "Turn in M1928 Found In Raid"
        ],
        "corpId": "regiment",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "experience",
                "quantity": 2178
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 20
            },
            {
                "type": "item",
                "item_id": "ammo-12ga-buckshot-ap",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-m590",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_3"
        ],
        "requiredLevel": 0,
        "tips": "Does not need to be found in raid. However, popular amongst Scavengers",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 120
            }
        ],
        "order": 5
    },
    "regiment_6": {
        "id": "regiment_6",
        "name": "Firepower Roundup 2",
        "gameId": "task.wp.z4",
        "description": "You're doing pretty well. Haha, the next items I need might be a bit harder to get, so be ready.\r\nI need you to find: an [AKS74U] and [an M4A1].\r\nSame rule, just one of each will do.",
        "objectives": [
            "Turn in AKS74U Found In Raid",
            "Turn in AR15 Hunter Found In Raid"
        ],
        "corpId": "regiment",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "experience",
                "quantity": 2178
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-762x39-ps",
                "quantity": 60
            },
            {
                "type": "item",
                "item_id": "mag_762x39_30",
                "quantity": 2
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_5"
        ],
        "requiredLevel": 0,
        "tips": "Does not need to be found in raid. However, popular amongst Scavengers",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 140
            }
        ],
        "order": 6
    },
    "regiment_7": {
        "id": "regiment_7",
        "name": "Firepower Roundup 3",
        "gameId": "task.wp.z13",
        "description": "I used to be the best pitcher on our baseball team. Even in the army, I could toss grenades farther and more accurate than anyone else.\nBeen feeling the itch again lately...\nCan you find me some grenades to relive the glory days?\nI want: a [Frag Grenade M67], a [Frag Grenade F1], and a [Frag Grenade R5].",
        "objectives": [
            "Turn in M67 Found In Raid",
            "Turn in F1 Found In Raid",
            "Turn in RGD-5 Found In Raid"
        ],
        "corpId": "regiment",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 18000
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-545x39-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-ak74n-factory",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x39_30",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_6"
        ],
        "requiredLevel": 0,
        "tips": "Do not have to be found in raid. Use rewards from previous task. Look for green crates",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 159
            }
        ],
        "order": 7
    },
    "regiment_8": {
        "id": "regiment_8",
        "name": "Submachine Guns",
        "gameId": "task.wp.5",
        "description": "Life on the island is super boring. Want to join me for some fun? Honestly, the best thing to do is put a few bullet holes in those poor scavengers, hahaha!\nI once made a bet with a buddy on the battlefield— just using submachine guns, to see who could rack up more kills. But you know what? That guy charged out and never came back. I bet he's off slacking somewhere; totally disrespected our bet! You're wondering where he is now? Well, he's right here, this dog tag is all that's left.\nSo, how about you step in and finish that bet for him? Give it a try and [take out a few scavengers with submachine guns]!",
        "objectives": [
            "Eliminate 8 targets with: SMG"
        ],
        "corpId": "regiment",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 5518
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "ammo-45acp-tracer",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-ump45",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_45acp_25_2",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_7"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 186
            }
        ],
        "order": 8
    },
    "regiment_9": {
        "id": "regiment_9",
        "name": "Shotgun Shock",
        "gameId": "task.wp.6",
        "description": "Seeing you so busy makes me a bit nostalgic for the old days. When I first got enlisted, the front lines were still ablaze, and the higher-ups couldn't care less about us new recruits. We went through just minimal of training before being tossed into the battle. There was one time my gun ran out of bullets, and I just picked up some enemy's shotgun and charged right back! Hahaha!\nOh, after all my rambling, are your hands itching for a bit of fun? Grab that [shotgun] and head to the [Suburb area] to give those scavengers a taste of \"shotgun shock!\"",
        "objectives": [
            "Eliminate 5 targets with: pump shotgun"
        ],
        "corpId": "regiment",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 5518
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-12ga-buckshot-ap",
                "quantity": 45
            },
            {
                "type": "item",
                "item_id": "weapon-sjogren-inertia",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_8"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 247
            }
        ],
        "order": 9
    },
    "regiment_10": {
        "id": "regiment_10",
        "name": "Treasure in the Sewage",
        "gameId": "task.wp.7",
        "description": "Hear that racket over in the [Resort Area]?\nDamn chaos. But what really worries me—my notes!\nMy most precious treasure, hidden in the [Wastewater Treatment Plant] on the west side.\nYou know, memory's a man's real treasure once the years pile up.\nPlease, go get it back for me!",
        "objectives": [
            "Reach the wastewater treatment plant",
            "Find Igor's notes",
            "Turn in Igor's notes"
        ],
        "corpId": "regiment",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 5518
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-762x39-ps",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-sks",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x39_15",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_8"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "ZRnKbMybPzo"
            },
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 274
            }
        ],
        "order": 10
    },
    "regiment_11": {
        "id": "regiment_11",
        "name": "Long Live friendship 1",
        "gameId": "task.wp.8",
        "description": "I got an old buddy used to live in the [Resort Area]. He loved messing around with rocks and metal.\nNever understood why—can't protect you like a gun can, can it?\nAnyway, I heard the place is crawling with low-life thugs now.\nThey're probably disturbing his rest.\n[Go teach those punks a lesson], will you?",
        "objectives": [
            "Eliminate 10 scavs in resort area"
        ],
        "corpId": "regiment",
        "type": [
            "eliminate"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-762x54r-tracer",
                "quantity": 45
            },
            {
                "type": "item",
                "item_id": "weapon-mosin-nagant",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_10"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 293
            }
        ],
        "order": 11
    },
    "regiment_12": {
        "id": "regiment_12",
        "name": "Long Live friendship 2",
        "gameId": "task.wp.9",
        "description": "That old pal? Folks called him the legendary jeweler, but to me he was just Old Jay.\nHe made the 'Heart of the Blue Sea'—yep, that’s the one stolen from the bank heist.\nAfter he passed away at [White Sail Hospital], he left me a journal.\nIt mentions a few spots I want to check on.\nHelp me out—[take photos] of those places so I can see for myself.",
        "objectives": [
            "Take photo of a clue on the wall (Modern apartment park)",
            "Take photo of a clue on the wall (Halif Voyage backdoor)",
            "Take photo of a clue on the wall (Beach chair area)"
        ],
        "corpId": "regiment",
        "type": [
            "photo"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-762x51-hp",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-hk91-wood",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "G3 10-Round Magazine",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_photophone",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "regiment_11"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "oAQ9Rl2WTmM"
            },
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 342
            }
        ],
        "order": 12
    },
    "regiment_13": {
        "id": "regiment_13",
        "name": "My Favorite: FAL",
        "gameId": "task.wp.10",
        "description": "Hey, listen up! Do you know what my favorite gun is? That's right, it's the fierce FAL! It's like an old friend, accompanying me through countless crazy moments.\nNow, I want you to take that [FAL] and [take out some pesky scavengers]! Let the bullets unleash their power and take down all the enemies! Don't be afraid; just imagine the fear in their eyes and enjoy the moment!",
        "objectives": [
            "FAL series: Eliminate 8 targets"
        ],
        "corpId": "regiment",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "weapon-fn-fal",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_12"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 369
            }
        ],
        "order": 13
    },
    "regiment_14": {
        "id": "regiment_14",
        "name": "One last drink, my friend",
        "gameId": "task.wp.11",
        "description": "You know why those thugs never found the 'Heart of the Blue Sea'?\nBecause Old Jay gave it to me. But that's between us.\nHe always loved that weird-tasting Collector's Beer.\nSo here's what I want you to do—go to his grave next to the lighthouse, and bring this [memorial beer] to him.\nHe deserves one last drink.\nIf you lose the task item, please come back to me to repurchase it.",
        "objectives": [
            "Place Task Beer at the Old Jay's grave"
        ],
        "corpId": "regiment",
        "type": [
            "place"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 7928
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 50
            },
            {
                "type": "item",
                "item_id": "ammo-762x39-ps",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-akmn-g",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x39_30",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_placement_igor_memobeer",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "regiment_13"
        ],
        "requiredLevel": 0,
        "tips": "Bring beer to lighthouse on resort, small grave behind, place beer",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "fmGJ_eR3m2Y"
            },
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 420
            }
        ],
        "order": 14
    },
    "regiment_15": {
        "id": "regiment_15",
        "name": "Reading Habits",
        "gameId": "task.wp.12",
        "description": "You ever be halfway through drooling over the \"World Gourmet Digest\" and BAM—darkness?\nPower's out again. Weird stuff. I oughta go check those damn wires someday.\nAnyway, I need to be prepared next time. Bring me a [flashlight] and a [round battery].\nAt least then I can keep reading my magazine in peace.",
        "objectives": [
            "Turn in 1 flashlight",
            "Turn in 3 size D battery (round)"
        ],
        "corpId": "regiment",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 7928
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-762x39-ps",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-akmn",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x39_30",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_14"
        ],
        "requiredLevel": 0,
        "tips": "[Size D Battery](https://www.exfil-zone-assistant.app/items/misc_b_1battery), [Flashlight](https://www.exfil-zone-assistant.app/items/misc_b_flashlight)",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 440
            }
        ],
        "order": 15
    },
    "regiment_16": {
        "id": "regiment_16",
        "name": "The Best Can",
        "gameId": "task.wp.z12",
        "description": "Hey, I heard you got some coffee for that little girl? How about helping this old guy out too? We all need to satisfy our cravings after all! \nWhat I want isn't hard to find; it's just some canned food! Go check the [Suburb area] for a certain kind of [pea can]—it's delicious! Bring me [5] of them. I don't know what that producer adds to it, but every time when I eat it, my tongue gets all tingly... What? An allergic reaction? I don't believe that nonsense; it's a treat for the taste buds!",
        "objectives": [
            "Submit 5 can of peas"
        ],
        "corpId": "regiment",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "scope_mosinpu",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "ammo-762x54r-fmj",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-mosin-91-30",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_14"
        ],
        "requiredLevel": 0,
        "tips": "Can submit half-eaten can.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 452
            }
        ],
        "order": 16
    },
    "regiment_17": {
        "id": "regiment_17",
        "name": "Pistol Glory",
        "gameId": "task.wp.13",
        "description": "Story time! There was an old comrade of mine who complained about pistols, saying it was useless. He said it was like a firecracker—makes a noise at most, just to scare off the timid ones. Then once, we got surrounded and couldn't peek out from behind a rock for cover, with only my pistol on my hip.\nHe kept saying we were done for, but I pulled out that little pistol he looked down on and charged out shouting, then I took out all those enemies, hahaha! After that, he took my gun and kept it with him all the time.\nAlright, done with the story! Now it's your turn to make that [pistol] shine!",
        "objectives": [
            "Eliminate 8 targets with: pistol"
        ],
        "corpId": "regiment",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 30000
            },
            {
                "type": "experience",
                "quantity": 7928
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "food_mre",
                "quantity": 3
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_14"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 465
            }
        ],
        "order": 17
    },
    "regiment_18": {
        "id": "regiment_18",
        "name": "Movie Night 1",
        "gameId": "task.wp.14",
        "description": "You know I'm a sucker for thrilling, edge-of-your-seat movies.\r\nBut I've watched my DVDs so many times, even the discs are sick of me.\r\nHead to the [Resort Area], maybe check the [Rua Algasol] and the [little diner] close to the [skate park] .\r\nFind me that shark-themed thriller to spice up movie night!",
        "objectives": [
            "Find SHARK CD",
            "Find SHARK sequel CD",
            "Turn in both CDs"
        ],
        "corpId": "regiment",
        "type": [
            "retrieve",
            "submit"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 18000
            },
            {
                "type": "experience",
                "quantity": 7928
            },

            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-545x39-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-ak74m",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x39_30",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_17"
        ],
        "requiredLevel": 0,
        "tips": "One on toilet at Skatepark cafe. Second CD on barrel at Rua Algasol.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "cNQ5CB60RpU"
            },
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 503
            }
        ],
        "order": 18
    },
    "regiment_19": {
        "id": "regiment_19",
        "name": "Hunter",
        "gameId": "task.wp.15",
        "description": "I've been reading novels, and the author probably has never even handled a gun; what they write is completely unrealistic. Let me share a true story with you: \nBack then, before I went to the battlefield. One time, I went hunting with my Dad. I saw a shadow in the trees across the river and thought it was a bear. I fired without hesitation. Later I found out it was an enemy soldier who had escaped from the battlefield. So, what do you think? Why don't you give it a try and [put down some scavengers with bolt-action rifles]?",
        "objectives": [
            "Eliminate 5 targets with: Bolt Action"
        ],
        "corpId": "regiment",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-762x54r-apv1",
                "quantity": 45
            },
            {
                "type": "item",
                "item_id": "weapon-mosin-m38",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_18"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 531
            }
        ],
        "order": 19
    },
    "regiment_20": {
        "id": "regiment_20",
        "name": "Magazine Recovery",
        "gameId": "task.wp.16",
        "description": "You know how important recycling is on this forsaken island.\nBut some folks just dump their empty mags like they grow on trees!\nYou're better than that.\nBring me some used [AK magazines and G3 magazines].\nI'll refurb them and maybe make a few bucks on the side.",
        "objectives": [
            "Turn in 2 AKM metal 30-round magazines",
            "Turn in 2 G3 30-round magazines."
        ],
        "corpId": "regiment",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 25000
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-762x51-hp",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-g3a3",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "mag_762x51_20_3",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_19"
        ],
        "requiredLevel": 0,
        "tips": "[AKM metal magazine](https://www.exfil-zone-assistant.app/items/mag_762x39_30), [G3 30-round magazine](https://www.exfil-zone-assistant.app/items/mag_762x51_30).",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 610
            }
        ],
        "order": 20
    },
    "regiment_21": {
        "id": "regiment_21",
        "name": "My Favourite: G18",
        "gameId": "task.wp.17",
        "description": "My favorite pistol? G18.\nIt's like my little sidekick—never leaves my side, been through hell and back with me. Those damn scavengers nearby won't stop causing trouble… I can barely sleep!\nIf you ask me, there's no better gun to keep under your pillow than a [G18]. Grab one and give those pests a taste of sweet, compact justice.",
        "objectives": [
            "Eliminate 6 targets with Glock 18c pistol"
        ],
        "corpId": "regiment",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 50
            },
            {
                "type": "item",
                "item_id": "ammo-9x19-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-aug-para",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_9x19mm_25",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_20"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 653
            }
        ],
        "order": 21
    },
    "regiment_22": {
        "id": "regiment_22",
        "name": "Hair Comes First",
        "gameId": "task.wp.18",
        "description": "Hey, it's you! How's my look today?\r\nBet you won't find a more stylish guy on this rock—haha!\r\nWanna be as slick as me? Rule number one: keep your hair in shape.\r\nStop hiding it under that bulky helmet.\r\n[Take it off], head into the field, and show me how long your style survives in a firefight!",
        "objectives": [
            "Eliminate 8 targets without wearing helmet"
        ],
        "corpId": "regiment",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 12710
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 40
            },
            {
                "type": "item",
                "item_id": "ammo-762x54r-fmj",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-svt-40",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x54R_10",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_21"
        ],
        "requiredLevel": 0,
        "tips": "Take off your helmet before the safe Scavenger kill, repeat.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 705
            }
        ],
        "order": 22
    },
    "regiment_23": {
        "id": "regiment_23",
        "name": "Taste of Life 2",
        "gameId": "task.wp.z18",
        "description": "The beer you found last time was good, but I've been craving again recently. I heard that [Wyeth Farmhouse] in the [suburb area] has a lot of good cellar-aged wine! I need you to mark 1 [large wine barrel] in the [basement] and then find me a bottle of [Wyeth's dry red wine] in the house. Finally, make sure to extract from [Farm Road] and [Northwest Windmill] to ensure that both routes can safely bring the wine back.",
        "objectives": [
            "Mark the Wine Barrel",
            "Find Wyeth's Dry Red Wine",
            "Turn in Wyeth's Dry Red Wine",
            "Successfully extract from Northwest Windmill",
            "Successfully extract from Farm Road"
        ],
        "corpId": "regiment",
        "type": [
            "submit",
            "retrieve",
            "mark",
            "extract"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 28000
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "ammo-545x39-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-ak74",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_545x39_30_black",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_tracking_device",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "regiment_21"
        ],
        "requiredLevel": 0,
        "tips": "White house in farm area on Suburbs. Mark one of the huge wine barrels in basement on the SW side. Dry wine bottle in kitchen sink on ground level. Both extracts are north of the white farmhouse.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "tw_SplvvQO8"
            },
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 749
            }
        ],
        "order": 23
    },
    "regiment_24": {
        "id": "regiment_24",
        "name": "Emergency Rations",
        "gameId": "task.wp.19",
        "description": "You know how some animals stash food for a rainy day?\nSmart, if you ask me. I'm picking up the habit myself.\nI need you to stash my favorite canned goods in these spots around the [Dam Area]:\n[On the table] inside the [wooden shack] next to the [eastern yellow water tower],\n[On the TV cabinet] in the [firewatch cabin],\n[On the table] inside the [small hut] beside the [Dam road sign].\nIf you lose the task item, please come back to me to repurchase it.",
        "objectives": [
            "Place Beef Can in the shack next to eastern water tower",
            "Place Beef Can on the Firewatcher's TV cabinet",
            "Place Beef Can in the small hut beside the Dam road sign"
        ],
        "corpId": "regiment",
        "type": [
            "place"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 40
            },
            {
                "type": "item",
                "item_id": "ammo-762x51-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-g3sg1-ak4",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x51_20_3",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_placement_igor_foodcan",
                "quantity": 3
            }
        ],
        "requiredTasks": [
            "regiment_22"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "CaU7t19ysxY"
            },
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 786
            }
        ],
        "order": 24
    },
    "regiment_25": {
        "id": "regiment_25",
        "name": "What a Vacation's Meant to Be",
        "gameId": "task.wp.z19",
        "description": "Ah, my legs aren't what they used to be. Can't go soak in the sun and sea breeze like I once did...\nBut you still can, so don't waste it!\nHeard the [Resort Area] has a coastal sightseeing [tram].\nGo [take some photos] along the coastal route— Make sure I get a good view, will ya?",
        "objectives": [
            "Take photo of the tram A (Seaglass St)",
            "Take photo of the tram B (Seaglass St)",
            "Take photo of the tram C (Seaglass St)"
        ],
        "corpId": "regiment",
        "type": [
            "photo"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "mag_545x39_60",
                "quantity": 2
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_photophone",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "regiment_24"
        ],
        "requiredLevel": 0,
        "tips": "The tram train cars are located on the road by hotel, two in front of hotel and one located on the road west toward construction.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "xMd_KozHG30"
            }
        ],
        "order": 25
    },
    "regiment_26": {
        "id": "regiment_26",
        "name": "G3 Assembly",
        "gameId": "task.wp.20",
        "description": "Some guns? Just… not right. Not until you add the right touch.\nYou know, a fine weapon and a skilled shooter don't need to spray bullets like a firehose.\nI've sent a [G3 assault rifle AK4], [Rail BT3], [10-round G3 magazine], and [ACOG] to your kiosk.\nPut it together, give it a try. Let's see how it feels in your hands.",
        "objectives": [
            "Eliminate 12 targets with specific assembled G3 rifle"
        ],
        "corpId": "regiment",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 40
            },
            {
                "type": "item",
                "item_id": "mag_762x39_30_2",
                "quantity": 2
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "weapon-g3sg1-ak4",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x51_10_2",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "scope_acog",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "rail_default__g3_railattachment_topbt3",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "regiment_24"
        ],
        "requiredLevel": 0,
        "tips": "G3 AK4, install BT3 rail (scope rail), ACOG sight, 10-round mag; you can add to the build but these items need to be install to complete task. ",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 819
            }
        ],
        "order": 26
    },
    "regiment_27": {
        "id": "regiment_27",
        "name": "My Favourite: Mosin",
        "gameId": "task.wp.21",
        "description": "Ahh, the Mosin... My old flame.\nThis classic rifle has a soul—every scratch tells a story from the battlefield. When I run my hands across it, I swear I hear echoes of war.\nThink you can match my glory days?\nGrab a [Mosin], find a good spot, sit still… and then—BANG!\nLet that beautiful rifle whisper a deadly lullaby.",
        "objectives": [
            "Eliminate 8 targets with mosin series"
        ],
        "corpId": "regiment",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 40
            },
            {
                "type": "item",
                "item_id": "scope_mosinpu",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "ammo-762x54r-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-mosin-91-30",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_26"
        ],
        "requiredLevel": 0,
        "tips": "Try to roleplay WW2 Soviet partisan for better accuracy. Only [Mosin 91-30](https://www.exfil-zone-assistant.app/items/weapon-mosin-91-30) can have a [scope](https://www.exfil-zone-assistant.app/items/scope_mosinpu).",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 894
            }
        ],
        "order": 27
    },
    "regiment_28": {
        "id": "regiment_28",
        "name": "Movie Night 2",
        "gameId": "task.wp.22",
        "description": "I've watched that shark movie like… five times. Still a thrill!\nBut now I'm hungry for more.\nHead to the [Metro Area] and see if you can dig up any new flicks—\npreferably a [subway-themed] horror film.\nMaybe I'll host a movie night for the crew… Get moving!",
        "objectives": [
            "Find [Subway Scream]",
            "Find [Subway Scream 2]",
            "Turn in both CDs"
        ],
        "corpId": "regiment",
        "type": [
            "retrieve",
            "submit"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 40
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "item",
                "item_id": "ammo-545x39-apv1",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-aks74u-zt",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_545x39_30_2",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "regiment_27"
        ],
        "requiredLevel": 0,
        "tips": "Both CDs can be found in kitchen.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "tVcmvySg7Xc"
            },
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 992
            }
        ],
        "order": 28
    },
    "regiment_29": {
        "id": "regiment_29",
        "name": "Dress the Part",
        "gameId": "task.wp.z22",
        "description": "You know, sometimes I think the cops had a cool look—\nstrutting around in armor, acting like they owned the place.\nWhy don't you give it a shot?\nThrow on a [Police PACA Body Armor] and a [Black Beret Hat].\nThen go serve some 'justice' to the bad guys out there. You'll look sharp and get the job done.",
        "objectives": [
            "Eliminate 16 targets in \"Police Outfit\""
        ],
        "corpId": "regiment",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 31000
            },
            {
                "type": "experience",
                "quantity": 3311
            },
            {
                "type": "item",
                "item_name": "Mag&attachament box",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_27"
        ],
        "requiredLevel": 0,
        "tips": "Dress with [Police PACA Body Armor](https://www.exfil-zone-assistant.app/items/armor-police-vest) and [Black Beret](https://www.exfil-zone-assistant.app/items/helmet-beanie-black) and kill 16 targets.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 1014
            }
        ],
        "order": 29
    },
    "regiment_30": {
        "id": "regiment_30",
        "name": "Forever in a Flash",
        "gameId": "task.wp.z23",
        "description": "You know what statues and photos have in common? They both freeze a moment in time. There's something beautifully poetic about that…\r\nGo take pictures of some of the island's statues for me, will you?\r\n[The Brown Bear statue in Hyder Town],\r\n[The Bull statue in the Resort's flea market],\r\n[The Angel statue next to Clifton Church],\r\n[The Hound statue in the Subway Station].",
        "objectives": [
            "Take a photo of the bear at Suburbs",
            "Take a photo of the bull at Resort",
            "Take a photo of the angel at Dam",
            "Take a photo of the hound at Metro"
        ],
        "corpId": "regiment",
        "type": [
            "photo"
        ],
        "map": [
            "suburb",
            "resort",
            "dam",
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 28000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "mag_762x51_50",
                "quantity": 2
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "regiment_29"
        ],
        "requiredLevel": 0,
        "tips": "Dam angel located outside church in clifton. Bear located in Hyder town on suburb. Bull located in flea market on resort. Hound on metro top of stairs by east extract",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "JIacdtZ1GGE"
            },
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 1094
            }
        ],
        "order": 30
    },
    "regiment_31": {
        "id": "regiment_31",
        "name": "My Favourite: Sjogren",
        "gameId": "task.wp.23",
        "description": "Last but not least—my beloved Sjogren.\nShe's been my savior in more than one deadly mess.\nWith that boomstick in hand, hesitation simply isn't an option.\nNow it's your turn to feel its power.\nTake the [Sjogren] into the [Metro Area], and teach those scavengers a lesson.\nLet each shot ring out like thunder—let them know fear.",
        "objectives": [
            "Eliminate 12 targets with Sjogren shotgun in Metro"
        ],
        "corpId": "regiment",
        "type": [
            "eliminate"
        ],
        "map": [
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 40
            },
            {
                "type": "item",
                "item_id": "ammo-12ga-buckshot-ap",
                "quantity": 45
            },
            {
                "type": "item",
                "item_id": "weapon-flame12",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_12GA_10",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "regiment_29"
        ],
        "requiredLevel": 0,
        "tips": "[Sjogren](https://www.exfil-zone-assistant.app/items/weapon-sjogren-inertia)",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 1125
            }
        ],
        "order": 31
    },
    "regiment_32": {
        "id": "regiment_32",
        "name": "One-time Delivery",
        "gameId": "task.wp.24",
        "description": "I need you to collect [3 supplycase] from three locations:\n[the Control Room],\n[the Tank Room],\n[the East Room in the Sewer Area].\nThen drop them off by the [wooden crate] just outside [the Sewer Hidden Room].\nNo detours, just in and out—one smooth run.",
        "objectives": [
            "Find Igor's 3 supplycase",
            "Place next to the Sewer Hidden Room"
        ],
        "corpId": "regiment",
        "type": [
            "retrieve",
            "place"
        ],
        "map": [
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 42000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 80
            },
            {
                "type": "item",
                "item_id": "ammo-545x39-tracer",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-malyuk-545",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_545x39_30_2",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "regiment_31"
        ],
        "requiredLevel": 0,
        "tips": "[Igor's Supply Case](https://www.exfil-zone-assistant.app/items/taskitem_placement_igor_supplycase). One located on shelf in control room; One located on barrels in large gate room. pull lever in control room to open gate; One located in the east room of sewer area, place task item west of sewer room, two extracts, climb ladder, cross pipe, place on box outside door; items are heavy and might take two trips up ladder",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "qfRvA2MBmGI"
            },
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 1167
            }
        ],
        "order": 32
    },
    "regiment_33": {
        "id": "regiment_33",
        "name": "Into the Lion's Den",
        "gameId": "task.wp.25",
        "description": "Aha! Time to test your nerve, kid.\nHead into the [Metro area], mid-level area.\nThere's a military living zone there—deep inside, right across from the Reception Room and Conference Room, is Commander Boris's quarters.\nNow me and Boris… we go way back. I know the kind of junk he calls treasure—and it's worth the risk.\nYou'll need to figure out a way in and snatch his prized piece: the [Malyuk762].\nBring it back, and I'll know you've got real guts.",
        "objectives": [
            "Find the Officer Back Room",
            "Turn in Malyuk 7.62"
        ],
        "corpId": "regiment",
        "type": [
            "reach",
            "submit"
        ],
        "map": [
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 40
            },
            {
                "type": "item",
                "item_id": "ammo-762x39-apv2",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-malyuk-762",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x39_30_2",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "regiment_32"
        ],
        "requiredLevel": 0,
        "tips": "Room located on one of the bottom level north side near extract; officer back room is locked(key not required); [Malyuk 762](https://www.exfil-zone-assistant.app/items/weapon-malyuk-762) can be bought and handed in",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "zgM6Ab7cfmI"
            },
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 1241
            }
        ],
        "order": 33
    },
    "regiment_34": {
        "id": "regiment_34",
        "name": "War Within Self",
        "gameId": "task.wp.26",
        "description": "Soldier, stand tall and listen. The most fearsome enemies often lurk right beside you, and it could even be your own inner self. Your final challenge is to overcome your fears, hesitation, weakness, and self-doubt.\nForge your will... This time, I'm not joking. All the tasks I've given you before were meant to help you build a strong mindset.\n[No matter what method you use or what weapon you choose, face a large number of enemies and challenge yourself to conquer your own limitations] (you can take down other contractors).",
        "objectives": [
            "Eliminate 33 Contractors or Scavengers"
        ],
        "corpId": "regiment",
        "type": [
            "eliminate"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 35000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 40
            },
            {
                "type": "item",
                "item_id": "ammo-762x39-apv2",
                "quantity": 30
            },
            {
                "type": "item",
                "item_id": "weapon-akmn-xm",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x39_30_2",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_33"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 1272
            }
        ],
        "order": 34
    },
    "regiment_35": {
        "id": "regiment_35",
        "name": "Intermission",
        "gameId": "task.wp.27",
        "description": "You did awesome, haha! I knew you could pull it off. You're starting to look a lot like I used to!\n...\nCome on, don't just stand there. In times like this, shouldn't we spark one up? No worries, I've got some special stuff stashed away. Just go grab something to light it with! And don't forget the fuel!",
        "objectives": [
            "Turn in 1 Lighter",
            "Turn in 1 Lighter Fluid"
        ],
        "corpId": "regiment",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 42000
            },
            {
                "type": "experience",
                "quantity": 25672
            },
            {
                "type": "reputation",
                "corpId": "regiment",
                "quantity": 80
            },
            {
                "type": "item",
                "item_id": "ammo-762x54r-apv1",
                "quantity": 60
            },
            {
                "type": "item",
                "item_id": "weapon-pkp-pecheneg",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "mag_762x54R_80",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "regiment_34"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "YEPtvxMzsBY",
                "startTs": 1302
            }
        ],
        "order": 35
    },
    "forge_1": {
        "id": "forge_1",
        "name": "Secret Stash 1",
        "gameId": "task.gear.1",
        "description": "Hey, newbie. Name's Maximilian.\nMy trade guild deals in only the finest goods—no fluff, no nonsense.\nYou wanna do business with me? Prove you're worth the trouble.\nMy old client's looking for a particular piece of merchandise I've stashed away.\nYou know that [outdoor drive-in theater] south of the motel in the [Suburb area]?\nYeah, looks abandoned, but trust me, I hid something special there.\nCheck [behind the screen]. You'll know it when you see it—it's not something you'll miss.",
        "objectives": [
            "Reach the Outdoor drive-in Cinema",
            "Find Maximillian's Golden Goblet",
            "Turn in Maximillian's Golden Goblet"
        ],
        "corpId": "forge",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 20
            },
            {
                "type": "item",
                "item_id": "armor-soft-armor",
                "quantity": 1
            },
            {
                "type": "item",
                "item_name": "Mag Pouch M",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [],
        "requiredLevel": 0,
        "tips": "Outdoor Cinema located behind motel, upstairs left on box",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "3mhlLR8_jp0"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM"
            }
        ],
        "order": 1
    },
    "forge_2": {
        "id": "forge_2",
        "name": "Better safe than sorry 1",
        "gameId": "task.gear.2",
        "description": "The scavengers have been too rampant lately! They've been loitering around our delivery routes.\nIt looks like I should use the alternative routes for delivery. I need you to check these locations northeast of [suburb area], as they are important stops along my route: the [checkpoint] on the road, the [unloading station], and [2 yellow-ish huts north to the unloading station].",
        "objectives": [
            "Find the Checkpoint",
            "Find the Truck Unloading station",
            "Find the The 2 yellow-ish huts"
        ],
        "corpId": "forge",
        "type": [
            "reach"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 20
            },
            {
                "type": "experience",
                "quantity": 1807
            },
            {
                "type": "item",
                "item_id": "helmet-bike",
                "quantity": 1
            },
            {
                "type": "item",
                "item_name": "Mag Pouch M",
                "quantity": 1
            },
            {
                "type": "item",
                "item_name": "Mag Pouch S",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_1"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "zk9lVdCpsTg"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 68
            }
        ],
        "order": 2
    },
    "forge_3": {
        "id": "forge_3",
        "name": "Covert Evacuation",
        "gameId": "task.gear.3",
        "description": "You've done well, but it's not enough yet to establish a long-term partnership with me. \nGo find [the bunker near the drainage channel] on the [west side of the TRUPIK mall]. See if it's safe then [return to me]. By the way, this is the key to that bunker gate, you can try your best to unlock it and extract from there. We can discuss business afterward.",
        "objectives": [
            "Find basement exit",
            "Successfully extract from suburb"
        ],
        "corpId": "forge",
        "type": [
            "reach",
            "extract"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 20
            },
            {
                "type": "experience",
                "quantity": 1807
            },
            {
                "type": "item",
                "item_id": "helmet-beanie-black",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "armor-police-vest",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_westbunker",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "forge_2"
        ],
        "requiredLevel": 0,
        "tips": "Look at M.I.C.A, LOCKED extract icon near the Canal.You don't have to extract from there or open it.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "ONQLQQK3qRI"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 109
            }
        ],
        "order": 3
    },
    "forge_4": {
        "id": "forge_4",
        "name": "All pieces together 1",
        "gameId": "task.gear.z3",
        "description": "Hey, my partner! Do you have a moment to run an errand for me? Don't worry; it's nothing hard—completely safe with a high reward. It's simple, I just need you to collect some [notebooks] while you're out exploring.\nNo, I'm not out of paper. Let me tell you, business opportunities often hide in the words and details. These notebooks occasionally hold interesting notes from others, which are all part of preparing to meet the needs of various clients.",
        "objectives": [
            "Turn in 6 notebooks"
        ],
        "corpId": "forge",
        "type": [
            "submit"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "experience",
                "quantity": 1807
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 20
            },
            {
                "type": "item",
                "item_id": "armor-raid-explorer-black",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_2"
        ],
        "requiredLevel": 0,
        "tips": "[Notebook](https://www.exfil-zone-assistant.app/items/misc_notebook)",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "3yUDq4fJZ-s"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 141
            }
        ],
        "order": 4
    },
    "forge_5": {
        "id": "forge_5",
        "name": "No Caller Rejected",
        "gameId": "task.gear.4",
        "description": "Heard about that recent heist in the Resort? Everyone's scrambling to find ways to launder the loot, and there's no way I'm sitting that out.\r\nTake this [phone] and place it at the [Wall Fountain in the Rua Algasol].\r\nSomeone will reach out to me—no names, no questions.\r\nIf you lose the task item, please come back to me to repurchase it.",
        "objectives": [
            "Place Max's Phone in the wall fountain"
        ],
        "corpId": "forge",
        "type": [
            "place"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 15000
            },
            {
                "type": "experience",
                "quantity": 2178
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 20
            },
            {
                "type": "item",
                "item_id": "helmet-parachute-training-black",
                "quantity": 1
            },
            {
                "type": "item",
                "item_name": "Mag Pouch M",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_placement_max_oldphone",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "forge_3",
            "forge_4"
        ],
        "requiredLevel": 0,
        "tips": "Small fountain on wall in Rua Algasol.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "8un2o6BUoH8"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 154
            }
        ],
        "order": 5
    },
    "forge_6": {
        "id": "forge_6",
        "name": "Hovolt Smuggling",
        "gameId": "task.gear.5",
        "description": "Ever heard of Hovolt cars? Gorgeous machines—sleek design, purr like a dream.\nThere's a dealership in the [Resort area] still intact. I want a few rides from there… eventually.\nBut first, do me a favor: [snap a picture of every color variant] they've got in the showroom.\nI need to confirm the stock.",
        "objectives": [
            "Take photo of a black Hovolt car",
            "Take photo of a yellow Hovolt car",
            "Take photo of a blue Hovolt car",
            "Take photo of a red Hovolt car"
        ],
        "corpId": "forge",
        "type": [
            "photo"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 20
            },
            {
                "type": "item",
                "item_id": "helmet-6b47",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_photophone",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "forge_5"
        ],
        "requiredLevel": 0,
        "tips": "Car dealership located east side by tunnel extract. All required cars are nearby.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "XVqVAHhgKFI"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 190
            }
        ],
        "order": 6
    },
    "forge_7": {
        "id": "forge_7",
        "name": "Bargain Hunter",
        "gameId": "task.gear.6",
        "description": "Word is the northern gang's got their eyes on that mythical gem—'Blue Heart of the Sea'.\nSeems like everything else is beneath them now. Fools.\nYou head to the [Flea Market] and see what's been overlooked.\nThey might've missed some [antiques], and I'm more than happy to take those off their hands.",
        "objectives": [
            "Find Antique Tea Plate - Yang",
            "Find Antique Tea Plate - Yin",
            "Turn in both Antique Tea Plates"
        ],
        "corpId": "forge",
        "type": [
            "retrieve",
            "submit"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 20
            },
            {
                "type": "experience",
                "quantity": 2178
            },
            {
                "type": "item",
                "item_id": "helmet-pasgt",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_6"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "Rsc3sPUjoXI"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 214
            }
        ],
        "order": 7
    },
    "forge_8": {
        "id": "forge_8",
        "name": "Hidden in Plain Sight",
        "gameId": "task.gear.7",
        "description": "Looks like most of the Hyder PD are busy playing watchdogs in the [Resort area], huh?\r\nOne of  them came to me on the low—wanted to fence off something he hacked from their system.\r\nProblem is, I need some [cash] to finish the deal.\r\nFind my stashed money at these two places:\r\nThe [trash truck] west to the [modern apartment],\r\nThe [bench] north of the [worker dormitory].\r\nThen drop the cash at the [fountain across from Halif Voyage Agency]. Clean and simple.",
        "objectives": [
            "Find 2 of Max's money",
            "place money next to fountain in front of Halif Voyage"
        ],
        "corpId": "forge",
        "type": [
            "retrieve",
            "place"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 20
            },
            {
                "type": "experience",
                "quantity": 2178
            },
            {
                "type": "item",
                "item_id": "helmet-kiver-m",
                "quantity": 1
            },
            {
                "type": "item",
                "item_name": "Mag Pouch M",
                "quantity": 2
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_6"
        ],
        "requiredLevel": 0,
        "tips": "[Max's Cash](https://www.exfil-zone-assistant.app/items/taskitem_placement_max_cash)",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "nGyTYeMvmTE"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 241
            }
        ],
        "order": 8
    },
    "forge_9": {
        "id": "forge_9",
        "name": "All pieces together 2",
        "gameId": "task.gear.8",
        "description": "You're just in time; I've collected enough from the notebooks. Now, let's turn our attention to the next target: [old phones]. You heard me right! Although they might look like a pile of junk to you, they can actually hold a lot of potential value—namely, information.\nIn business, it's all about the information gap; having more intel means more opportunities for you. Besides, the profit from trading information can be greater than you think!",
        "objectives": [
            "Turn in 5 Old Phone"
        ],
        "corpId": "forge",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 20
            },
            {
                "type": "experience",
                "quantity": 2178
            },
            {
                "type": "item",
                "item_id": "helmet-swat",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_7"
        ],
        "requiredLevel": 0,
        "tips": "[Old Phone](https://www.exfil-zone-assistant.app/items/misc_b_oldphone)",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 276
            }
        ],
        "order": 9
    },
    "forge_10": {
        "id": "forge_10",
        "name": "Freight Runner",
        "gameId": "task.gear.9",
        "description": "My courier got himself killed mid-run. Unfortunate… and inconvenient.\nThis shipment's hot, and I need someone reliable. That's you.\nPick up the goods from the [Grocery store] under the [modern apartment],\nThen drop the packages at:\n[East Overpass],\n[West Overpass],\n[Hospital's overpass].",
        "objectives": [
            "Find Max's diamond rings",
            "Place in the East overpass",
            "Place in the West overpass",
            "Place in the Hospital overpass"
        ],
        "corpId": "forge",
        "type": [
            "retrieve",
            "place"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 20
            },
            {
                "type": "experience",
                "quantity": 5518
            },
            {
                "type": "item",
                "item_name": "AN/PVS 31 Night Vision",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_8"
        ],
        "requiredLevel": 0,
        "tips": "[Max's Diamond ring](https://www.exfil-zone-assistant.app/items/taskitem_placement_max_ring)",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 286
            }
        ],
        "order": 10
    },
    "forge_11": {
        "id": "forge_11",
        "name": "Seeing is Believing ",
        "gameId": "task.gear.15",
        "description": "I've heard some whispers that there are plenty of good supplies near the tower inlet by the dam, but it's a dangerous area, and not many people have gone there. It's likely that those supplies have been left over from before the incident.\nI'm not one to take wild guesses, so we should confirm the source of any intel. If the rumors are true, I'll send my guys over to clean those places out. So, how about you scout it out for me, buddy? Use a tracker to [mark all the tower inlets][around the dam].",
        "objectives": [
            "Mark Inlet Tower 1 at Dam",
            "Mark Inlet Tower 2 at Dam",
            "Mark Inlet Tower 3 at Dam",
            "Mark Inlet Tower 4 at Dam"
        ],
        "corpId": "forge",
        "type": [
            "mark"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 50
            },
            {
                "type": "experience",
                "quantity": 12718
            },
            {
                "type": "item",
                "item_id": "helmet-warrior",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_tracking_device",
                "quantity": 4
            }
        ],
        "requiredTasks": [
            "forge_9"
        ],
        "requiredLevel": 0,
        "tips": "Located at top of dam.Mark all 4 concrete Towers with the tracker.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "XJ_WamWoIds"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 595
            }
        ],
        "order": 11
    },
    "forge_12": {
        "id": "forge_12",
        "name": "No Deal, No Mercy",
        "gameId": "task.gear.10",
        "description": "Remember that delivery payment I mentioned?\nThat damn cop is called [Barricade]. He never intended to hand the goods over. He thought he could play me. Big mistake.\nHead over to the [Silverwave Union Bank] and find him, in the [heaviest armor]. Give him a little… message.\nNobody crosses Maximilian and gets away with it.",
        "objectives": [
            "Eliminate Bank's Barricade"
        ],
        "corpId": "forge",
        "type": [
            "eliminate"
        ],
        "map": [
            "resort"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 20
            },
            {
                "type": "experience",
                "quantity": 5518
            },
            {
                "type": "item",
                "item_name": "water bottle pouch",
                "quantity": 3
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_10"
        ],
        "requiredLevel": 0,
        "tips": "SWAT boss located at the Bank main entrance.(Not Bonecrusher in yellow helmet)",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 353
            }
        ],
        "order": 12
    },
    "forge_13": {
        "id": "forge_13",
        "name": "All pieces together 3",
        "gameId": "task.gear.z10",
        "description": "Alright, we've gathered enough old phones, so I won't waste time with the usual lectures. I've noticed that some residents on this island still use cassette tapes—pretty 'retro,' right?\nBy coincidence, I found a cassette player all the way in the back of the storage room, and it turns out it still works! So now, your task is to find some [tapes] for me. I'd like to hear what interesting information is on them.",
        "objectives": [
            "Turn in 6 Tapes"
        ],
        "corpId": "forge",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "experience",
                "quantity": 5518
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 10
            },
            {
                "type": "item",
                "item_name": "grenade pouch",
                "quantity": 3
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_10"
        ],
        "requiredLevel": 0,
        "tips": "[Tape](https://www.exfil-zone-assistant.app/items/misc_b_tape)",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 378
            }
        ],
        "order": 13
    },
    "forge_14": {
        "id": "forge_14",
        "name": "All pieces together 4",
        "gameId": "task.gear.z11",
        "description": "There are so many old things here! Did you find any valuable 'antiques' while you were exploring?\nListen, I recently had a client reach out to me asking for used [cameras]. He says it's a new trend of photography among youngsters.\nIf that's the case, I can't let this opportunity slip by! Can you help me track down a few [cameras]? Who knows, I might be able to cash in on this trend.",
        "objectives": [
            "Turn in 3 Cameras"
        ],
        "corpId": "forge",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "experience",
                "quantity": 5518
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 10
            },
            {
                "type": "item",
                "item_name": "Mag double pouch",
                "quantity": 4
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_13"
        ],
        "requiredLevel": 0,
        "tips": "[Camera](https://www.exfil-zone-assistant.app/items/misc_camera)",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 391
            }
        ],
        "order": 14
    },
    "forge_15": {
        "id": "forge_15",
        "name": "Purge the Ranks",
        "gameId": "task.gear.11",
        "description": "You're back just in time! There's actually another matter that needs your attention. I hear you're quite good at handling this sort of thing.\nI have a disobedient underling who stole a few of my [gold ingots]. I can't tolerate someone taking what's mine; it's a betrayal. My other men have already cornered him in the [room by the stairs] [on TRUPIK -1F], and all you need to do is simple: do whatever it takes to \"\"retrieve\"\" what's mine.",
        "objectives": [
            "Find Maximilian's Golden Ingots",
            "Turn in Golden Ingots"
        ],
        "corpId": "forge",
        "type": [
            "retrieve",
            "submit"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "ark",
                "quantity": 20
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "item",
                "item_id": "mask-ach-faceshield",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_14"
        ],
        "requiredLevel": 0,
        "tips": "Located in the center of the Mall on -1F, in the room below escalator stairs.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "KoE9YIrOaGI"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 406
            }
        ],
        "order": 15
    },
    "forge_16": {
        "id": "forge_16",
        "name": "Better safe than sorry 2",
        "gameId": "task.gear.12",
        "description": "One of the top things in running a business is to always stay alert.\nI have a few hideouts in the [Suburb area] for temporary storage and transfer. I need to ensure they're in good shape. Go take a look around them: [the water tower north of Altibuy], [the green tent north of the TRUPIK mall], and [the small shack] just [north of the mall after crossing the overpass]. Check everything before you make an extraction back.",
        "objectives": [
            "Find water tower near Altibuy",
            "Find green tent in TRUPIKS plaza",
            "Find cabin up north",
            "Successfully extract from Suburb"
        ],
        "corpId": "forge",
        "type": [
            "reach",
            "extract"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 30
            },
            {
                "type": "experience",
                "quantity": 6403
            },
            {
                "type": "item",
                "item_id": "armor-duo-mountains",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [],
        "requiredLevel": 0,
        "tips": "water tower (more of a tank than a tower) 50M north of altibuy in the backyard of the 3 story house, green tent located in front of mall northeast corner by overpass, cabin located north of mall just past overpass before tunnel",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "rrL25q04zaE"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 427
            }
        ],
        "order": 16
    },
    "forge_17": {
        "id": "forge_17",
        "name": "Don't Play with Fire",
        "gameId": "task.gear.13",
        "description": "You know I always hide my goods perfectly, but a few of the hiding spots do face the risk of accidental damage.\nI need you to go check on them and leave that new tracker you got there, so I can ensure the safety of my goods in real time. The location is in the [farm], [north part]. There are several [barns]. They're the tall, cylindrical structures. [marking 3 spots] will be enough. Also, for safety, bring back the [flammable items] you can find.",
        "objectives": [
            "Mark the 4 North Barns",
            "Turn in 4 combustible items"
        ],
        "corpId": "forge",
        "type": [
            "mark",
            "submit"
        ],
        "map": [
            "suburb"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 20000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 30
            },
            {
                "type": "experience",
                "quantity": 643
            },
            {
                "type": "item",
                "item_id": "armor-raid-explorer-sd",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_16"
        ],
        "requiredLevel": 0,
        "tips": "These are *not* barns, they are tall silos.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "Yq6b9D90zyY"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 467
            }
        ],
        "order": 17
    },
    "forge_18": {
        "id": "forge_18",
        "name": "Secret Stash 2",
        "gameId": "task.gear.14",
        "description": "Have you ever been to the [Dam Area]? I've still got some merchandise stashed near there, and a new client just came knocking.\r\nThey want something flashy—solid gold kind of flashy.\r\nGood thing I've got just the piece:\r\nHead to my [hideout up the hill southeast of the Dam], near an old barber shop and look for a [golden globe].\r\nPlace it on the [wooden crate] hidden in the dark inside a [blue shipping container] on the [west side of the dam's base].",
        "objectives": [
            "Find the Smuggling Hideout Next to Barber Shop",
            "Find the Smuggling Hideout Next to Barber Shop",
            "Find the Bunker in the Dam area",
            "Find Maximilian's Golden globe",
            "Place in the dim blue shipping container"
        ],
        "corpId": "forge",
        "type": [
            "reach",
            "retrieve",
            "place"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 32000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 40
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "item",
                "item_id": "armor-6b17",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_17"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "_lT5d6SMhp4"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 527
            }
        ],
        "order": 18
    },
    "forge_19": {
        "id": "forge_19",
        "name": "Cold Hard Cash 1",
        "gameId": "task.gear.16",
        "description": "Thanks to you, I've been getting a lot more clients lately. But some of these rich folks are getting pretty extravagant. They always want stuff like gold, gems, and all that.\nWith so many new requests, I'm not really stocked up. How about trying your luck and helping me find [a gold ingot]? Don't worry, one bar will last me a while!",
        "objectives": [
            "Turn in 1 Gold Ingot"
        ],
        "corpId": "forge",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 32000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 50
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "item",
                "item_id": "misc_graphiccard",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_11"
        ],
        "requiredLevel": 0,
        "tips": "[Gold Ingot](https://www.exfil-zone-assistant.app/items/misc_goldingot)]",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 624
            }
        ],
        "order": 21
    },
    "forge_22": {
        "id": "forge_22",
        "name": "Cold Hard Cash 2",
        "gameId": "task.gear.17",
        "description": "Today, I went to check the warehouse and found out that the gold ingots you brought back are fake! The real ones have been swapped out! I don't know where my real gold ingots are right now, but that traitor left a contact message. The clue mentioned that this guy is disguising himself as a forklift driver. \nGo to the [dam area] and mark the [four forklifts] at the [dock] and the [factory]; I need some clues.",
        "objectives": [
            "Mark First Forklift at The Dock",
            "Mark Second Forklift at The Dock",
            "Mark First Forklift at The Factory",
            "Mark Second Forklift at The Factory"
        ],
        "corpId": "forge",
        "type": [
            "mark"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 32000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 50
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "item",
                "item_id": "helmet-delta",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "taskitem_tracking_device",
                "quantity": 4
            }
        ],
        "requiredTasks": [
            "forge_11",
            "forge_18"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "VuvURKV4MWk"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 657
            }
        ],
        "order": 22
    },
    "forge_23": {
        "id": "forge_23",
        "name": "HandHeld Hero",
        "gameId": "task.gear.z17",
        "description": "Heh, never thought I'd see someone holding onto one of those old-school consoles.\nTakes me back—back when I ruled the neighborhood, all because I had the best game system around.\nAnyway, I want that feeling back.\nGo get me a working [game console] and [4 different game cartridges].\nMake it worth my nostalgia, yeah?",
        "objectives": [
            "Turn in Game console",
            "Turn in 'Showdown' Cart",
            "Turn in 'Contractors' Cart",
            "Turn in 'GrimLord' Cart",
            "Turn in 'Exfilzone' Cart"
        ],
        "corpId": "forge",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 32000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 10
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "item",
                "item_id": "helmet-ach-green",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_22"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 643
            }
        ],
        "order": 23
    },
    "forge_24": {
        "id": "forge_24",
        "name": "Better safe than sorry 3",
        "gameId": "task.gear.19",
        "description": "The [Dam area] in the north of the island has always been a key route for my cargo transport because it's close to the docks, with plenty of spots for transfers and hiding. But with that convenience and variety of routes, this prime location also attracts pesky flies.\nSo, I'm counting on you, my most trusted partner, to check out these places like you did before: the [control room beneath the dam], the [southwest tower inlet] of the dam, and the [firewatcher's cabin] on the [west side of the dam]. Just make sure everything is in order and extract from [Southwest Road].",
        "objectives": [
            "Find the West inlet tower",
            "Find the Firewatcher's tower",
            "Find the Dam's Power Room",
            "Successfully extract from Southwest Road"
        ],
        "corpId": "forge",
        "type": [
            "reach"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 32000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 50
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "item",
                "item_id": "armor-jpc",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_18"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "okHHthr__LY"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 754
            }
        ],
        "order": 24
    },
    "forge_25": {
        "id": "forge_25",
        "name": "Cold Hard Cash 3",
        "gameId": "task.gear.18",
        "description": "If I had known he would go to such lengths for a few golds, I should have made a few holes in him. Anyway, hurry up and check the location in the intel to find my stuff.\nThe real gold bars are hidden at the [docks]... ‘Where the golden light meets the dawn's first glow, high above the sea.' That's the riddle he left behind. Keep an eye out for [the highest place], and quickly get back my [gold ingots].",
        "objectives": [
            "Find Maximilian's Golden Ingots",
            "Find the Top Crane",
            "Turn in Maximilian's Golden Ingots"
        ],
        "corpId": "forge",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 32000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 50
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "item",
                "item_id": "mask-ryst-faceshield",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_18"
        ],
        "requiredLevel": 0,
        "tips": "Climb to the top of the crane. Acrophobia is a thing.",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "OC9DuhsBReg"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 699
            }
        ],
        "order": 25
    },
    "forge_26": {
        "id": "forge_26",
        "name": "Business Development",
        "gameId": "task.gear.21",
        "description": "That hacker has a pretty quirky personality; he can lock himself away for days. So while we wait for him, I think you can go and try to make some extractions from various extraction points.\nI know this may sound like it's outside our usual scope of work, but don't worry—this is all part of preparing for what's to come. Make a safe escape from each of these locations: [Outdoor cinema in the Suburb area], [the Bunker in the Dam area], [the big Gate on the 3F (top level) in Metro area].",
        "objectives": [
            "Successfully extract from Outdoor Cinema",
            "Successfully extract from Central Bunker",
            "Successfully extract from North Metro Exit"
        ],
        "corpId": "forge",
        "type": [
            "extract"
        ],
        "map": [
            "suburb",
            "dam",
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 32000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 50
            },
            {
                "type": "item",
                "item_id": "helmet-op-highprotection",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "forge_24"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "FUrur2cpdUA"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 802
            }
        ],
        "order": 26
    },
    "forge_27": {
        "id": "forge_27",
        "name": "Hack to Play",
        "gameId": "task.gear.20",
        "description": "Thanks for checking places for me. While I was sorting through the stuff, I found something special: a super encrypted hard drive. Or in other words, a big business opportunity! \nHowever the encryption is way too tough for my team to handle. I'll have to turn to an old friend I haven't talked to in ages.\nHe's a big-time enthusiastic gamer. If you can get him something special, like a deluxe edition game disc, I think he'll be more willing to help me out.\nTry looking in the [Factory B Area] over in the [Dam area]. There's often leftover cargo there, and you might just find what I'm looking for.",
        "objectives": [
            "Reach Factory B zone",
            "Find Game Disk",
            "Turn in Game Disk"
        ],
        "corpId": "forge",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "dam"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 32000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 50
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "item",
                "item_id": "armor-rampage-od",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_22"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "p2W4kXJUtIA"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 859
            }
        ],
        "order": 27
    },
    "forge_28": {
        "id": "forge_28",
        "name": "Treasure Beyond Measure",
        "gameId": "task.gear.22",
        "description": "This hacker finished much quicker than I expected. \nThere isn't much data, mostly junk files. However, after his analysis, we uncovered something important: a strange start-up program, a string of passwords, and [a location].\nI'll focus on the program and passwords, while you check those [the control room], see if you can [find a special briefcase].",
        "objectives": [
            "Find Metro Control Room",
            "Find Missile Launcher Case",
            "Turn in Missile Launcher Case"
        ],
        "corpId": "forge",
        "type": [
            "reach",
            "retrieve",
            "submit"
        ],
        "map": [
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 32000
            },
            {
                "type": "experience",
                "quantity": 25672
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 50
            },
            {
                "type": "item",
                "item_id": "helmet-rys-t",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "forge_27"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "yEf6vs-lZDg"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 887
            }
        ],
        "order": 28
    },
    "forge_29": {
        "id": "forge_29",
        "name": "Perfect Collaboration",
        "gameId": "task.gear.23",
        "description": "You're back! So, guess what was that box you bring? First off, the earlier program was a missile-launching program. And this box isn't just any computer; you need to connect the hard drive's program and enter that password to get it running.\nWith this, I might just retire from dealing with cargo, haha. You're the most efficient and trustworthy partner I've worked with. Here's a key to the [locked room] in [Metro area]. Everything in there is yours to take—grab as much as you want. It's my way of showing appreciation for you as my top business partner.",
        "objectives": [
            "Find the sewer area back room"
        ],
        "corpId": "forge",
        "type": [
            "reach"
        ],
        "map": [
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 36000
            },
            {
                "type": "experience",
                "quantity": 25672
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 50
            },
            {
                "type": "item",
                "item_id": "armor-imtv",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            },
            {
                "type": "item",
                "item_id": "key_f3_factoryroom",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "forge_28"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "Gl_3o8UfEyI"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 913
            }
        ],
        "order": 29
    },
    "forge_30": {
        "id": "forge_30",
        "name": "Virtual Realities",
        "gameId": "task.gear.z21",
        "description": "Hey, I've heard there are [3 VR headset prototypes] on this island! I need you to help me find them, as they are special collectibles for some people.\u000bHowever, my information is limited. I only know that the [1st one] is at the [Wyeth Farmhouse] in the [suburb area]; the [other two] are lost in the [dam] and [metro] areas, respectively. I hope you can take some time to keep an eye out for them!",
        "objectives": [
            "Find the VR Headset in Wyeth Farmhouse",
            "Find the VR Headset in Dam area",
            "Find the VR Headset in Metro area",
            "Turn in 3 VR headsets"
        ],
        "corpId": "forge",
        "type": [
            "retrieve",
            "submit"
        ],
        "map": [
            "suburb",
            "dam",
            "metro"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 32000
            },
            {
                "type": "experience",
                "quantity": 15403
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "backpack_hypertec",
                "quantity": 1
            }
        ],
        "preReward": [
            {
                "type": "item",
                "item_id": "key_metro_entry_ticket",
                "quantity": 1
            }
        ],
        "requiredTasks": [
            "forge_27"
        ],
        "requiredLevel": 0,
        "tips": "",
        "videoGuides": [
            {
                "author": "orbb",
                "ytId": "OCRTBDedB3Q"
            },
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 944
            }
        ],
        "order": 30
    },
    "forge_31": {
        "id": "forge_31",
        "name": "The Collector",
        "gameId": "task.gear.z18",
        "description": "That client is back again. He said the trend has shifted, and now people are collecting figurines.\nI mean, those things don't serve much purpose beyond being decorative, but I have to admit, collecting can be pretty enjoyable. Watching my warehouse fill up gives me an indescribable sense of satisfaction.\nSo, I need you to find me a [complete set of character figurines]. Don't forget to grab the [rare one] too; I've heard it's a [gold-painted] version, and they say it's worth even more.",
        "objectives": [
            "Hand in 7 figurines"
        ],
        "corpId": "forge",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 32000
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 10
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "item",
                "item_id": "armor-apex-bk",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_23"
        ],
        "requiredLevel": 0,
        "tips": "Reward not worth it. Exchange gold figurine for Endgame equipment in official discord.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 1016
            }
        ],
        "order": 31
    },
    "forge_32": {
        "id": "forge_32",
        "name": "\"Collectors Edition\"",
        "gameId": "task.gear.z19",
        "description": "I really want to show you my collection, but I'm just a few items short of perfection. I can't stand seeing those empty spots; they would leave a lingering regret.\nMaybe you can help me complete this last piece of the puzzle: I need [a complete set of the Contractors game discs]. Just so you know, the entire series includes [4 versions]: [the regular editions] of Contractors and Showdown, and [the deluxe editions] of each.",
        "objectives": [
            "Turn in Contractors Game Disc",
            "Turn in ShowDown Game Disc",
            "Turn in Contractors Game Disc Collector's Edition",
            "Turn in ShowDown Game Disc Collector's Edition"
        ],
        "corpId": "forge",
        "type": [
            "submit"
        ],
        "map": [
            "any"
        ],
        "reward": [
            {
                "type": "money",
                "quantity": 32000
            },
            {
                "type": "experience",
                "quantity": 12719
            },
            {
                "type": "reputation",
                "corpId": "forge",
                "quantity": 10
            },
            {
                "type": "item",
                "item_id": "helmet-rsp",
                "quantity": 1
            }
        ],
        "preReward": [],
        "requiredTasks": [
            "forge_23"
        ],
        "requiredLevel": 0,
        "tips": "Not worth a hassle.",
        "videoGuides": [
            {
                "author": "radFoxVR",
                "ytId": "BO5uihtPyLM",
                "startTs": 1028
            }
        ],
        "order": 32
    }
} as const;

// Helper functions for tasks
export const getTaskById = (id: string): Task | undefined => {
    return tasksData[id.toString()];
};

export const getTasksByMerchant = (corpId: string): Task[] => {
    return Object.values(tasksData).filter(task => task.corpId === corpId);
};

export const getAllMerchants = (): string[] => {
    return [...Object.keys(corps)];
};

export const getTasksByMap = (map: TaskMap): Task[] => {
    return Object.values(tasksData).filter(task => task.map.includes(map));
};

export const getRequiredTasks = (taskId: string): Task[] => {
    const task = getTaskById(taskId);
    if (!task) return [];

    return task.requiredTasks
        .map(id => getTaskById(id))
        .filter((task): task is Task => task !== undefined);
};

export const getTasksRequiring = (taskId: string): Task[] => {
    return Object.values(tasksData).filter(task =>
        task.requiredTasks.includes(taskId)
    );
};