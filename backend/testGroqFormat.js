require('dotenv').config();

const key = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY;

if (!key) {
    console.log("No Groq API key found in .env");
    process.exit(1);
}

const prompt = `You are an expert tech analyst summarizing content for a fast-paced tech news feed.
Your goal is to provide a highly knowledgeable yet perfectly simple and readable summary.
Analyze the following title and content:

Title: "Claude 3.5 Sonnet released"
Content: "It scores 92% on HumanEval."

Provide a structured summary using exactly these 3 bullet points:
- Key Concept: [1 clear sentence explaining the core technology, release, or main idea]
- Why it Matters: [1 clear sentence explaining the impact, use case, or significance to the tech industry]
- Details: [1-2 sentences with the most important technical specs, numbers, or specific features]

Do not include any intro, outro, or additional text. Start each line with a dash (-).`;

async function test() {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${key.trim()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
        })
    });

    const data = await response.json();
    if (!response.ok) {
        console.error('Groq API Error:', data);
        return;
    }
    const rawText = data.choices[0].message.content.trim();
    console.log('----- RAW OUTPUT -----');
    console.log(rawText);
    console.log('----------------------');

    const bullets = rawText
        .split('\n')
        .map(line => line.replace(/^[•\-\*\d+\.]+\s*/, '').trim())
        .filter(line => line.length > 0);

    console.log('----- PARSED BULLETS -----');
    console.log(bullets);
}

test().catch(console.error);
