const fs = require('fs');
const path = require('path');

// Read the extracted clip data
const extractedData = [
    {
        "sourceFile": "WF_walter_coke_thin.json",
        "type": "WF_walter_coke_thin_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/Beverages/WF_walter_coke_base.28",
        "name": "Default__WF_walter_coke_thin_C",
        "displayName": "Soda Drink L",
        "icon": "Icon_food_09",
        "subcategory": "Beverages",
        "weight": 0.4,
        "capacity": 36,
        "threshold": 3,
        "consumptionSpeed": 9,
        "energyFactor": 0.25,
        "hydraFactor": 1
    },
    {
        "sourceFile": "WF_walter_coke.json",
        "type": "WF_walter_coke_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/Beverages/WF_walter_coke_base.28",
        "name": "Default__WF_walter_coke_base_C",
        "displayName": "Soda Drink",
        "icon": "Icon_food_03",
        "subcategory": "Beverages",
        "weight": 0.33,
        "capacity": 24,
        "threshold": 4,
        "consumptionSpeed": 8,
        "energyFactor": 0.2,
        "hydraFactor": 1
    },
    {
        "sourceFile": "WF_food_BisCuits.json",
        "type": "WF_food_BisCuits_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/Biscuits/WF_food_base.29",
        "name": "Default__WF_food_base_C",
        "displayName": "Energy bar",
        "icon": "Icon_food_01",
        "subcategory": "Biscuits",
        "weight": 0.08,
        "capacity": 30,
        "threshold": 10,
        "consumptionSpeed": 2.5,
        "energyFactor": 1,
        "hydraFactor": 0.0
    },
    {
        "sourceFile": "WF_food_chocolate_bar.json",
        "type": "WF_food_chocolate_bar_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/Biscuits/WF_food_base.29",
        "name": "Default__WF_food_chocolate_bar_C",
        "displayName": "Chocolate",
        "icon": "Icon_food_10",
        "subcategory": "Biscuits",
        "weight": 0.12,
        "capacity": 42,
        "threshold": 14,
        "consumptionSpeed": 7,
        "energyFactor": 1,
        "hydraFactor": 0.0
    },
    {
        "sourceFile": "WF_food_meatbox.json",
        "type": "WF_food_meatbox_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/Biscuits/WF_food_base.29",
        "name": "Default__WF_food_meatbox_C",
        "displayName": "Meat can L",
        "icon": "Icon_food_11",
        "subcategory": "Biscuits",
        "weight": 0.35,
        "capacity": 60,
        "threshold": 20,
        "consumptionSpeed": 10,
        "energyFactor": 1,
        "hydraFactor": 0.0
    },
    {
        "sourceFile": "WF_food_meatcan.json",
        "type": "WF_food_meatcan_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/Biscuits/WF_food_base.29",
        "name": "Default__WF_food_meatcan_C",
        "displayName": "Meat can",
        "icon": "Icon_food_12",
        "subcategory": "Biscuits",
        "weight": 0.3,
        "capacity": 54,
        "threshold": 18,
        "consumptionSpeed": 9,
        "energyFactor": 1,
        "hydraFactor": 0.0
    },
    {
        "sourceFile": "WF_food_peacan.json",
        "type": "WF_food_peacan_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/Biscuits/WF_food_base.29",
        "name": "Default__WF_food_peacan_C",
        "displayName": "Pea can",
        "icon": "Icon_food_13",
        "subcategory": "Biscuits",
        "weight": 0.5,
        "capacity": 45,
        "threshold": 15,
        "consumptionSpeed": 7.5,
        "energyFactor": 1,
        "hydraFactor": 0.0
    },
    {
        "sourceFile": "WF_food_sausage.json",
        "type": "WF_food_sausage_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/Biscuits/WF_food_base.29",
        "name": "Default__WF_food_sausage_C",
        "displayName": "Sausage",
        "icon": "Icon_food_14",
        "subcategory": "Biscuits",
        "weight": 0.18,
        "capacity": 39,
        "threshold": 13,
        "consumptionSpeed": 6.5,
        "energyFactor": 1,
        "hydraFactor": 0.0
    },
    {
        "sourceFile": "WF_food_Snickers.json",
        "type": "WF_food_Snickers_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/Biscuits/WF_food_base.29",
        "name": "Default__WF_food_Snickers_C",
        "displayName": "MRE",
        "icon": "Icon_food_02",
        "subcategory": "Biscuits",
        "weight": 0.8,
        "capacity": 120,
        "threshold": 40,
        "consumptionSpeed": 10,
        "energyFactor": 1,
        "hydraFactor": 0.0
    },
    {
        "sourceFile": "WF_food2_base.json",
        "type": "WF_food2_base_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/BP_BaseSupplies.16",
        "name": "Default__WF_food2_base_C",
        "displayName": "Apple",
        "icon": "Icon_food_05",
        "subcategory": "RaspBerry",
        "weight": 0.2,
        "capacity": 10,
        "threshold": 5,
        "consumptionSpeed": 2.5,
        "energyFactor": 1,
        "hydraFactor": 1
    },
    {
        "sourceFile": "WF_food2_ginger.json",
        "type": "WF_food2_ginger_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/RaspBerry/WF_food2_base.24",
        "name": "Default__WF_food2_ginger_C",
        "displayName": "Ginger Bread",
        "icon": "Icon_FOOD_Gingerbread_02",
        "subcategory": "RaspBerry",
        "weight": 0.05,
        "capacity": 30,
        "threshold": 30,
        "consumptionSpeed": 20,
        "energyFactor": 1,
        "hydraFactor": 0.0
    },
    {
        "sourceFile": "WF_food_watle1_base.json",
        "type": "WF_food_watle1_base_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/BP_BaseSupplies.16",
        "name": "Default__WF_food_watle1_base_C",
        "displayName": "Water Bottle",
        "icon": "Icon_food_04",
        "subcategory": "Teapot",
        "weight": 0.9,
        "capacity": 200,
        "threshold": 10,
        "consumptionSpeed": 10,
        "energyFactor": 0,
        "hydraFactor": 1
    },
    {
        "sourceFile": "WF_food_watle1_bear.json",
        "type": "WF_food_watle1_bear_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/Teapot/WF_food_watle1_base.32",
        "name": "Default__WF_food_watle1_bear_C",
        "displayName": "Beer",
        "icon": "Icon_food_06",
        "subcategory": "Teapot",
        "weight": 0.6,
        "capacity": 50,
        "threshold": 2,
        "consumptionSpeed": 10,
        "energyFactor": 0.1,
        "hydraFactor": 1
    },
    {
        "sourceFile": "WF_food_watle1_coffee.json",
        "type": "WF_food_watle1_coffee_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/Teapot/WF_food_watle1_base.32",
        "name": "Default__WF_food_watle1_coffee_C",
        "displayName": "Coffee",
        "icon": "Icon_food_07",
        "subcategory": "Teapot",
        "weight": 0.35,
        "capacity": 40,
        "threshold": 2,
        "consumptionSpeed": 10,
        "energyFactor": 0,
        "hydraFactor": 1
    },
    {
        "sourceFile": "WF_food_watle1_nomal.json",
        "type": "WF_food_watle1_nomal_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/Teapot/WF_food_watle1_base.32",
        "name": "Default__WF_food_watle1_nomal_C",
        "displayName": "Mineral Water",
        "icon": "Icon_food_08",
        "subcategory": "Teapot",
        "weight": 0.5,
        "capacity": 60,
        "threshold": 2,
        "consumptionSpeed": 10,
        "energyFactor": 0,
        "hydraFactor": 1
    },
    {
        "sourceFile": "WF_food_watle1_orange.json",
        "type": "WF_food_watle1_orange_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/Teapot/WF_food_watle1_orange.3",
        "name": "Default__WF_food_watle1_xmasBottle_C",
        "displayName": "Water Bottle",
        "icon": "Icon_food_04",
        "subcategory": "Teapot",
        "weight": 0.85,
        "refillable": true,
        "capacity": 200,
        "threshold": 2,
        "consumptionSpeed": 10,
        "energyFactor": 0,
        "hydraFactor": 1
    },
    {
        "sourceFile": "WF_food_watle1_xmasBottle.json",
        "type": "WF_food_watle1_xmasBottle_C",
        "template": "Contractors_Showdown/Content/Blueprints/GameModes/Warfare/Supplies/Teapot/WF_food_watle1_orange.3",
        "name": "Default__WF_food_watle1_xmasBottle_C",
        "displayName": "Water Bottle",
        "icon": "Icon_Holiday_Bottle",
        "subcategory": "Teapot",
        "weight": 0.85,
        "refillable": true,
        "capacity": 220,
        "threshold": 4,
        "consumptionSpeed": 10,
        "energyFactor": 0,
        "hydraFactor": 1
    }
]
const outputDataName = 'food.json';

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
function generateFoodId(itemDataName) {
    return "food_"+ itemDataName.displayName.toLowerCase().replace(/\s+/g, '_');
}

function generateTemplateId(templateObjectPath) {
    return templateObjectPath && generateFoodId(templateObjectPath.substring(templateObjectPath.lastIndexOf('/') + 1).split('.')[0].replace("WF_",""));
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
        const id = generateFoodId(itemData);

        // --- Building the Formatted Item Object ---
        const item = {
            id,
            name: props.displayName,
            description: "",
            category: 'provisions',
            subcategory: ((props.subcategory === 'Biscuits') || (props.subcategory ==='RaspBerry' )) ? "Food" : "Drinks",

            images: {
                icon: `/images/items/misc/${props.icon}.webp`,
                thumbnail: `/images/items/misc/${props.icon}.webp`,
                fullsize: `/images/items/misc/${props.icon}.webp`
            },

            stats: {
                price: props.price || 0, // Default price if not specified
                weight: props.weight,
                rarity: 'Common', // Default rarity if not specified

            capacity: props.capacity,
            threshold: props.threshold,
            consumptionSpeed: props.consumptionSpeed,
            energyFactor: props.energyFactor,
            hydraFactor: props.hydraFactor
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