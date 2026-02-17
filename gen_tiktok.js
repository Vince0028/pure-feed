const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend', 'tiktok', 'tiktok.json'), 'utf-8'));

// Sort by playCount descending
data.sort((a, b) => b.playCount - a.playCount);

function vid(url) { return url.split('/').pop(); }

function cleanTitle(text) {
  let t = text.split('\n')[0].replace(/#\S+/g, '').replace(/@\S+/g, '').trim();
  if (t.length > 80) t = t.substring(0, 77) + '...';
  if (t.length < 5) t = text.split('\n').find(l => l.trim().length > 5)?.replace(/#\S+/g, '').trim() || 'AI and tech deep dive';
  return t;
}

function getTags(text) {
  const t = [];
  if (/agent/i.test(text)) t.push('AI Agents');
  if (/tech.?stack/i.test(text)) t.push('Tech Stack');
  if (/openclaw/i.test(text)) t.push('OpenClaw');
  if (/moltbook/i.test(text)) t.push('Moltbook');
  if (/cod(?:e|ing)|programm/i.test(text)) t.push('Coding');
  if (/saas|startup|founder/i.test(text)) t.push('SaaS');
  if (/openai/i.test(text)) t.push('OpenAI');
  if (/crypto/i.test(text)) t.push('Crypto');
  if (/mobile|app\b/i.test(text)) t.push('Mobile Dev');
  if (/voice\s*ai|cold\s*call/i.test(text)) t.push('Voice AI');
  if (/sales/i.test(text)) t.push('Sales');
  if (/vibe\s*cod/i.test(text)) t.push('Vibe Coding');
  if (/robot/i.test(text)) t.push('Robotics');
  if (/health|fitness/i.test(text)) t.push('Health AI');
  if (t.length === 0) t.push('Tech');
  return t.slice(0, 2);
}

// Print sorted list
console.log(`Total: ${data.length} TikTok videos\n`);
data.forEach((item, i) => {
  const v = vid(item.webVideoUrl);
  const title = cleanTitle(item.text);
  const tags = getTags(item.text);
  console.log(`t${i+1}: ${item.playCount.toLocaleString()} plays | @${item['authorMeta.name']} | ${title} | ${JSON.stringify(tags)}`);
});
