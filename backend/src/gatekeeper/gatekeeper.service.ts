import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../common/gemini.service';
import { GatekeeperVerdict, RawFeedItem } from '../common/types';

/**
 * GatekeeperService — The "Filler Killer."
 *
 * Uses the shared GeminiService (with automatic key rotation) to
 * classify each post as TECH or FLUFF.
 * Only TECH items survive into the feed. Everything else gets discarded.
 */
@Injectable()
export class GatekeeperService {
  private readonly logger = new Logger(GatekeeperService.name);

  constructor(private readonly gemini: GeminiService) {}

  /**
   * Classify a single post as TECH or FLUFF.
   */
  async classify(title: string, caption?: string): Promise<GatekeeperVerdict> {
    if (!this.gemini.isAvailable) {
      this.logger.warn('No Gemini keys configured — defaulting to TECH');
      return 'TECH';
    }

    try {
      const prompt = `You are a strict tech content filter. Analyze this title and caption.
Is this a genuine, highly technical update about AI, LLMs, programming, new model releases, APIs, or specific tech tools?
Or is this lifestyle content, a vlog, a reaction video, or fluff with no technical substance?

Title: "${title}"
Caption: "${caption || 'N/A'}"

Respond with ONLY one word: TECH or FLUFF`;

      const text = await this.gemini.generateContent(prompt);
      const upper = text.toUpperCase();

      if (upper.includes('TECH')) return 'TECH';
      if (upper.includes('FLUFF')) return 'FLUFF';

      this.logger.warn(`Unexpected Gemini response: "${text}" — defaulting to TECH`);
      return 'TECH';
    } catch (err) {
      this.logger.error('Gatekeeper classification failed', err);
      return 'TECH'; // Fail open — show the post rather than hide it
    }
  }

  /**
   * Filter an array of raw feed items, keeping only TECH posts.
   */
  async filterFeed(items: RawFeedItem[]): Promise<RawFeedItem[]> {
    const results: RawFeedItem[] = [];

    for (const item of items) {
      const verdict = await this.classify(item.title, item.caption);
      if (verdict === 'TECH') {
        results.push(item);
        this.logger.log(`✅ TECH: ${item.title}`);
      } else {
        this.logger.log(`❌ FLUFF: ${item.title}`);
      }
    }

    this.logger.log(`Gatekeeper: ${results.length}/${items.length} items passed`);
    return results;
  }
}
