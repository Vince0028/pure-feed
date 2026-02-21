import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { YoutubeService } from '../youtube/youtube.service';
import { RssService } from '../rss/rss.service';
import { GatekeeperService } from '../gatekeeper/gatekeeper.service';
import { FeedService } from '../feed/feed.service';
import { FeedPost, RawFeedItem } from '../common/types';
import { randomUUID } from 'crypto';

/**
 * CronJobService — Orchestrates the entire fetch → filter → store pipeline.
 *
 * Runs every hour automatically via @nestjs/schedule.
 * Also triggered on-demand via the CronController endpoint.
 */
@Injectable()
export class CronJobService implements OnModuleInit {
  private readonly logger = new Logger(CronJobService.name);

  constructor(
    private readonly youtube: YoutubeService,
    private readonly rss: RssService,
    private readonly gatekeeper: GatekeeperService,
    private readonly feed: FeedService,
  ) { }

  /**
   * Run immediately on startup to populate the feed.
   */
  async onModuleInit() {
    this.logger.log('🚀 Server started — triggering initial feed fetch...');
    await this.handleCron();
  }

  /**
   * Automatic cron: runs every hour.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('⏰ Cron triggered — fetching latest AI content...');
    await this.fetchAndFilter();
  }

  /**
   * The main pipeline: Fetch → Gatekeeper → Store.
   */
  async fetchAndFilter(): Promise<{ fetched: number; passed: number; stored: number }> {
    // 1. Fetch from all sources
    this.logger.log('📡 Fetching from YouTube + RSS...');

    // Fetch 4 batches of shorts (using rotating hashtags) -> ~200 items
    const shortsPromises = Array(4).fill(0).map(() => this.youtube.fetchShorts(undefined, 50));

    // Fetch 8 batches of long videos (using rotating AI hashtags) -> ~400 items
    // (Gatekeeper will filter out non-tech/unavailable videos, reliably leaving > 100)
    const videosPromises = Array(8).fill(0).map(() => this.youtube.fetchLongVideos(undefined, 50));

    const [shortsJson, videosJson, rssItems] = await Promise.all([
      Promise.all(shortsPromises),
      Promise.all(videosPromises),
      this.rss.fetchArticles(5),
    ]);

    const allItems: RawFeedItem[] = [
      ...shortsJson.flat(),
      ...videosJson.flat(),
      ...rssItems
    ];
    this.logger.log(`Fetched ${allItems.length} total items`);

    // 2. Run Gatekeeper — kill the fluff
    this.logger.log('🔍 Running Gatekeeper filter...');
    const techItems = await this.gatekeeper.filterFeed(allItems);

    // 3. Convert to FeedPost and store
    const posts: FeedPost[] = techItems.map((item) => ({
      id: randomUUID(),
      source: item.source,
      contentType: item.contentType,
      sourceId: item.sourceId,
      embedUrl: item.embedUrl,
      title: item.title,
      caption: item.caption,
      tags: item.tags,
      isTechFluff: false,
      createdAt: new Date().toISOString(),
    }));

    const stored = this.feed.addPosts(posts);

    this.logger.log(`✅ Pipeline complete: ${allItems.length} fetched → ${techItems.length} passed → ${stored} new stored`);

    return {
      fetched: allItems.length,
      passed: techItems.length,
      stored,
    };
  }
}
