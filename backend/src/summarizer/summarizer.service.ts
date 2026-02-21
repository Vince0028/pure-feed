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
   * Number of bullets depends on content (not fixed).
   */
  async summarize(title: string, content?: string): Promise<string[]> {
    if (!this.gemini.isAvailable) {
      this.logger.warn('No Gemini keys configured, skipping summarization');
      throw new Error('No Gemini API keys configured');
    }

    try {
      const prompt = `You are an expert tech analyst summarizing content for a fast-paced tech news feed.
Your goal is to provide a highly knowledgeable yet perfectly simple and readable summary.
Analyze the following title and content:

Title: "${title}"
Content: "${content || 'N/A'}"

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
