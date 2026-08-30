const fs = require('fs');
const path = require('path');

// Base directory containing caliber folders
const baseDirectory = './'; // Adjust this path as needed

function extractFoodData() {
    const extractedFood = [];

    try {
        // Get all caliber folders
        const foodFoldes = fs.readdirSync(baseDirectory, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        console.log(`Found ${foodFoldes.length} food folders:`, foodFoldes);

        for (const food of foodFoldes) {
            const caliberPath = path.join(baseDirectory, food);

            // Get all JSON files in this caliber folder
            const jsonFiles = fs.readdirSync(caliberPath)
                .filter(file => file.endsWith('.json'));

            console.log(`Processing ${food} with ${jsonFiles.length} ammo types`);

            for (const jsonFile of jsonFiles) {
                const filePath = path.join(caliberPath, jsonFile);
                const fileName = path.basename(jsonFile, '.json');

                try {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    const data = JSON.parse(fileContent);

                    // Find the element with Type starting with the filename
                    const foodElement = data.find(item =>
                        item.Type && item.Type.startsWith(fileName)
                    );

                    if (foodElement && foodElement.Properties) {
                        const properties = foodElement.Properties;

                        // Extract and process the ammo data
                        const info = properties.Info || properties.Info_0
                        const iconObjectPath = info["Icon_11_BA1E5C224783410CB10781B70CE5A463"].ObjectPath
                        const displayName = info["DisplayName_2_E87F8CE0471A0D0F627BBA9F7E5EE752"]
                        const foodData = {
                            sourceFile: jsonFile,
                            type: foodElement.Type,
                            template: foodElement.Template.ObjectPath,
                            name: foodElement.Name,
                            displayName: displayName ? displayName.LocalizedString : null,
                            icon: iconObjectPath ? iconObjectPath.substring(iconObjectPath.lastIndexOf('/') + 1).split('.')[0] : null,
                            subcategory: food,

                            // Basic properties
                            weight: properties.Weight || null,
                            capacity: properties.Capacity || null,
                            threshold: properties.Threshold || null,
                            consumptionSpeed: properties.ConsumptionSpeed || null,
                            energyFactor: properties.EnergyFractor || null,
                            hydraFactor: properties.HydraFractor || null
                        };

                        extractedFood.push(foodData);
                        console.log(`✓ Extracted: ${fileName} (${food})`);

                    } else {
                        console.log(`⚠ No matching element found in ${jsonFile} for type starting with "${fileName}"`);
                    }

                } catch (error) {
                    console.error(`❌ Error processing ${jsonFile}:`, error.message);
                }
            }
        }

        // Save the extracted data
        const outputPath = './extracted_food_data.json';
        fs.writeFileSync(outputPath, JSON.stringify(extractedFood, null, 2));
        console.log(`\n🎯 Extraction complete! Found ${extractedFood.length} food types`);
        console.log(`📁 Data saved to: ${outputPath}`);

        // Print summary by caliber
        console.log('\n📊 Summary by food:');
        return extractedFood;

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        return [];
    }
}

// Run the extraction
if (require.main === module) {
    extractedFood = extractFoodData();
}

module.exports = { extractFoodData: extractFoodData };