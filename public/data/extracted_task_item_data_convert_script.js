const fs = require('fs');
const path = require('path');

// Read the extracted clip data
const extractedData = [
    {
        "sourceFile": "Placement_Igor_MemoBeer.json",
        "folder": "Igor_beer",
        "type": "Placement_Igor_MemoBeer_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Task/Placement/WF_PlacementActorBase.9",
        "name": "Default__Placement_Igor_MemoBeer_C",
        "displayName": "Beer of Mourning",
        "icon": "valuable_task_igor_memobeer",
        "subcategory": "Igor_beer",
        "weight": 0.8,
        "price": 1000,
        "rarity": "Common"
    },
    {
        "sourceFile": "Placement_Igor_Foodcan.json",
        "folder": "Igor_foodCan",
        "type": "Placement_Igor_Foodcan_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Task/Placement/WF_PlacementActorBase.9",
        "name": "Default__Placement_Igor_Foodcan_C",
        "displayName": "Igor's Food can",
        "icon": "valuable_task_igor_can",
        "subcategory": "Igor_foodCan",
        "weight": 0.8,
        "price": 1000,
        "rarity": "Common"
    },
    {
        "sourceFile": "Placement_Igor_supplycase.json",
        "folder": "Igor_Supplycase",
        "type": "Placement_Igor_supplycase_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Task/Placement/WF_PlacementActorBase.9",
        "name": "Default__Placement_Igor_supplycase_C",
        "displayName": "Igor's Supply Case",
        "icon": "valuable_task_igor_box",
        "subcategory": "Igor_Supplycase",
        "weight": 17.5,
        "price": 1000,
        "rarity": "Common"
    },
    {
        "sourceFile": "Placement_Johnny_WalkieTalkie.json",
        "folder": "Johnny_walkietalkie",
        "type": "Placement_Johnny_WalkieTalkie_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Task/Placement/WF_PlacementActorBase.9",
        "name": "Default__Placement_Johnny_WalkieTalkie_C",
        "displayName": "Walkie-Talkie",
        "icon": "valuable_task_johnny_talkie",
        "subcategory": "Johnny_walkietalkie",
        "weight": null,
        "price": 1000,
        "rarity": "Common"
    },
    {
        "sourceFile": "Placement_Maggie_Medicine.json",
        "folder": "Maggie_Medicine",
        "type": "Placement_Maggie_Medicine_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Task/Placement/WF_PlacementActorBase.9",
        "name": "Default__Placement_Maggie_Medicine_C",
        "displayName": "Maggie's Medicine",
        "icon": "valuable_task_maggie_medical",
        "subcategory": "Maggie_Medicine",
        "weight": null,
        "price": 1000,
        "rarity": "Common"
    },
    {
        "sourceFile": "Placement_Maggie_poison.json",
        "folder": "Maggie_Poison",
        "type": "Placement_Maggie_poison_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Task/Placement/WF_PlacementActorBase.9",
        "name": "Default__Placement_Maggie_poison_C",
        "displayName": "Maggie's Poison",
        "icon": "valuable_task_maggie_toxin",
        "subcategory": "Maggie_Poison",
        "weight": null,
        "price": 1000,
        "rarity": "Common"
    },
    {
        "sourceFile": "Placement_Maggie_USB.json",
        "folder": "Maggie_USB",
        "type": "Placement_Maggie_USB_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Task/Placement/WF_PlacementActorBase.9",
        "name": "Default__Placement_Maggie_USB_C",
        "displayName": "Maggie's USB",
        "icon": "valuable_task_maggie_usb",
        "subcategory": "Maggie_USB",
        "weight": 0.08,
        "price": 1000,
        "rarity": "Common"
    },
    {
        "sourceFile": "Placement_Max_Cash.json",
        "folder": "Max_Cash",
        "type": "Placement_Max_Cash_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Task/Placement/WF_PlacementActorBase.9",
        "name": "Default__Placement_Max_Cash_C",
        "displayName": "Max's Cash",
        "icon": "valuable_task_max_money",
        "subcategory": "Max_Cash",
        "weight": 0.18,
        "price": 1000,
        "rarity": "Common"
    },
    {
        "sourceFile": "Placement_Max_Oldphone.json",
        "folder": "Max_Oldphone",
        "type": "Placement_Max_Oldphone_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Task/Placement/WF_PlacementActorBase.9",
        "name": "Default__Placement_Max_Oldphone_C",
        "displayName": "Max‘s Phone",
        "icon": "valuable_task_max_phone",
        "subcategory": "Max_Oldphone",
        "weight": 0.16,
        "price": 1000,
        "rarity": "Common"
    },
    {
        "sourceFile": "Placement_Max_ring.json",
        "folder": "Max_Ring",
        "type": "Placement_Max_ring_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Task/Placement/WF_PlacementActorBase.9",
        "name": "Default__Placement_Max_ring_C",
        "displayName": "Max's Diamond ring",
        "icon": "valuable_task_max_diamondring",
        "subcategory": "Max_Ring",
        "weight": null,
        "price": 1000,
        "rarity": "Common"
    },
    {
        "sourceFile": "Placement_SignalEnhancer.json",
        "folder": "Radio_Antenna",
        "type": "Placement_SignalEnhancer_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Task/Placement/WF_PlacementActorBase.9",
        "name": "Default__Placement_SignalEnhancer_C",
        "displayName": "Signal Enhancer",
        "icon": "valuable_task_maggie_line",
        "subcategory": "Radio_Antenna",
        "weight": 0.24,
        "price": 1000,
        "rarity": "Common"
    },
    {
        "sourceFile": "Placement_Tommy_SurveillanceCam.json",
        "folder": "Tommy_Surveillance",
        "type": "Placement_Tommy_SurveillanceCam_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Task/Placement/WF_PlacementActorBase.9",
        "name": "Default__Placement_Tommy_SurveillanceCam_C",
        "displayName": "Tommy's Surveillance Cam",
        "icon": "valuable_task_tommy_camera",
        "subcategory": "Tommy_Surveillance",
        "weight": 0.8,
        "price": 1000,
        "rarity": "Common"
    },
    {
        "sourceFile": "Placement_Tommy_Telescope.json",
        "folder": "Tommy_Telescope",
        "type": "Placement_Tommy_Telescope_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Task/Placement/WF_PlacementActorBase.9",
        "name": "Default__Placement_Tommy_Telescope_C",
        "displayName": "ARK's Telescope",
        "icon": "valuable_task_ark_telescope",
        "subcategory": "Tommy_Telescope",
        "weight": 1,
        "price": 1000,
        "rarity": "Common"
    }
];
const outputDataName = 'converted-task-items.json';

