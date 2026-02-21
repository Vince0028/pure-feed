import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../common/gemini.service';

/**
 * SummarizerService
 *
 * Takes a video title + caption/transcript and returns
 * key bullet points using the shared GeminiService
 * (with automatic key rotation when a key runs out).
 */
@Injectable()
export class SummarizerService {
  private readonly logger = new Logger(SummarizerService.name);

  constructor(private readonly gemini: GeminiService) { }

  /**
   * Summarize content into concise bullet points.
   * If content is missing or short and a URL is provided, it fetches the actual article text.
   */
  async summarize(title: string, content?: string, url?: string): Promise<string[]> {
    if (!this.gemini.isAvailable) {
      this.logger.warn('No Gemini keys configured, skipping summarization');
      throw new Error('No Gemini API keys configured');
    }

    try {
      let textToSummarize = content || '';

      // If we don't have enough text but we have a URL, try to fetch the article body
      if (textToSummarize.length < 200 && url) {
        try {
          this.logger.log(`Fetching article content for summary from: ${url}`);
          const res = await fetch(url);
          if (res.ok) {
            const html = await res.text();

            // Remove scripts, styles, and SVG blocks first to avoid summarizing code
            const strippedHtml = html
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
              .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
              .replace(/<[^>]+>/g, ' ') // Then remove all other HTML tags
              .replace(/\s+/g, ' ') // Collapse whitespace
              .trim();

            // Give the AI the first ~8000 characters to prevent context window overflow
            // 8000 chars is roughly 1500-2000 words, plenty for a 3-bullet summary
            textToSummarize = strippedHtml.slice(0, 8000);
          }
        } catch (fetchErr) {
          this.logger.warn(`Failed to fetch URL for summarization: ${url}`, fetchErr.message);
        }
      }

      // If we STILL don't have text, the AI will just use the title
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

      const text = await this.gemini.generateContent(prompt);

      const bullets = text
        .split('\n')
        .map((line: string) => line.replace(/^[•\-\*\d+\.]+\s*/, '').trim())
        .filter((line: string) => line.length > 0);

      if (bullets.length === 0) {
        throw new Error('No bullets parsed from response');
      }

      return bullets;
    } catch (err) {
      this.logger.error('Summarization failed', err);
      throw err;
    }
  }
}
