// Script to generate new TikTok entries for mockPosts.ts
// Reads tiktok.json, filters duplicates + non-tech content, outputs TypeScript

const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'backend', 'tiktok', 'tiktok.json');
// The file may contain multiple concatenated JSON arrays like ][
// Fix by replacing ][ with , to merge them
let raw = fs.readFileSync(jsonPath, 'utf8');
raw = raw.replace(/\]\s*\[/g, ',');
const data = JSON.parse(raw);

// Existing sourceIds in mockPosts.ts (t1-t50)
const existingIds = new Set([
  '7601259555414199583','7606485571971616018','7570706166112832771',
  '7607191003451231518','7583244356329508127','7597158493740600588',
  '7599544618786639124','7603966178448444685','7468689861646601504',
  '7524143198856285471','7493986507460447518','7602117516990762270',
  '7377025768611745067','7592705394775002389','7594243485574728981',
  '7595620495656062216','7561810851607383309','7538853725532736790',
  '7543372840897219854','7329950049482427690','7370834175621942533',
  '7607519379923815702','7607606640962964750','7607465394873388301',
  '7607545219881438496','7607233399119416590','7600070672496299294',
  '7606485571971616018','7595809313826802975','7596077737752743181',
  '7221245575654608170','7582639500111777038','7603632377755208977',
  '7600538199873604894','7601643853875121429','7602814032084536590',
  '7603199261777382663','7603527521409322253','7603832480457706774',
  '7604502818199817486','7606043116553997581','7606803754481913118',
  '7607145170139663630','7607518954784853262','7607642962725440782',
  '7607699220824329503','7607735342090784013','7488433859810364694',
  '7508115970372799787','7527766778735381791',
  // Also the prestonrho typo
  '7207208556999331086','7607208556999331086',
]);

// Keywords for filtering out non-tech memorial/tribute posts
const skipPatterns = [
  /\brip\b/i, /\bpassed\b/i, /\bmemorial\b/i, /\bprayer?\b/i,
  /pray for/i, /miss u\b/i, /goin to miss/i, /gone too soon/i,
  /rest in peace/i, /fly high/i,
];

// Non-tech video IDs to skip (memorials using #LLM, old gaming/meme videos)
const skipIds = new Set([
  '7607368170055191839', // memorial
  '7606963210779987214', // memorial
  '7606921175263874334', // memorial
  '7606900379682393357', // memorial
  '7606451079366135054', // memorial
  '7606439749791862038', // memorial
  '7604735181743787277', // memorial
  '7601999393214024974', // memorial
  '7597943556904471838', // memorial
  '7606500094014885133', // memorial (if exists)
  '7607500094014885133', // memorial
  // Old non-AI viral content (2022)
  '7070667045683285294', // Lenovo ThinkPad ad
  '7070353644348296494', // cybersec girl (not AI)
  '7068338460058209582', // Nintendo Switch secrets
  '7067478229786823982', // keyboard calculator ASMR
  '7067267814272339202', // building gaming PC
  '7066029571774270767', // underwater phone test
  '7063854479321599278', // metronome framerates
  '7063563900171799855', // PlayStation repair
  '7062881641383021871', // gaming PC guess
  '7062123487703436590', // rich as a kid
  '7536737381932649783', // mass awakening (conspiracy)
]);

// Extract video ID from webVideoUrl
function getVideoId(url) {
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

// Clean up title text
function cleanTitle(text) {
  return text
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[""]/g, '"')
    .trim()
    .slice(0, 120); // truncate long titles
}

// Generate tags from text
function generateTags(text) {
  const tagMap = {
    'AI': /\bai\b|artificial intelligence|machine learning|deep learning/i,
    'Coding': /\bcoding\b|programming|software|developer|code\b/i,
    'Tech Stack': /tech stack/i,
    'Startup': /startup|saas|entrepreneur|founder|buildinpublic/i,
    'AI Tools': /ai tool|chatgpt|gemini|claude|cursor|copilot/i,
    'AI Agents': /ai agent|agentic|openclaw|automation/i,
    'Vibe Coding': /vibe cod/i,
    'Career': /career|job|hire|interview|salary|engineer/i,
    'Python': /python/i,
    'React': /react/i,
    'Web Dev': /web dev|frontend|fullstack|full.stack|next\.?js/i,
    'Mobile Dev': /mobile|react native|expo|ios|android/i,
    'GPT-5': /gpt.?5/i,
    'Claude': /claude|anthropic|opus/i,
    'OpenAI': /openai|chatgpt/i,
    'Google': /google|gemini/i,
    'ML': /machine learning|\bml\b|neural|clustering|random forest/i,
    'Tutorial': /tutorial|learn|beginner|guide|roadmap|how to/i,
    'News': /news|breaking|just dropped|announced/i,
  };
  const tags = [];
  for (const [tag, re] of Object.entries(tagMap)) {
    if (re.test(text) && tags.length < 3) tags.push(tag);
  }
  if (tags.length === 0) tags.push('Tech');
  return tags;
}

// Deduplicate by videoId
const seenIds = new Set();
const newEntries = [];

for (const item of data) {
  const videoId = getVideoId(item.webVideoUrl);
  if (!videoId) continue;
  if (existingIds.has(videoId)) continue;
  if (seenIds.has(videoId)) continue;
  if (skipIds.has(videoId)) continue;

  const text = item.text || '';
  if (skipPatterns.some(p => p.test(text))) continue;
  if (text.length < 5) continue; // skip empty

  seenIds.add(videoId);
  newEntries.push({
    videoId,
    author: item['authorMeta.name'],
    text: cleanTitle(text),
    created: item.createTimeISO,
    plays: item.playCount,
    duration: item['videoMeta.duration'],
    tags: generateTags(text),
  });
}

// Sort by plays descending (most popular first)
newEntries.sort((a, b) => b.plays - a.plays);

console.log(`Total new entries: ${newEntries.length}`);

// Generate TypeScript
let startIdx = 51;
let ts = '';
for (let i = 0; i < newEntries.length; i++) {
  const e = newEntries[i];
  const id = `t${startIdx + i}`;
  const title = e.text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const tags = e.tags.map(t => `"${t}"`).join(', ');
  ts += `  {
    id: "${id}",
    source: "tiktok",
    contentType: "short",
    sourceId: "${e.videoId}",
    embedUrl: "https://www.tiktok.com/player/v1/${e.videoId}",
    title: "${title}",
    createdAt: "${e.created}",
    tags: [${tags}],
  },\n`;
}

// Write output
const outPath = path.join(__dirname, 'tiktok-entries.txt');
fs.writeFileSync(outPath, ts, 'utf8');
console.log(`Written to ${outPath}`);

// Also generate summary stubs
let summaries = '';
for (let i = 0; i < newEntries.length; i++) {
  const e = newEntries[i];
  const id = `t${startIdx + i}`;
  // Generate contextual summaries from the title
  summaries += `  ${id}: [\n`;
  summaries += `    "${e.text.replace(/"/g, '\\"').slice(0, 80)}.",\n`;
  summaries += `    "By @${e.author} — ${Math.round(e.plays / 1000)}K views.",\n`;
  summaries += `    "Duration: ${e.duration}s. ${e.tags.join(', ')}.",\n`;
  summaries += `  ],\n`;
}

const sumPath = path.join(__dirname, 'tiktok-summaries.txt');
fs.writeFileSync(sumPath, summaries, 'utf8');
console.log(`Summaries written to ${sumPath}`);
