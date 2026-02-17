import { Injectable, Logger } from '@nestjs/common';
import * as Parser from 'rss-parser';
import { RawFeedItem } from '../common/types';

/**
 * RssService — Fetches the latest AI/tech articles from free RSS feeds.
 *
 * No API key required. Completely free and unlimited.
 */
@Injectable()
export class RssService {
  private readonly logger = new Logger(RssService.name);
  private readonly parser = new Parser();

  /** List of trusted AI/tech RSS feeds — all free, no API keys required */
  private readonly feeds = [
    { name: 'OpenAI News', url: 'https://openai.com/news/rss' },
    { name: 'MIT AI News', url: 'https://news.mit.edu/rss/topic/artificial-intelligence' },
    { name: 'TechRepublic', url: 'https://www.techrepublic.com/rssfeeds/articles/' },
    { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
    { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
    { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
    { name: 'HPCwire AI', url: 'https://www.hpcwire.com/aiwire/feed/' },
  ];

  /**
   * Fetch the latest articles from all configured RSS feeds.
   * @param itemsPerFeed - Number of items to grab from each feed
   */
  async fetchArticles(itemsPerFeed = 3): Promise<RawFeedItem[]> {
    const results: RawFeedItem[] = [];

    for (const feed of this.feeds) {
      try {
        const parsed = await this.parser.parseURL(feed.url);
        const items = (parsed.items || []).slice(0, itemsPerFeed);

        for (const item of items) {
          results.push({
            source: 'rss',
            contentType: 'article',
            sourceId: item.link || item.guid || '',
            embedUrl: '',
            title: item.title || 'Untitled',
            caption: this.stripHtml(item.contentSnippet || item.content || '').slice(0, 300),
            tags: this.extractTags(item.title || '', item.categories || []),
          });
        }

        this.logger.log(`Fetched ${items.length} items from ${feed.name}`);
      } catch (err) {
        this.logger.warn(`Failed to fetch ${feed.name}: ${err.message}`);
      }
    }

    return results;
  }

  /**
   * Strip HTML tags from a string.
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  /**
   * Extract tech tags from the title and RSS categories.
   */
  private extractTags(title: string, categories: string[]): string[] {
    const keywords = [
      'AI', 'LLM', 'GPT', 'Gemini', 'Claude', 'OpenAI', 'Anthropic',
      'Neural Network', 'Transformer', 'Deep Learning', 'Machine Learning',
      'NLP', 'Computer Vision', 'Robotics', 'NVIDIA',
    ];
    const text = [title, ...categories].join(' ');
    const matched = keywords.filter((kw) =>
      text.toLowerCase().includes(kw.toLowerCase()),
    );
    // If no keyword matched, tag with generic "Tech"
    return matched.length > 0 ? matched : ['Tech'];
  }
}
