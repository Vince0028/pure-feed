import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkFame() {
    const { data, error } = await supabase.from('posts').select('title, "fameScore", summary').eq('contentType', 'article');
    if (error) return console.error("Error:", error);

    const scoreCounts = {};
    let emptySummaries = 0;

    for (const p of data) {
        scoreCounts[p.fameScore] = (scoreCounts[p.fameScore] || 0) + 1;
        if (!p.summary || p.summary.length === 0) emptySummaries++;
    }

    console.log(`TOTAL ARTICLES: ${data.length}`);
    console.log(`EMPTY SUMMARIES: ${emptySummaries}`);
    console.log(`SCORES: ${JSON.stringify(scoreCounts).slice(0, 1500)}`);
}
checkFame();
