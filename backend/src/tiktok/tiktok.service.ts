import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RawFeedItem } from '../common/types';

/**
 * TiktokService
 * 
 * Invokes the Apify clockworks~tiktok-scraper actor synchronously
 * and downloads the structured dataset of AI/Programming TikToks.
 */
@Injectable()
export class TiktokService {
    private readonly logger = new Logger(TiktokService.name);

    constructor(private configService: ConfigService) { }

    /**
     * Fetches trending AI/Programming TikToks using Apify.
     */
    async fetchTiktokShorts(maxItems: number = 30): Promise<RawFeedItem[]> {
        const apifyToken = this.configService.get<string>('APIFY_API_TOKEN');

        if (!apifyToken) {
            this.logger.warn('⚠️ No Apify token found! Skipping TikTok scrape... [Add APIFY_API_TOKEN to .env]');
            return [];
        }

        this.logger.log('📱 Triggering Apify TikTok Scraper (clockworks)...');

        try {
            // Endpoint provided by the user: "run-sync-get-dataset-items"
            const url = `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items?token=${apifyToken}`;

            const payload = {
                "commentsPerPost": 0,
                "excludePinnedPosts": true,
                "hashtags": [
                    "AIAgents",
                    "TechTok",
                    "DevTok",
                    "Coding",
                    "OpenAI",
                    "LLM",
                    "GenerativeAI"
                ],
                "resultsPerPage": maxItems,
                "scrapeRelatedVideos": false,
                "shouldDownloadAvatars": false,
                "shouldDownloadCovers": true,
                "shouldDownloadVideos": false
            };

            // Set timeout relatively high since scraping takes time
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Apify returned ${response.status}: ${await response.text()}`);
            }

            // The URL suffix "-get-dataset-items" means the response directly returns the array
            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Apify API did not return an array. Check endpoint response.');
            }

            const items: RawFeedItem[] = data.map((item: any) => ({
                source: 'tiktok' as const,
                contentType: 'short' as const,
                // Example ID extraction from 'https://www.tiktok.com/@user/video/732891901'
                sourceId: item.id || this.extractTiktokId(item.webVideoUrl),
                // Most TikTok scrapers return a clean webVideoUrl we can embed
                embedUrl: `https://www.tiktok.com/embed/v2/${item.id || this.extractTiktokId(item.webVideoUrl)}`,
                title: item.text ? item.text.substring(0, 80) + '...' : 'TikTok Video',
                caption: item.text || '',
                tags: this.extractTags(item.text || ''),
            })).filter(item => item.sourceId);

            this.logger.log(`✅ Fetched ${items.length} new TikToks from Apify`);
            return items;

        } catch (err) {
            this.logger.error('Failed to scrape TikToks from Apify', err);
            return [];
        }
    }

    /**
     * Helper to parse ID from standard TikTok URL if ID is missing.
     */
    private extractTiktokId(url?: string): string {
        if (!url) return '';
        const match = url.match(/\/video\/(\d+)/);
        return match ? match[1] : '';
    }

    /**
     * Extract relevant tags from caption text.
     */
    private extractTags(text: string): string[] {
        const keywords = ['AI', 'Coding', 'LLM', 'Tech', 'OpenAI', 'Programming'];
        return keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase()));
    }
}
