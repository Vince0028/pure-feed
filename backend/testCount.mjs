import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function countTypes() {
    const { data, error } = await supabase.from('posts').select('contentType');
    if (error) return console.error(error);

    const shorts = data.filter(d => d.contentType === 'short').length;
    const articles = data.filter(d => d.contentType === 'article').length;
    const videos = data.filter(d => d.contentType === 'video').length;

    console.log(`Live DB Counts -> Total: ${data.length} | Shorts: ${shorts} | Articles: ${articles} | Videos: ${videos}`);
}
countTypes();