const rarityMap = {
    "EWarfare_Quality::NewEnumerator0": "Common",
    "EWarfare_Quality::NewEnumerator1": "Uncommon",
    "EWarfare_Quality::NewEnumerator2": "Rare",
    "EWarfare_Quality::NewEnumerator3": "Epic",
    "EWarfare_Quality::NewEnumerator4": "Legendary",
    "EWarfare_Quality::NewEnumerator5": "Ultimate",
}

// Placeholder for grip-specific information like tips or descriptions
// This can be expanded to include detailed data not directly present in the raw JSON.
const miscInfo = {};

const miscMap={}


// Function to generate a unique ID for each magazine
function generateTaskItemId(itemDataName) {
    return "taskitem_"+ itemDataName.type.replace(/^TaskItem_|_C$/g, '').toLowerCase();
}

function generateTemplateId(templateObjectPath) {
    return templateObjectPath && generateTaskItemId(templateObjectPath.substring(templateObjectPath.lastIndexOf('/') + 1).split('.')[0].replace("WF_",""));
}

function validateItemAttributes(item, attributes) {
    let isValid = true;

    for (const attributePath of attributes) {
        let current = item;
        const pathParts = attributePath.split('.');
        let attributeFound = true;

        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            if (current === null || typeof current !== 'object' || !(part in current)) {
                console.log(`Missing attribute for item ID: ${item.id || 'N/A'}, missing path: ${attributePath}`);
                attributeFound = false;
                isValid = false;
                break;
            }
            current = current[part];
        }

        if (attributeFound && current === undefined) {
            console.log(`Undefined attribute for item ID: ${item.id || 'N/A'}, attribute: ${attributePath}`);
            isValid = false;
        }
    }

    return isValid;
}
const requiredAttributes = [
    // Base Item attributes (common to all items)
    'id',
    'name',
    'description',
    'category',
    'subcategory',
    'images.icon',
    'images.thumbnail',
    'images.fullsize',
    'stats.rarity',
    'stats.price',
    'stats.weight',
    'stats.taskIds',
];

