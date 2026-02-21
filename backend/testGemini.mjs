import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

async function test() {
    const prompt = `You are a strict tech content filter and news ranker. Analyze this title and caption.
Is this a genuine, highly technical update about AI, LLMs, programming, new model releases, APIs, or specific tech tools?
Or is this lifestyle content, a vlog, a reaction video, or fluff with no technical substance?

Title: "OpenAI releases GPT-5"
Caption: "The new model destroys every benchmark"

Identify whether it is TECH or FLUFF.
Additionally, because this is an article, provide a FAME_SCORE from 1-100 based on how famous, impactful, or highly demanded this news is. A major OpenAI/Google release should be 90-100. A standard tutorial or niche update should be 30-50. A completely obscure opinion piece should be 1-20. Format your response exactly like this: [VERDICT],[SCORE]\nExample: TECH,85`;

    try {
        const res = await model.generateContent(prompt);
        const text = res.response.text();
        console.log('Raw output:', text);
        const match = text.toUpperCase().match(/\b([1-9][0-9]?|100)\b/);
        console.log('Parsed score:', match ? parseInt(match[0], 10) : 50);
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
