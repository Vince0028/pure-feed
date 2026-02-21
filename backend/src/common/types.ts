/**
 * Represents a single post in the NoFluff.ai feed.
 * Used across all backend services and returned to the frontend.
 */
export interface FeedPost {
  id: string;
  source: 'youtube' | 'rss' | 'hackernews' | 'devto' | 'lobsters';
  contentType: 'short' | 'video' | 'article';
  sourceId: string;
  embedUrl: string;
  title: string;
  caption?: string;
  snippet?: string;
  sourceName?: string;
  readTime?: number;
  summary?: string[];
  tags: string[];
  fameScore?: number;
  isTechFluff: boolean;
  createdAt: string;
}

/**
 * Raw item returned by a data source before gatekeeping.
 */
export interface RawFeedItem {
  source: 'youtube' | 'rss' | 'hackernews' | 'devto' | 'lobsters';
  contentType: 'short' | 'video' | 'article';
  sourceId: string;
  embedUrl: string;
  title: string;
  caption?: string;
  snippet?: string;
  sourceName?: string;
  readTime?: number;
  publishedAt?: string;
  tags: string[];
  fameScore?: number;
}


/**
 * Gatekeeper verdict — TECH items are kept, FLUFF items are discarded.
 * Returns an object with the verdict and an optional fameScore for articles.
 */
export interface GatekeeperResult {
  verdict: 'TECH' | 'FLUFF';
  fameScore?: number;
}