/**
 * Converts raw grip item data into a structured format suitable for the application.
 * It also handles template inheritance, where missing properties can be filled from a base template item.
 *
 * @param {Array<Object>} itemDataList - An array of raw grip item data objects.
 * @returns {Array<Object>} An array of formatted grip item objects.
 */
function convertToTacticalsFormat(itemDataList) {
    const items = [];

    itemDataList.forEach(itemData => {
        const props = itemData

        // --- Extracting Core Item Properties ---


        // Generate a unique ID for the grip.
        const id = generateTaskItemId(itemData);


        // --- Building the Formatted Item Object ---
        const item = {
            id,
            name: props.displayName,
            description: "",
            category: 'task-items',
            subcategory: "Tommy",

            images: {
                icon: `/images/items/task/${props.icon}.webp`,
                thumbnail: `/images/items/task/${props.icon}.webp`,
                fullsize: `/images/items/task/${props.icon}.webp`
            },

            stats: {
                price: props.price || 1000, // Default price if not specified
                weight: props.weight,
                rarity: 'Common', // Default rarity if not specified

            taskIds: [],
            },

            tips: miscInfo[id]?.tips || '', // Add tips from miscInfo if available
        };

        miscMap[id]=item;
        if(item.subcategory) {
            items.push(item);
        } else {
            console.log("missing subcategory",item.id)
        }

    });

    items.forEach(item => {
        // if (!item.template || !miscMap[item.template]) return;
        // const template = miscMap[item.template];
        // Object.keys(template.stats).forEach(key => {
        //     if (key === "attachmentModifier") {
        //         Object.keys(template.stats.attachmentModifier).forEach(key => {
        //             if (item.stats.attachmentModifier[key] === undefined) {
        //                 item.stats.attachmentModifier[key] = template.stats.attachmentModifier[key];
        //                 console.log(`Inherited attachmentModifier.${key} from ${template.id} to ${item.id}`,  );
        //             }
        //         })
        //     } else {
        //         if (item.stats[key] === undefined) {
        //             item.stats[key] = template.stats[key];
        //             console.log(`Inherited ${key} from ${template.id} to ${item.id}`,  );
        //         }
        //     }
        //
        // })
        validateItemAttributes(item, requiredAttributes);
    })

    return items;
}


// Main conversion process
try {
    console.log('🔄 Starting food  data conversion...');

    // Convert the data
    const itemsData = convertToTacticalsFormat(extractedData);


    // Write the converted data to a new file
    const outputPath = path.join(__dirname, outputDataName);
    fs.writeFileSync(outputPath, JSON.stringify(itemsData, null, 2));

    console.log(`✅ Successfully converted ${itemsData.length} foods`);
    console.log(`📁 Output saved to: ${outputPath}`);

    // Print some statistics
    // const caliberGroups = {};
    // const uniqueWeaponNames = new Set();
    // itemsData.forEach(mag => {
    //     const caliber = mag.stats.caliber;
    //     caliberGroups[caliber] = (caliberGroups[caliber] || 0) + 1;
    //     mag.stats.compatibleWeapons.forEach(w => uniqueWeaponNames.add(w))
    // });

    // console.log('\n📊 Magazine Statistics:');
    // console.log('By Caliber:');
    // Object.entries(caliberGroups).forEach(([caliber, count]) => {
    //     console.log(`  - ${caliber}: ${count} magazines`);
    // });
    ;

} catch (error) {
    console.error('❌ Error converting magazine data:', error);
    process.exit(1);
}