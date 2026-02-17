import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

/**
 * GeminiService — Shared Gemini AI client with automatic key rotation.
 *
 * Supports multiple API keys via GEMINI_API_KEYS (comma-separated).
 * When a key hits its quota (429 / 503 / RESOURCE_EXHAUSTED), it
 * automatically swaps to the next key and retries the request.
 *
 * Free tier per key: ~1,500 requests/day on Gemini 1.5 Flash.
 * With 3 keys = ~4,500 free requests/day.
 */
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly clients: { genAI: GoogleGenerativeAI; model: GenerativeModel }[] = [];
  private activeIndex = 0;

  constructor(private config: ConfigService) {
    // Load all keys: GEMINI_API_KEYS (comma-separated) takes priority,
    // falls back to single GEMINI_API_KEY for backwards compatibility.
    const keysStr = this.config.get<string>('GEMINI_API_KEYS') || '';
    const singleKey = this.config.get<string>('GEMINI_API_KEY') || '';

    const keys = keysStr
      ? keysStr.split(',').map((k) => k.trim()).filter(Boolean)
      : singleKey
        ? [singleKey]
        : [];

    for (const key of keys) {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.clients.push({ genAI, model });
    }

    if (this.clients.length === 0) {
      this.logger.warn('No Gemini API keys configured — AI features disabled');
    } else {
      this.logger.log(`Loaded ${this.clients.length} Gemini API key(s) for rotation`);
    }
  }

  /**
   * Whether at least one key is available.
   */
  get isAvailable(): boolean {
    return this.clients.length > 0;
  }

  /**
   * Generate content with automatic key rotation on quota errors.
   * Tries each key once before giving up.
   */
  async generateContent(prompt: string): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('No Gemini API keys configured');
    }

    const totalKeys = this.clients.length;
    let attempts = 0;

    while (attempts < totalKeys) {
      const client = this.clients[this.activeIndex];
      try {
        const result = await client.model.generateContent(prompt);
        return result.response.text().trim();
      } catch (err: any) {
        const isQuotaError = this.isQuotaOrRateError(err);

        if (isQuotaError && totalKeys > 1) {
          const exhaustedIndex = this.activeIndex;
          this.activeIndex = (this.activeIndex + 1) % totalKeys;
          this.logger.warn(
            `🔄 Key #${exhaustedIndex + 1} exhausted — rotating to key #${this.activeIndex + 1}`,
          );
          attempts++;
        } else {
          // Non-quota error or last key — rethrow
          throw err;
        }
      }
    }

    throw new Error('All Gemini API keys exhausted — try again later');
  }

  /**
   * Check if an error is a quota/rate-limit error that warrants key rotation.
   */
  private isQuotaOrRateError(err: any): boolean {
    const message = (err?.message || '').toLowerCase();
    const status = err?.status || err?.httpStatusCode || 0;

    return (
      status === 429 ||
      status === 503 ||
      message.includes('resource_exhausted') ||
      message.includes('quota') ||
      message.includes('rate limit') ||
      message.includes('too many requests')
    );
  }
}
