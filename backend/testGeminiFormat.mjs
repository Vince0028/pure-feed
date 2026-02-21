import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';

function getEnv(key) {
    const envFile = readFileSync('.env', 'utf-8');
    for (const line of envFile.split('\n')) {
        if (line.startsWith(key + '=')) {
            return line.split('=')[1].trim();
        }
    }
}

const key = getEnv('GEMINI_API_KEY');
if (!key) {
    console.log("No Gemini API key found in .env");
    process.exit(1);
}

const prompt = `You are an expert tech analyst summarizing content for a fast-paced tech news feed.
Your goal is to provide a highly knowledgeable yet perfectly simple and readable summary.
Analyze the following title and content:

Title: "This is the best video generator and it's free rn and nobody knows 🤫 #seedance #ai #tech"
Content: ""

Provide a structured summary using exactly these 3 bullet points:
- Key Concept: [1 clear sentence explaining the core technology, release, or main idea]
- Why it Matters: [1 clear sentence explaining the impact, use case, or significance to the tech industry]
- Details: [1-2 sentences with the most important technical specs, numbers, or specific features]

Do not include any intro, outro, or additional text. Start each line with a dash (-).`;

async function test() {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();
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
