import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../common/gemini.service';
import { GatekeeperResult, RawFeedItem } from '../common/types';

/**
 * GatekeeperService — The "Filler Killer."
 *
 * Uses the shared GeminiService (with automatic key rotation) to
 * classify each post as TECH or FLUFF, and optionally assign a fame score.
 * Only TECH items survive into the feed. Everything else gets discarded.
 */
@Injectable()
export class GatekeeperService {
  private readonly logger = new Logger(GatekeeperService.name);

  constructor(private readonly gemini: GeminiService) { }

  /**
   * Classify a single post as TECH or FLUFF, and get a fameScore for articles.
   */
  async classify(item: RawFeedItem): Promise<GatekeeperResult> {
    if (!this.gemini.isAvailable) {
      this.logger.warn('No Gemini keys configured — defaulting to TECH with score 50');
      return { verdict: 'TECH', fameScore: item.contentType === 'article' ? 50 : undefined };
    }

    try {
      const isArticle = item.contentType === 'article';
      const prompt = `You are a strict tech content filter and news ranker. Analyze this title and caption.
Is this a genuine, highly technical update about AI, LLMs, programming, new model releases, APIs, or specific tech tools?
Or is this lifestyle content, a vlog, a reaction video, or fluff with no technical substance?

Title: "${item.title}"
Caption: "${item.caption || 'N/A'}"
Snippet: "${item.snippet || 'N/A'}"

Identify whether it is TECH or FLUFF.
${isArticle ? 'Additionally, because this is an article, provide a FAME_SCORE from 1-100 based on how famous, impactful, or highly demanded this news is. ALSO provide a highly engaging 1-to-2 sentence summary covering what this article is likely about. Format your response exactly like this: [VERDICT] | [SCORE] | [SUMMARY]\nExample: TECH | 85 | Anthropic released a detailed system card analyzing the safety and alignment capabilities of Claude Sonnet 4.6.' : 'Respond with ONLY one word: TECH or FLUFF'}
`;

      const text = await this.gemini.generateContent(prompt);
      const upper = text.toUpperCase().trim();

      if (isArticle) {
        this.logger.debug(`Gemini Article Response: "${text}"`);
        // Expected format: TECH | 85 | Anthropic released...
        const parts = text.split('|').map(p => p.trim());
        const verdictPart = (parts[0] || upper).toUpperCase();
        const verdict = verdictPart.includes('TECH') ? 'TECH' : verdictPart.includes('FLUFF') ? 'FLUFF' : 'TECH';

        const scoreMatch = parts[1] ? parts[1].match(/\b([1-9][0-9]?|100)\b/) : upper.match(/\b([1-9][0-9]?|100)\b/);
        const score = scoreMatch ? parseInt(scoreMatch[0], 10) : 50;

        // The summary is whatever is left over (safely grabbing part[2])
        const snippet = parts.length >= 3 ? parts.slice(2).join(' | ') : undefined;

        console.log(`[DEBUG GATEKEEPER] Verdict: ${verdict}, Score: ${score}, Snippet: ${snippet || 'none'}`);
        return { verdict, fameScore: score, snippet };
      }

      if (upper.includes('TECH')) return { verdict: 'TECH' };
      if (upper.includes('FLUFF')) return { verdict: 'FLUFF' };

      this.logger.warn(`Unexpected Gemini response: "${text}" — defaulting to TECH`);
      return { verdict: 'TECH' };
    } catch (err) {
      this.logger.error('Gatekeeper classification failed', err);
      return { verdict: 'TECH', fameScore: item.contentType === 'article' ? 50 : undefined }; // Fail open
    }
  }

  /**
   * Filter an array of raw feed items, keeping only TECH posts.
   * Preserves pre-computed fameScore from external APIs (HN, Dev.to, Lobsters).
   * Applies a minimum fameScore threshold for articles to remove junk.
   */
  async filterFeed(items: RawFeedItem[]): Promise<RawFeedItem[]> {
    const results: RawFeedItem[] = [];
    const MIN_ARTICLE_FAME = 15; // Skip articles below this threshold

    for (const item of items) {
      // Add a 2-second delay between requests to avoid Groq (30 RPM) and Gemini (15 RPM) rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = await this.classify(item);
      if (result.verdict === 'TECH') {
        // Only overwrite fameScore if the item doesn't already have one
        // (external APIs like HN/Dev.to/Lobsters pre-compute from engagement)
        if (item.fameScore == null && result.fameScore != null) {
          item.fameScore = result.fameScore;
        }

        // Apply our shiny new AI-generated Snippet to Articles missing text
        if (item.contentType === 'article' && result.snippet) {
          item.snippet = result.snippet;
        }

        // Skip low-quality articles (1-point Lobsters posts, etc.)
        if (item.contentType === 'article' && (item.fameScore || 0) < MIN_ARTICLE_FAME) {
          this.logger.log(`🗑️ LOW FAME: ${item.title} (score: ${item.fameScore})`);
          continue;
        }

        results.push(item);
        this.logger.log(`✅ TECH: ${item.title} ${item.fameScore ? `(Score: ${item.fameScore})` : ''}`);
      } else {
        this.logger.log(`❌ FLUFF: ${item.title}`);
      }
    }

    this.logger.log(`Gatekeeper: ${results.length}/${items.length} items passed`);
    return results;
  }
}
