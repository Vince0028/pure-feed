import { FeedPost } from "@/data/mockPosts";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Fetch all posts from the backend feed.
 * Falls back to empty array on error.
 */
export async function fetchFeed(): Promise<FeedPost[]> {
  try {
    const res = await fetch(`${API_BASE}/feed`);
    if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Failed to fetch feed from backend, using mock data:", err);
    return [];
  }
}

/**
 * Trigger the backend to summarize a post.
 * Returns 3 bullet points.
 */
export async function summarizePost(
  title: string,
  content?: string,
  url?: string
): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/summarize`, {
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

/**
 * Trigger the cron fetch pipeline manually.
 */
export async function triggerFetch(): Promise<{
  fetched: number;
  passed: number;
  stored: number;
}> {
  const res = await fetch(`${API_BASE}/cron/fetch-latest`);
  if (!res.ok) throw new Error(`Cron trigger failed: ${res.status}`);
  return await res.json();
}
