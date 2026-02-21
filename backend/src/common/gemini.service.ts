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
 * Free tier per key: ~1,500 requests/day on Gemini 2.0 Flash.
 * With 3 keys = ~4,500 free requests/day.
 */
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly clients: { genAI: GoogleGenerativeAI; model: GenerativeModel; modelName: string; keyId: number }[] = [];
  private activeIndex = 0;
  private readonly groqKeys: string[] = [];

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

    const geminiModels = [
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash-8b',
      'gemini-1.5-flash-latest'
    ];

    let keyIndex = 1;
    for (const key of keys) {
      const genAI = new GoogleGenerativeAI(key);
      for (const modelName of geminiModels) {
        const model = genAI.getGenerativeModel({ model: modelName });
        this.clients.push({ genAI, model, modelName, keyId: keyIndex });
      }
      keyIndex++;
    }

    if (this.clients.length === 0) {
      this.logger.warn('No Gemini API keys configured');
    } else {
      this.logger.log(`Loaded ${this.clients.length} Gemini API key(s) for rotation`);
    }

    const groqKeysStr = this.config.get<string>('GROQ_API_KEYS') || this.config.get<string>('GROQ_API_KEY') || '';
    const groqArr = groqKeysStr.split(',').map(k => k.trim()).filter(Boolean);
    this.groqKeys.push(...groqArr);

    if (this.groqKeys.length > 0) {
      this.logger.log(`Loaded ${this.groqKeys.length} Groq API key(s) as fallback`);
    }
  }

  /**
   * Whether at least one key is available (Gemini or Groq).
   */
  get isAvailable(): boolean {
    return this.clients.length > 0 || this.groqKeys.length > 0;
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
        this.logger.warn(`Gemini Error on Key #${client.keyId} [${client.modelName}]: ${err.message}`);
        this.activeIndex = (this.activeIndex + 1) % totalKeys;
        attempts++;
      }
    }

    // 2. Try Groq Fallback if Gemini failed or wasn't configured
    if (this.groqKeys.length > 0) {
      this.logger.warn('Gemini exhausted/unavailable — falling back to Groq LLaMA models');
      return this.generateWithGroq(prompt);
    }

    throw new Error('All AI API keys exhausted — try again later');
  }

  /**
   * Direct HTTP fetch to Groq OpenAI-compatible completions API using Llama 3 8B.
   */
  private async generateWithGroq(prompt: string): Promise<string> {
    for (let i = 0; i < this.groqKeys.length; i++) {
      const key = this.groqKeys[i];
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
          })
        });

        if (!response.ok) {
          throw new Error(`Groq HTTP error ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || '';
      } catch (err: any) {
        this.logger.error(`Groq key #${i + 1} failed: ${err.message}`);
      }
    }
    throw new Error('All Groq API keys exhausted or failed');
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
