import { Injectable, Logger } from '@nestjs/common';
import { RawFeedItem } from '../common/types';

/**
 * ExternalArticlesService — Fetches tech articles from free APIs:
 *   - Hacker News (100% free, unlimited, no key)
 *   - Dev.to       (100% free, unlimited, no key)
 *   - Lobsters     (100% free, unlimited, no key)
 *
 * Each source pre-computes a `fameScore` from engagement metrics
 * so articles can be sorted by popularity in the feed.
 */
@Injectable()
export class ExternalArticlesService {
    private readonly logger = new Logger(ExternalArticlesService.name);

    // ──────────────────────────────────────────────────────────────
    //  HACKER NEWS — top/best stories with "AI" relevance
    //  fameScore derived from HN points (normalized 0-100)
    // ──────────────────────────────────────────────────────────────
    async fetchHackerNews(limit = 40): Promise<RawFeedItem[]> {
        const results: RawFeedItem[] = [];
        try {
            const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
            const ids: number[] = await res.json();

            const batch = ids.slice(0, limit * 3);
            const stories = await Promise.all(
                batch.map(async (id) => {
                    try {
                        const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
                        return await r.json();
                    } catch { return null; }
                }),
            );

            const aiKeywords = /\b(ai|llm|gpt|gemini|claude|openai|anthropic|machine.?learning|deep.?learning|neural|transformer|diffusion|langchain|hugging.?face|nvidia|cuda|pytorch|tensorflow|agent|rag|fine.?tuning|llama|mistral|groq|copilot|cursor|coding|programming|developer|software|startup|tech|rust|go|python|typescript|react|database|linux|security|web|api|framework|compiler)\b/i;

            for (const story of stories) {
                if (!story || story.type !== 'story' || !story.url) continue;
                const text = `${story.title} ${story.text || ''}`;
                if (!aiKeywords.test(text)) continue;

                // Normalize HN score (no artificial cap since we want highly popular items to surface)
                // 300 points = 100 fameScore. 1337 points = 445 fameScore.
                const fameScore = Math.round((story.score / 300) * 100);

                // Convert Unix timestamp to ISO string
                const publishedAt = story.time ? new Date(story.time * 1000).toISOString() : undefined;

                results.push({
                    source: 'hackernews',
                    contentType: 'article',
                    sourceId: story.url,
                    embedUrl: '',
                    title: this.decodeHtml(story.title),
                    snippet: story.text ? this.stripHtml(story.text).slice(0, 500) : undefined,
                    caption: `${story.score} points · ${story.descendants || 0} comments on Hacker News`,
                    sourceName: 'Hacker News',
                    publishedAt,
                    tags: this.extractTags(story.title),
                    fameScore,
                });

                if (results.length >= limit) break;
            }
            this.logger.log(`Fetched ${results.length} articles from Hacker News`);
        } catch (err) {
            this.logger.warn(`Failed to fetch Hacker News: ${err.message}`);
        }
        return results;
    }

    // ──────────────────────────────────────────────────────────────
    //  DEV.TO — latest AI/tech articles
    //  fameScore derived from positive_reactions_count
    // ──────────────────────────────────────────────────────────────
    async fetchDevTo(limit = 40): Promise<RawFeedItem[]> {
        const results: RawFeedItem[] = [];
        const queries = ['ai', 'machinelearning', 'llm', 'openai', 'programming', 'webdev'];

        try {
            for (const tag of queries) {
                if (results.length >= limit) break;
                const remaining = limit - results.length;
                const perPage = Math.min(remaining, 15);

                const res = await fetch(
                    `https://dev.to/api/articles?tag=${tag}&per_page=${perPage}&top=7`,
                );
                const articles: any[] = await res.json();

                for (const article of articles) {
                    if (results.length >= limit) break;
                    if (results.some((r) => r.sourceId === article.url)) continue;

                    // Normalize reactions to fameScore (no cap)
                    const reactions = article.positive_reactions_count || 0;
                    const fameScore = Math.round((reactions / 100) * 100);

                    // Estimate read time from reading_time_minutes or word count
                    const readTime = article.reading_time_minutes || undefined;

                    results.push({
                        source: 'devto',
                        contentType: 'article',
                        sourceId: article.url,
                        embedUrl: '',
                        title: this.decodeHtml(article.title),
                        snippet: this.decodeHtml(article.description || '').slice(0, 500),
                        caption: `${reactions} reactions · ${readTime || '?'} min read on Dev.to`,
                        sourceName: 'Dev.to',
                        readTime,
                        publishedAt: article.published_at,
                        tags: (article.tag_list || []).slice(0, 5),
                        fameScore,
                    });
                }
            }
            this.logger.log(`Fetched ${results.length} articles from Dev.to`);
        } catch (err) {
            this.logger.warn(`Failed to fetch Dev.to: ${err.message}`);
        }
        return results;
    }

