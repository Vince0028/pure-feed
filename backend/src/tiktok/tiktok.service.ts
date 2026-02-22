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
    async fetchTiktokShorts(maxItems: number = 20): Promise<RawFeedItem[]> {
        const primaryToken = this.configService.get<string>('APIFY_API_TOKEN');
        const secondaryToken = this.configService.get<string>('APIFY_SECOND_API_TOKEN');

        if (!primaryToken && !secondaryToken) {
            this.logger.warn('⚠️ No Apify token found! Skipping TikTok scrape... [Add APIFY_API_TOKEN or APIFY_SECOND_API_TOKEN to .env]');
            return [];
        }

        this.logger.log('📱 Triggering Apify TikTok Scraper (clockworks)...');

        try {
            const payload = {
                "commentsPerPost": 0,
                "excludePinnedPosts": true,
                "hashtags": [
                    "AITools",
                    "TechTok",
                    "DevTok",
                    "Coding",
                    "SoftwareEngineer",
                    "ChatGPT",
                    "NewTech",
                    "TechNews"
                ],
                "resultsPerPage": maxItems,
                "scrapeRelatedVideos": false,
                "shouldDownloadAvatars": false,
                "shouldDownloadCovers": true,
                "shouldDownloadVideos": false
            };

            let data;
            const tokenToTryFirst = primaryToken || secondaryToken;
            try {
                data = await this.executeApifyFetch(tokenToTryFirst, payload);
            } catch (err) {
                if (secondaryToken && primaryToken && tokenToTryFirst !== secondaryToken) {
                    this.logger.warn(`⚠️ Primary Apify token failed (${err.message}). Retrying with APIFY_SECOND_API_TOKEN...`);
                    data = await this.executeApifyFetch(secondaryToken, payload);
                } else {
                    throw err;
                }
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
     * Executes the Apify fetch request.
     */
    private async executeApifyFetch(token: string, payload: any): Promise<any> {
        const url = `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items?token=${token}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Apify returned ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Apify API did not return an array. Check endpoint response.');
        }

        return data;
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
        const keywords = ['AI', 'Coding', 'Software', 'Developer', 'Tech', 'AITools', 'ChatGPT', 'OpenAI', 'TechNews', 'Programming'];
        return keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase()));
    }
}
