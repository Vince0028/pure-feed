import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { YoutubeService } from '../youtube/youtube.service';
import { RssService } from '../rss/rss.service';
import { ExternalArticlesService } from '../external-articles/external-articles.service';
import { GatekeeperService } from '../gatekeeper/gatekeeper.service';
import { SummarizerService } from '../summarizer/summarizer.service';
import { FeedService } from '../feed/feed.service';
import { TiktokService } from '../tiktok/tiktok.service';
import { FeedPost, RawFeedItem } from '../common/types';
import { randomUUID } from 'crypto';

/**
 * CronJobService — Orchestrates the entire fetch → filter → store pipeline.
 * Runs every 3 days automatically via @nestjs/schedule.
 * Also triggered on-demand via the CronController endpoint.
 */
@Injectable()
export class CronJobService implements OnModuleInit {
  private readonly logger = new Logger(CronJobService.name);

  constructor(
    private readonly youtube: YoutubeService,
    private readonly rss: RssService,
    private readonly externalArticles: ExternalArticlesService,
    private readonly gatekeeper: GatekeeperService,
    private readonly summarizer: SummarizerService,
    private readonly feed: FeedService,
    private readonly tiktok: TiktokService,
  ) { }

  /**
   * Run immediately on startup to populate the feed in the background.
   */
  async onModuleInit() {
    this.logger.log('🚀 Server started — triggering initial feed fetch in the background...');
    this.handleCron().catch(err => {
      this.logger.error('Initial background fetch failed', err);
    });
  }

  /**
   * Automatic cron: runs every 3 days.
   */
  @Cron('0 0 */3 * *')
  async handleCron() {
    this.logger.log('⏰ Cron triggered — fetching latest AI content...');
    await this.fetchAndFilter();
  }

  /**
   * The main pipeline: Fetch → Gatekeeper → Store.
   */
  async fetchAndFilter(): Promise<{ fetched: number; passed: number; stored: number }> {
    // 1. Fetch from all sources
    this.logger.log('📡 Fetching from TikTok + YouTube + RSS + HackerNews + Dev.to + Lobsters...');

    // Fetch TikToks (Using Apify synchronous scraper to get ~60 latest videos)
    const tiktokPromise = this.tiktok.fetchTiktokShorts(60);

    // Fetch 2 batches of YouTube shorts (using rotating hashtags) -> ~100 items
    const youtubeShortsPromises = Array(2).fill(0).map(() => this.youtube.fetchShorts(undefined, 50));

    // Fetch 8 batches of long videos (using rotating AI hashtags) -> ~400 items
    const youtubeVideosPromises = Array(8).fill(0).map(() => this.youtube.fetchLongVideos(undefined, 50));

    const [tiktoks, youtubeShortsJson, youtubeVideosJson, rssItems, externalItems] = await Promise.all([
      tiktokPromise,
      Promise.all(youtubeShortsPromises),
      Promise.all(youtubeVideosPromises),
      this.rss.fetchArticles(5),
      this.externalArticles.fetchAll(40),
    ]);

    const allItems: RawFeedItem[] = [
      ...tiktoks,
      ...youtubeShortsJson.flat(),
      ...youtubeVideosJson.flat(),
      ...rssItems,
      ...externalItems,
    ];
    this.logger.log(`Fetched ${allItems.length} total items`);

    // 2. Run Gatekeeper — kill the fluff
    this.logger.log('🔍 Running Gatekeeper filter...');
    const techItems = await this.gatekeeper.filterFeed(allItems);

    // 3. Separate articles and sort by fameScore
    const articles = techItems.filter(item => item.contentType === 'article');
    const videos = techItems.filter(item => item.contentType !== 'article');

    articles.sort((a, b) => (b.fameScore || 50) - (a.fameScore || 50));

    const sortedItems = [...articles, ...videos];

    // 4. Generate AI summaries for articles (3 bullet points each)
    this.logger.log('🧠 Generating AI summaries for articles...');
    const summaryMap = new Map<string, string[]>(); // sourceId -> summary
    for (const item of sortedItems) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limit
        const content = item.snippet || item.caption || '';
        const url = item.contentType === 'article' ? item.sourceId : undefined;
        const summary = await this.summarizer.summarize(item.title, content, url);
        if (summary && summary.length > 0) {
          summaryMap.set(item.sourceId, summary);
          this.logger.log(`📝 Summary generated for: ${item.title.slice(0, 50)}`);
        }
      } catch (err) {
        this.logger.warn(`⚠️ Summary failed for: ${item.title.slice(0, 50)} — ${err.message}`);
      }
    }
    this.logger.log(`Generated ${summaryMap.size} summaries`);

    // 5. Convert to FeedPost and store
    const posts: FeedPost[] = sortedItems.map((item) => ({
      id: randomUUID(),
      source: item.source,
      contentType: item.contentType,
      sourceId: item.sourceId,
      embedUrl: item.embedUrl,
      title: item.title,
      caption: item.caption,
      snippet: item.snippet,
      sourceName: item.sourceName,
      readTime: item.readTime,
      summary: summaryMap.get(item.sourceId),
      tags: item.tags,
      fameScore: item.fameScore,
      isTechFluff: false,
      createdAt: item.publishedAt || new Date().toISOString(),
    }));

    const stored = await this.feed.addPosts(posts);

    this.logger.log(`✅ Pipeline complete: ${allItems.length} fetched → ${techItems.length} passed → ${stored} new stored`);

    return {
      fetched: allItems.length,
      passed: techItems.length,
      stored,
    };
  }
}
