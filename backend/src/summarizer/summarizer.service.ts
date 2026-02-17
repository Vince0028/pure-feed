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

  constructor(private readonly gemini: GeminiService) {}

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
      const prompt = `You are a content summarizer for a tech news app.
Extract only the key facts. Skip intros, outros, filler, and opinions.
Keep each bullet short and direct. No em dashes. Use simple language.
The number of bullets should match the content (e.g. "5 tools" = 5 bullets, a news article might be 2-3).

Title: "${title}"
Content: "${content || 'N/A'}"

Return each bullet on its own line, starting with "- ".`;

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
