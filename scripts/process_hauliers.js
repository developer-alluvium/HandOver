const fs = require('fs');
const path = require('path');

try {
    const jsonPath = 'client/haulier_codes_utf8.json';
    let jsonContent = fs.readFileSync(jsonPath, 'utf8');
    // Remove BOM if present
    if (jsonContent.charCodeAt(0) === 0xFEFF) {
        jsonContent = jsonContent.slice(1);
    }
    const data = JSON.parse(jsonContent.trim());

    const mapped = data.map(i => ({
        label: i.Name,
        value: i.Code
    }));

    const outputContent = `export const HAULIERS = ${JSON.stringify(mapped, null, 4)};`;

    fs.writeFileSync('server/controllers/haulier.js', outputContent);
} catch (error) {
    console.error('Error generating haulier list:', error);
    process.exit(1);
}
