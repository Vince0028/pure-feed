import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FeedPost } from '../common/types';

/**
 * FeedService — Persistent store using Supabase PostgreSQL.
 */
@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);
  private supabase: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.logger.log('📦 Supabase client initialized');
    } else {
      this.logger.warn('⚠️ No Supabase credentials found! Feed will not save.');
    }
  }

  /**
   * Get all posts from the database.
   * Supabase already handles the sorting natively, but we'll re-sort Memory-style just in case.
   */
  async getAll(): Promise<FeedPost[]> {
    if (!this.supabase) return [];

    try {
      // Fetch all posts, up to 2000 for the feed
      const { data, error } = await this.supabase
        .from('posts')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(2000);

      if (error) throw error;
      if (!data) return [];

      const posts = data as FeedPost[];

      const articles = posts.filter(p => p.contentType === 'article');
      const videos = posts.filter(p => p.contentType !== 'article');

      // Sort articles explicitly by generated AI Fame Score
      articles.sort((a, b) => (b.fameScore || 50) - (a.fameScore || 50));

      // Sort videos by recency
      videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return [...articles, ...videos];
    } catch (err) {
      this.logger.error('Failed to fetch from Supabase', err);
      return [];
    }
  }

  /**
   * Get a single post by ID.
   */
  async getById(id: string): Promise<FeedPost | undefined> {
    if (!this.supabase) return undefined;

    const { data, error } = await this.supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return data as FeedPost;
  }

  /**
   * Add new posts to Supabase.
   * `sourceId` must be UNIQUE in the DB, so we use `onConflict` to ignore duplicates.
   */
  async addPosts(newPosts: FeedPost[]): Promise<number> {
    if (!this.supabase || newPosts.length === 0) return 0;

    try {
      const { error } = await this.supabase
        .from('posts')
        .upsert(newPosts, { onConflict: 'sourceId', ignoreDuplicates: true });

      if (error) throw error;

      this.logger.log(`Upserted batch of ${newPosts.length} posts to Supabase`);
      return newPosts.length;
    } catch (err) {
      this.logger.error('Failed to upsert posts to Supabase', err);
      return 0;
    }
  }

  /**
   * Update the summary for a specific post.
   */
  async updateSummary(id: string, summary: string[]): Promise<void> {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('posts')
        .update({ summary })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      this.logger.error(`Failed to update summary for ${id}`, err);
    }
  }

  /**
   * Optional manual clear (be careful in production!)
   */
  async clear(): Promise<void> {
    if (!this.supabase) return;

    // Deletes everything by matching all IDs that are not null
    await this.supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    this.logger.log('Cleared posts table');
  }
}
