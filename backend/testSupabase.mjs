import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log('Testing Supabase Insert...');

    const testPost = {
        source: 'hackernews',
        contentType: 'article',
        sourceId: `test-${Date.now()}`,
        title: 'Test Post from Script',
        summary: ['Bullet 1', 'Bullet 2'],
        tags: ['test'],
        createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('posts')
        .upsert([testPost], { onConflict: 'sourceId', ignoreDuplicates: true })
        .select();

    if (error) {
        console.error('❌ Supabase Insert Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('✅ Supabase Insert Success:', data);
    }
}

testInsert();
