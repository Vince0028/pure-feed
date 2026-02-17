import { Injectable, Logger } from '@nestjs/common';
import { FeedPost } from '../common/types';

/**
 * FeedService — In-memory store for filtered, tech-only posts.
 *
 * In production, replace this with Supabase/Postgres queries.
 * For the MVP, we keep posts in memory so there's zero DB setup friction.
 */
@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);
  private posts: FeedPost[] = [];

  /**
   * Get all posts, sorted newest first.
   */
  getAll(): FeedPost[] {
    return [...this.posts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  /**
   * Get a single post by ID.
   */
  getById(id: string): FeedPost | undefined {
    return this.posts.find((p) => p.id === id);
  }

  /**
   * Add new posts (deduplicates by sourceId).
   */
  addPosts(newPosts: FeedPost[]): number {
    let added = 0;
    for (const post of newPosts) {
      const exists = this.posts.some((p) => p.sourceId === post.sourceId);
      if (!exists) {
        this.posts.push(post);
        added++;
      }
    }
    this.logger.log(`Added ${added} new posts (${this.posts.length} total)`);
    return added;
  }

  /**
   * Update the summary for a specific post.
   */
  updateSummary(id: string, summary: string[]): void {
    const post = this.posts.find((p) => p.id === id);
    if (post) {
      post.summary = summary;
    }
  }

  /**
   * Clear all posts (useful for testing).
   */
  clear(): void {
    this.posts = [];
  }
}
