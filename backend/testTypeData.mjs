import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkData() {
    console.log("Fetching all 337 posts from Supabase...");
    const { data, error } = await supabase.from('posts').select('*');
    if (error) return console.error(error);

    const types = {};
    const sources = {};

    data.forEach(p => {
        types[p.contentType] = (types[p.contentType] || 0) + 1;
        sources[p.source] = (sources[p.source] || 0) + 1;
    });

    console.log('TYPES:', types);
    console.log('SOURCES:', sources);
}
checkData();
