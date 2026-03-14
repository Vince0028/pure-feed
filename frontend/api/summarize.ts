import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, content, url } = req.body;
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ summary: [], error: 'Gemini API key is not configured.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    let textToSummarize = content || '';

    // If we only have a short snippet and a URL, try to fetch the actual article (like the backend did)
    if (textToSummarize.length < 200 && url) {
      try {
        const fetchRes = await fetch(url);
        if (fetchRes.ok) {
          const html = await fetchRes.text();
          const strippedHtml = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          textToSummarize = strippedHtml.slice(0, 8000);
        }
      } catch (err) {
        console.warn('Failed to fetch URL directly from Vercel.', err);
      }
    }

    if (!textToSummarize) {
      textToSummarize = 'No article content available to summarize. Provide a summary based strictly on the title and tech context.';
    }

    const prompt = `You are an expert tech analyst summarizing content for a fast-paced tech news feed.
Your goal is to provide a highly knowledgeable yet perfectly simple and readable summary.
Analyze the following title and content:

Title: "${title}"
Content: "${textToSummarize}"

Provide a structured summary using exactly these 3 bullet points:
- Key Concept: [1 clear sentence explaining the core technology, release, or main idea]
- Why it Matters: [1 clear sentence explaining the impact, use case, or significance to the tech industry]
- Details: [1-2 sentences with the most important technical specs, numbers, or specific features]

Do not include any intro, outro, or additional text. Start each line with a dash (-).`;

    const result = await model.generateContent(prompt);
    const generatedText = result.response.text().trim();

    const bullets = generatedText
      .split('\n')
      .map((line: string) => line.replace(/^[•\-\*\d+\.]+\s*/, '').trim())
      .filter((line: string) => line.length > 0);

    return res.status(200).json({ summary: bullets });
  } catch (error: any) {
    console.error('Vercel Gemini Summarize Error:', error);
    return res.status(500).json({ summary: [], error: error.message });
  }
}