    // ──────────────────────────────────────────────────────────────
    //  LOBSTERS — curated tech link aggregator
    //  fameScore derived from Lobsters score
    // ──────────────────────────────────────────────────────────────
    async fetchLobsters(limit = 40): Promise<RawFeedItem[]> {
        const results: RawFeedItem[] = [];
        try {
            const pages = Math.ceil(limit / 25);
            for (let page = 1; page <= pages; page++) {
                if (results.length >= limit) break;

                const res = await fetch(`https://lobste.rs/page/${page}.json`);
                const stories: any[] = await res.json();

                const techKeywords = /\b(ai|llm|gpt|gemini|claude|openai|machine.?learning|deep.?learning|neural|transformer|diffusion|langchain|rust|go|python|javascript|typescript|programming|software|compiler|database|linux|security|crypto|web|api|framework)\b/i;

                for (const story of stories) {
                    if (results.length >= limit) break;
                    if (!story.url) continue;
                    if (!techKeywords.test(`${story.title} ${(story.tags || []).join(' ')}`)) continue;

                    // Normalize Lobsters score to fameScore (no cap)
                    const fameScore = Math.round((story.score / 30) * 100);

                    results.push({
                        source: 'lobsters',
                        contentType: 'article',
                        sourceId: story.url,
                        embedUrl: '',
                        title: this.decodeHtml(story.title),
                        snippet: story.description ? this.stripHtml(story.description).slice(0, 500) : undefined,
                        caption: `${story.score} points · ${story.comment_count || 0} comments on Lobsters`,
                        sourceName: 'Lobsters',
                        publishedAt: story.created_at,
                        tags: (story.tags || []).slice(0, 5),
                        fameScore,
                    });
                }
            }
            this.logger.log(`Fetched ${results.length} articles from Lobsters`);
        } catch (err) {
            this.logger.warn(`Failed to fetch Lobsters: ${err.message}`);
        }
        return results;
    }

    // ──────────────────────────────────────────────────────────────
    //  FETCH ALL — convenience method
    // ──────────────────────────────────────────────────────────────
    async fetchAll(limitPerSource = 40): Promise<RawFeedItem[]> {
        const [hn, devto, lobsters] = await Promise.all([
            this.fetchHackerNews(limitPerSource),
            this.fetchDevTo(limitPerSource),
            this.fetchLobsters(limitPerSource),
        ]);
        const total = [...hn, ...devto, ...lobsters];
        this.logger.log(`📰 Total external articles fetched: ${total.length}`);
        return total;
    }

    /** Decode HTML entities */
    private decodeHtml(text: string): string {
        if (!text) return '';
        return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, '/')
            .replace(/&#39;/g, "'")
            .replace(/&#8217;/g, "'")
            .replace(/&#8220;/g, '"')
            .replace(/&#8221;/g, '"')
            .replace(/&apos;/g, "'");
    }

    /** Strip HTML tags and decode entities */
    private stripHtml(html: string): string {
        const stripped = html.replace(/<[^>]*>/g, '').trim();
        return this.decodeHtml(stripped);
    }

    /** Simple tag extraction from title */
    private extractTags(title: string): string[] {
        const keywords = [
            'AI', 'LLM', 'GPT', 'Gemini', 'Claude', 'OpenAI', 'Anthropic',
            'Rust', 'Go', 'Python', 'JavaScript', 'TypeScript', 'React',
            'Neural Network', 'Transformer', 'Deep Learning', 'Machine Learning',
            'NLP', 'Computer Vision', 'Robotics', 'NVIDIA', 'Startup',
            'Programming', 'Database', 'Linux', 'Security', 'Web',
        ];
        const matched = keywords.filter((kw) =>
            title.toLowerCase().includes(kw.toLowerCase()),
        );
        return matched.length > 0 ? matched.slice(0, 5) : ['Tech'];
    }
}
