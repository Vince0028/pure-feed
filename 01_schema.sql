-- NoFluff.ai Supabase Schema

-- 1. Create the posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sourceId" TEXT UNIQUE NOT NULL,
    "embedUrl" TEXT,
    title TEXT NOT NULL,
    caption TEXT,
    snippet TEXT,
    "sourceName" TEXT,
    "readTime" INTEGER,
    tags TEXT[] DEFAULT '{}',
    "fameScore" INTEGER DEFAULT 50,
    "isTechFluff" BOOLEAN DEFAULT false,
    summary TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create indexes for fast querying
CREATE INDEX idx_posts_content_type ON posts ("contentType");
CREATE INDEX idx_posts_fame_score ON posts ("fameScore" DESC);
CREATE INDEX idx_posts_created_at ON posts ("createdAt" DESC);

-- 3. Set up Row Level Security (RLS)
-- Enable RLS so the frontend/API only has access to allowed operations
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (anyone can fetch the feed)
CREATE POLICY "Allow public read access" 
ON posts FOR SELECT 
USING (true);

-- Allow anonymous insert access (the backend cron job runs as anon)
CREATE POLICY "Allow public insert access" 
ON posts FOR INSERT 
WITH CHECK (true);

-- Allow anonymous update access (for the backend summarizer)
CREATE POLICY "Allow public update access" 
ON posts FOR UPDATE 
USING (true);
