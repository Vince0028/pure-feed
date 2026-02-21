import fetch from 'node-fetch';

async function testSum() {
    console.log("Pinging local summarizer endpoint...");
    try {
        const res = await fetch('http://127.0.0.1:3001/api/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "Example Title",
                content: "This is a test content that should be summarized.",
                url: "https://example.com"
            })
        });

        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}
testSum();
