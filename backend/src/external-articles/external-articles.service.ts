import { Injectable, Logger } from '@nestjs/common';
import { RawFeedItem } from '../common/types';

/**
 * ExternalArticlesService — Fetches tech articles from free APIs:
 *   - Hacker News (100% free, unlimited, no key)
 *   - Dev.to       (100% free, unlimited, no key)
 *   - Lobsters     (100% free, unlimited, no key)
 */
@Injectable()
export class ExternalArticlesService {
    private readonly logger = new Logger(ExternalArticlesService.name);

    // ──────────────────────────────────────────────────────────────
    //  HACKER NEWS — top/best stories with "AI" relevance
    // ──────────────────────────────────────────────────────────────
    async fetchHackerNews(limit = 40): Promise<RawFeedItem[]> {
        const results: RawFeedItem[] = [];
        try {
            // Fetch the top 200 story IDs, then filter/limit
            const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
            const ids: number[] = await res.json();

            // Grab details for the first `limit * 2` stories (we'll filter by AI relevance)
            const batch = ids.slice(0, limit * 3);
            const stories = await Promise.all(
                batch.map(async (id) => {
                    try {
                        const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
                        return await r.json();
                    } catch { return null; }
                }),
            );

            const aiKeywords = /\b(ai|llm|gpt|gemini|claude|openai|anthropic|machine.?learning|deep.?learning|neural|transformer|diffusion|langchain|hugging.?face|nvidia|cuda|pytorch|tensorflow|agent|rag|fine.?tuning|llama|mistral|groq|copilot|cursor|coding|programming|developer|software|startup|tech)\b/i;

            for (const story of stories) {
                if (!story || story.type !== 'story' || !story.url) continue;
                const text = `${story.title} ${story.text || ''}`;
                if (!aiKeywords.test(text)) continue;

                results.push({
                    source: 'hackernews',
                    contentType: 'article',
                    sourceId: story.url,
                    embedUrl: '',
                    title: story.title,
                    caption: `${story.score} points · ${story.descendants || 0} comments on Hacker News`,
                    tags: this.extractTags(story.title),
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
    // ──────────────────────────────────────────────────────────────
    async fetchDevTo(limit = 40): Promise<RawFeedItem[]> {
        const results: RawFeedItem[] = [];
        const queries = ['ai', 'machine-learning', 'llm', 'openai', 'programming', 'webdev'];

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
                    // Deduplicate by URL
                    if (results.some((r) => r.sourceId === article.url)) continue;

                    results.push({
                        source: 'devto',
                        contentType: 'article',
                        sourceId: article.url,
                        embedUrl: '',
                        title: article.title,
                        caption: (article.description || '').slice(0, 300),
                        tags: (article.tag_list || []).slice(0, 5),
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
    // ──────────────────────────────────────────────────────────────
    async fetchLobsters(limit = 40): Promise<RawFeedItem[]> {
        const results: RawFeedItem[] = [];
        try {
            // Lobsters returns the hottest page as JSON (25 items per page)
            const pages = Math.ceil(limit / 25);
            for (let page = 1; page <= pages; page++) {
                if (results.length >= limit) break;

                const res = await fetch(`https://lobste.rs/page/${page}.json`);
                const stories: any[] = await res.json();

                const aiKeywords = /\b(ai|llm|gpt|gemini|claude|openai|machine.?learning|deep.?learning|neural|transformer|diffusion|langchain|rust|go|python|javascript|typescript|programming|software|compiler|database|linux|security|crypto|web|api|framework)\b/i;

                for (const story of stories) {
                    if (results.length >= limit) break;
                    if (!story.url) continue;
                    if (!aiKeywords.test(`${story.title} ${(story.tags || []).join(' ')}`)) continue;

                    results.push({
                        source: 'lobsters',
                        contentType: 'article',
                        sourceId: story.url,
                        embedUrl: '',
                        title: story.title,
                        caption: `${story.score} points · ${story.comment_count || 0} comments on Lobsters`,
                        tags: (story.tags || []).slice(0, 5),
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
    //  FETCH ALL — convenience method that calls all 3
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
