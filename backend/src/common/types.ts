/**
 * Represents a single post in the NoFluff.ai feed.
 * Used across all backend services and returned to the frontend.
 */
export interface FeedPost {
  id: string;
  source: 'youtube' | 'rss';
  sourceId: string;
  embedUrl: string;
  title: string;
  caption?: string;
  summary?: string[];
  tags: string[];
  isTechFluff: boolean;
  createdAt: string;
}

/**
 * Raw item returned by a data source before gatekeeping.
 */
export interface RawFeedItem {
  source: 'youtube' | 'rss';
  sourceId: string;
  embedUrl: string;
  title: string;
  caption?: string;
  tags: string[];
}

/**
 * Gatekeeper verdict — TECH items are kept, FLUFF items are discarded.
 */
export type GatekeeperVerdict = 'TECH' | 'FLUFF';
