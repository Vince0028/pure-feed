import { FeedPost } from "@/data/mockPosts";
import { createClient } from '@supabase/supabase-js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// Initialize Supabase client for direct database fetching
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Only create client if values exist, otherwise the app crashes on load with missing env vars
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Fetch all posts safely from Supabase (vypassing the sleepy Render backend!)
 * Falls back to empty array on error.
 */
export async function fetchFeed(): Promise<FeedPost[]> {
  try {
    if (!supabase) {
      console.error("Missing Supabase Env Variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.");
      return [];
    }
    // 1. Ask Supabase directly instead of Render API!
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(2000);

    if (error) {
      console.warn("Supabase fetch error, trying backend route...", error);
      // Fallback to backend immediately if Supabase fails for any reason
      const res = await fetch(`${API_BASE}/feed`, { cache: "no-store" });
      return await res.json();
    }

    if (!data) return [];
    
    // Sort logic just like the backend used to do
    const posts = data as FeedPost[];
    const articles = posts.filter(p => p.contentType === 'article');
    const videos = posts.filter(p => p.contentType !== 'article');

    articles.sort((a, b) => (b.fameScore || 50) - (a.fameScore || 50));
    videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return [...articles, ...videos];

  } catch (err) {
    console.warn("Failed to fetch feed entirely, using mock data:", err);
    return [];
  }
}

/**
 * Trigger Vercel Serverless Function to summarize a post.
 * Returns 3 bullet points.
 */
export async function summarizePost(
  title: string,
  content?: string,
  url?: string
): Promise<string[]> {
  try {
    const res = await fetch(`/api/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, url }),
    });
    if (!res.ok) throw new Error(`Summarize failed: ${res.status}`);
    const data = await res.json();
    return data.summary;
  } catch (err) {
    console.warn("Vercel summarization failed:", err);
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
