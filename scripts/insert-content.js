// insert-content.js — inserts generated entries and summaries into actual source files
const fs = require("fs");

// ── 1. Insert entries into mockPosts.ts ──
let mockPosts = fs.readFileSync("frontend/src/data/mockPosts.ts", "utf8");
const newEntries = fs.readFileSync("scripts/new-entries.txt", "utf8");

// Insert new shorts after s20 (before the VIDEOS section)
const videosSection = "  // ═══════════════════════════════════════════\n  // VIDEOS — longer form, 5+ min, horizontal\n  // ═══════════════════════════════════════════";
const shortsEntries = newEntries.split("// ── NEW YOUTUBE VIDEOS")[0].replace("// ── NEW YOUTUBE SHORTS s21-s200 ──\n", "");
mockPosts = mockPosts.replace(videosSection, shortsEntries + "\n" + videosSection);

// Insert new videos after v20 (before the ARTICLES section)
const articlesSection = "  // ═══════════════════════════════════════════\n  // ARTICLES — RSS feed items with snippets\n  // ═══════════════════════════════════════════";
const videoPart = newEntries.split("// ── NEW YOUTUBE VIDEOS v21-v200 ──\n")[1].split("// ── NEW ARTICLES")[0];
mockPosts = mockPosts.replace(articlesSection, videoPart + "\n" + articlesSection);

// Insert new articles after a70 (before the closing ];)
const closingBracket = "\n];\n";
const articlePart = newEntries.split("// ── NEW ARTICLES a71-a200 ──\n")[1];
// Remove trailing comma and add before ];
mockPosts = mockPosts.replace(/\n\];\s*$/, "\n" + articlePart + "\n];\n");

fs.writeFileSync("frontend/src/data/mockPosts.ts", mockPosts);

// Verify counts
const tCount = (mockPosts.match(/id: "t\d+"/g) || []).length;
const sCount = (mockPosts.match(/id: "s\d+"/g) || []).length;
const vCount = (mockPosts.match(/id: "v\d+"/g) || []).length;
const aCount = (mockPosts.match(/id: "a\d+"/g) || []).length;
console.log(`mockPosts.ts updated:`);
console.log(`  TikTok:   ${tCount}`);
console.log(`  Shorts:   ${sCount}`);
console.log(`  Videos:   ${vCount}`);
console.log(`  Articles: ${aCount}`);
console.log(`  Total:    ${tCount + sCount + vCount + aCount}`);

// ── 2. Insert summaries into FeedCard.tsx ──
let feedCard = fs.readFileSync("frontend/src/components/FeedCard.tsx", "utf8");
const newSummaries = fs.readFileSync("scripts/new-summaries.txt", "utf8");

// Find the closing }; of mockSummaries object
// The pattern is: the last entry before }; at start of line
const summaryBlockEnd = feedCard.indexOf("\n};\n");
if (summaryBlockEnd === -1) {
  console.error("Could not find end of mockSummaries block!");
  process.exit(1);
}

// Clean up the summaries - remove section headers and format
const cleanSummaries = newSummaries
  .replace(/\/\/ ── NEW SHORTS SUMMARIES s21-s200 ──\n/g, "")
  .replace(/\/\/ ── NEW VIDEO SUMMARIES v21-v200 ──\n/g, "")
  .replace(/\/\/ ── NEW ARTICLE SUMMARIES a71-a200 ──\n/g, "")
  .replace(/,\s*$/g, ","); // ensure trailing comma

// Insert before the closing };
const insertPoint = summaryBlockEnd;
feedCard = feedCard.slice(0, insertPoint) + ",\n" + cleanSummaries.trim() + feedCard.slice(insertPoint);

// Fix any double commas
feedCard = feedCard.replace(/,\s*,/g, ",");

fs.writeFileSync("frontend/src/components/FeedCard.tsx", feedCard);

// Verify summary count
const summaryKeys = feedCard.match(/^\s+[stav]\d+:\s*\[/gm) || [];
console.log(`\nFeedCard.tsx updated:`);
console.log(`  Total summaries: ${summaryKeys.length}`);
console.log(`Done!`);
