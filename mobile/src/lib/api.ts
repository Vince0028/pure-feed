import { supabase } from './supabase';

export type FeedPost = {
    id: string;
    source: "youtube" | "tiktok" | "rss" | "hackernews" | "devto" | "lobsters";
    sourceId: string;
    sourceName?: string;
    title: string;
    snippet?: string;
    caption?: string;
    url?: string;
    embedUrl?: string;
    createdAt: string;
    fameScore: number;
    tags: string[];
    contentType: "video" | "short" | "article";
    readTime?: number;
    summary?: string[];
};

function standardizeTags(tags: any): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
        try { return JSON.parse(tags); } catch { return tags.split(',').map(t => t.trim()); }
    }
    return [];
}

export async function fetchFeed(): Promise<FeedPost[]> {
    try {
        // Fetch top 50 articles
        const { data: articlesData, error: articlesError } = await supabase
            .from('posts')
            .select('*')
            .eq('contentType', 'article')
            .order('fameScore', { ascending: false })
            .limit(50);

        if (articlesError) {
            console.error('Error fetching articles:', articlesError);
        }

        // Fetch top 50 videos and shorts
        const { data: videosData, error: videosError } = await supabase
            .from('posts')
            .select('*')
            .neq('contentType', 'article')
            .order('createdAt', { ascending: false })
            .limit(50);

        if (videosError) {
            console.error('Error fetching videos:', videosError);
        }

        const combinedData = [...(articlesData || []), ...(videosData || [])];

        const posts: FeedPost[] = combinedData.map(dbItem => ({
            id: dbItem.id,
            source: dbItem.source,
            sourceId: dbItem.sourceId,
            sourceName: dbItem.sourceName,
            title: dbItem.title,
            snippet: dbItem.snippet, // Keep the original snippet!
            caption: dbItem.caption,
            url: dbItem.url,
            embedUrl: dbItem.embedUrl,
            createdAt: dbItem.createdAt,
            fameScore: dbItem.fameScore || 50,
            tags: standardizeTags(dbItem.tags),
            contentType: dbItem.contentType,
            readTime: dbItem.readTime,
            summary: dbItem.summary
        }));

        const articles = posts.filter(p => p.contentType === 'article');
        const videos = posts.filter(p => p.contentType !== 'article');

        // Sort exactly like the backend does:
        // Articles by fameScore
        articles.sort((a, b) => b.fameScore - a.fameScore);

        // Videos by recency
        videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return [...articles, ...videos];
    } catch (err) {
        console.warn("Failed to fetch feed from backend, using mock data:", err);
        return [];
    }
}

/**
 * Trigger the backend to summarize a post remotely from the React Native app.
 * Returns 3 bullet points.
 */
export async function summarizePost(
    title: string,
    content?: string,
    url?: string
): Promise<string[]> {
    try {
        // 192.168.0.154 is the local network IP so Expo Go can reach the Node backend
        const HOST = '192.168.0.154';
        const res = await fetch(`http://${HOST}:3001/api/summarize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, url }),
        });
        if (!res.ok) throw new Error(`Summarize failed: ${res.status}`);
        const data = await res.json();
        return data.summary;
    } catch (err) {
        console.warn("Backend summarization failed:", err);
        return [];
    }
}
