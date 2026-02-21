import dotenv from 'dotenv';
dotenv.config();

async function checkApi() {
    try {
        const res = await fetch('http://127.0.0.1:3001/api/feed');
        if (!res.ok) throw new Error('Failed to fetch from backend 3001');
        const data = await res.json();

        console.log(`Total return from API: ${data.length}`);
        const s = data.filter(d => d.contentType === 'short').length;
        const a = data.filter(d => d.contentType === 'article').length;
        const v = data.filter(d => d.contentType === 'video').length;

        console.log(`Articles: ${a} | Shorts: ${s} | Videos: ${v}`);
    } catch (err) {
        console.error("Fetch failed:", err.message);
    }
}
checkApi();
