import fs from 'fs';

const content = fs.readFileSync('frontend/src/data/mockPosts.ts', 'utf-8');

// Extract the array using simple regex text matching
const items = [];
const blocks = content.split('{');
for (const block of blocks) {
    const sIdMatch = block.match(/sourceId:\s*['"]([^'"]+)['"]/);
    const typeMatch = block.match(/contentType:\s*['"]([^'"]+)['"]/);
    if (sIdMatch && typeMatch) {
        items.push({ sourceId: sIdMatch[1], type: typeMatch[1] });
    }
}

const uniqueByTypes = { short: new Set(), article: new Set(), video: new Set() };
for (const item of items) {
    if (uniqueByTypes[item.type]) {
        uniqueByTypes[item.type].add(item.sourceId);
    }
}

console.log('--- UNIQUE MOCK ITEMS BY TYPE ---');
console.log('Articles:', uniqueByTypes.article.size);
console.log('Shorts:', uniqueByTypes.short.size);
console.log('Videos:', uniqueByTypes.video.size);
