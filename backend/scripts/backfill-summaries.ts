/**
 * Backfill Article SNIPPETS — the visible description paragraph below the title.
 *
 * This generates a 2-3 sentence description for articles that are missing
 * their snippet text. Uses Gemini → Groq Key #1 → Groq Key #2 fallback.
 *
 * Usage:  npx ts-node scripts/backfill-summaries.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ── AI Providers ──────────────────────────────────────────────
const geminiKey = process.env.GEMINI_API_KEY || '';
const groqKey1 = process.env.GROQ_API_KEYS || '';
const groqKey2 = process.env.GROQ_SECOND_API_KEYS || '';
const groqKey3 = process.env.GROQ_THIRD_API_KEYS || '';

let geminiModel: any = null;
if (geminiKey) {
    const genAI = new GoogleGenerativeAI(geminiKey);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

const groqKeys = [groqKey1, groqKey2, groqKey3].filter(Boolean);
let currentGroqIndex = 0;

console.log(`🔑 Loaded: Gemini=${geminiKey ? '✅' : '❌'}, Groq keys=${groqKeys.length}`);

// ── Groq helper ───────────────────────────────────────────────
async function callGroq(prompt: string): Promise<string> {
    for (let attempt = 0; attempt < groqKeys.length; attempt++) {
        const keyIndex = (currentGroqIndex + attempt) % groqKeys.length;
        const key = groqKeys[keyIndex];
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3,
                }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    console.log(`    🔄 Groq key #${keyIndex + 1} rate limited, trying next...`);
                    currentGroqIndex = (keyIndex + 1) % groqKeys.length;
                    continue;
                }
                throw new Error(`Groq HTTP ${response.status}`);
            }

            const data = await response.json();
            currentGroqIndex = keyIndex;
            return data.choices?.[0]?.message?.content?.trim() || '';
        } catch (err: any) {
            if (attempt === groqKeys.length - 1) throw err;
        }
    }
    throw new Error('All Groq keys exhausted');
}

// ── AI Call with fallback: Gemini → Groq ──────────────────────
async function generateAI(prompt: string): Promise<string> {
    if (geminiModel) {
        try {
            const result = await geminiModel.generateContent(prompt);
            return result.response.text().trim();
        } catch (err: any) {
            console.log(`    ⚠️ Gemini failed, falling back to Groq`);
        }
    }
    if (groqKeys.length > 0) {
        return callGroq(prompt);
    }
    throw new Error('No AI providers available');
}

// ── Generate a short snippet (2-3 sentences) ──────────────────
async function generateSnippet(title: string, caption: string, url?: string): Promise<string> {
    // Try to fetch the actual article content for a better summary
    let articleBody = '';
    if (url) {
        try {
            const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
            if (res.ok) {
                const html = await res.text();
                articleBody = html
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 6000);
            }
        } catch { }
    }

    const prompt = `You are a senior tech journalist writing a brief but substantive summary paragraph for a news article.
Read the title, context, and article content below, then write a compelling 3-5 sentence paragraph that:
- Explains WHAT the article is about in concrete terms
- Mentions specific technologies, companies, numbers, or technical details
- Reads like a real news article excerpt, not a generic description
- Uses professional journalistic tone

Title: "${title}"
Context: "${caption || ''}"
${articleBody ? `Article Content: "${articleBody.slice(0, 4000)}"` : ''}

Write ONLY the summary paragraph. No bullet points, no headers, no intro phrases like "This article discusses":`;

    return generateAI(prompt);
}

// ── Main Loop ─────────────────────────────────────────────────
async function main() {
    console.log('🔍 Fetching all posts from Supabase...');

    const { data: allPosts, error } = await supabase
        .from('posts')
        .select('id, title, snippet, caption, contentType, sourceId')
        .order('createdAt', { ascending: false })
        .limit(2000);

    if (error) {
        console.error('Failed to fetch posts:', error.message);
        return;
    }

    console.log(`Found ${allPosts.length} total posts.`);

    // Only target ARTICLES — shorts/videos/TikToks don't need text snippets
    const needsSnippet = allPosts.filter((p: any) => {
        if (p.contentType !== 'article') return false;
        if (!p.snippet || p.snippet.trim().length === 0) return true;
        if (p.snippet.startsWith('http://') || p.snippet.startsWith('https://')) return true;
        if (p.snippet.trim().length < 30) return true;
        return false;
    });

    console.log(`${needsSnippet.length} posts need snippet descriptions.\n`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < needsSnippet.length; i++) {
        const post = needsSnippet[i];
        const progress = `[${i + 1}/${needsSnippet.length}]`;

        try {
            // 4-second delay between requests to respect rate limits
            await new Promise((resolve) => setTimeout(resolve, 4000));

            console.log(`${progress} Generating snippet for: "${(post.title || '').slice(0, 60)}..."`);
            const snippet = await generateSnippet(post.title, post.caption || '', post.sourceId);

            if (snippet && snippet.length > 20) {
                const { error: updateError } = await supabase
                    .from('posts')
                    .update({ snippet })
                    .eq('id', post.id);

                if (updateError) {
                    console.log(`  ❌ DB error: ${updateError.message}`);
                    failed++;
                } else {
                    console.log(`  ✅ Saved: "${snippet.slice(0, 80)}..."`);
                    success++;
                }
            } else {
                console.log(`  ⚠️ Snippet too short, skipping`);
                failed++;
            }
        } catch (err: any) {
            console.error(`  ❌ Failed: ${err.message}`);
            failed++;

            if (err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('rate')) {
                console.log('  ⏳ Rate limited — waiting 60 seconds...');
                await new Promise((resolve) => setTimeout(resolve, 60000));
            }
        }
    }

    console.log(`\n🎉 Backfill complete!`);
    console.log(`   ✅ Success: ${success}`);
    console.log(`   ❌ Failed:  ${failed}`);
    console.log(`   📊 Total:   ${needsSnippet.length}`);
}

main().catch(console.error);
