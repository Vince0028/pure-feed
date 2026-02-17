import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Youtube, Rss, ExternalLink, Clock } from "lucide-react";
import { FeedPost } from "@/data/mockPosts";
import { formatDistanceToNow } from "date-fns";

const mockSummaries: Record<string, string[]> = {
  "1": [
    "Neural networks are layers of interconnected neurons that learn by adjusting weights through backpropagation.",
    "ReLU activation functions introduce non-linearity, enabling the network to learn complex patterns.",
    "A 784→16→16→10 architecture can classify handwritten digits with high accuracy.",
  ],
  "2": [
    "GPT-5 features native chain-of-thought reasoning without separate prompting — 3x improvement on MATH benchmarks.",
    "Built-in vision encoder handles images, video, and documents in a single forward pass.",
    "New agentic tool-use loop allows GPT-5 to autonomously browse, code, and execute multi-step tasks.",
  ],
  "3": [
    "Self-attention computes Query, Key, Value matrices to determine which tokens attend to which.",
    "Multi-head attention runs parallel attention operations, each learning different relationship patterns.",
    "Positional encoding injects sequence order information since attention is permutation-invariant.",
  ],
  "4": [
    "Gemini 3 Pro supports 10 million token context — processes entire codebases and book-length documents.",
    "Native code execution sandbox lets the model write, run, and debug code within the inference loop.",
    "Grounded search retrieves real-time web data with citations, reducing hallucination by 40%.",
  ],
  "5": [
    "Character-level bigram model predicts next characters using a simple lookup table of probabilities.",
    "Adding an MLP with embedding layers dramatically improves generation quality over pure bigrams.",
    "Loss function uses cross-entropy; training loop iterates over mini-batches with AdamW optimizer.",
  ],
  "6": [
    "Extended thinking mode allows Claude 4 to reason for up to 128K tokens before responding.",
    "Computer-use tool enables Claude to navigate GUIs, click elements, and fill forms autonomously.",
    "500K context window handles massive documents; 30% faster inference than Claude 3.5 Sonnet.",
  ],
};

interface MediaCardProps {
  post: FeedPost;
  index: number;
}

export function MediaCard({ post, index }: MediaCardProps) {
  const [summary, setSummary] = useState<string[] | null>(post.summary || null);
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setSummary(mockSummaries[post.id] || ["No summary available."]);
    setLoading(false);
  };

  const isVideo = post.source === "youtube";
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors duration-300"
    >
      {/* Video Embed */}
      {isVideo && (
        <div className="relative aspect-video w-full bg-secondary">
          <iframe
            src={post.embedUrl}
            title={post.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Source badge + time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isVideo ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-badge-video/10 px-2 py-0.5 text-[11px] font-medium text-badge-video">
                <Youtube className="h-3 w-3" />
                YouTube
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-badge-article/10 px-2 py-0.5 text-[11px] font-medium text-badge-article">
                <Rss className="h-3 w-3" />
                Article
              </span>
            )}
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-mono text-primary/70"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
          {post.title}
        </h3>

        {/* Caption */}
        {post.caption && (
          <p className="text-xs text-muted-foreground line-clamp-2">{post.caption}</p>
        )}

        {/* Article link */}
        {!isVideo && (
          <a
            href={post.sourceId}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Read full article <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {/* Summary / Summarize Button */}
        <AnimatePresence mode="wait">
          {summary ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-3"
            >
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-primary">
                ⚡ TL;DR
              </span>
              <ul className="space-y-1.5">
                {summary.map((point, i) => (
                  <li key={i} className="flex gap-2 text-xs text-foreground/90">
                    <span className="mt-0.5 text-primary font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.button
              key="button"
              onClick={handleSummarize}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/10 hover:glow-primary disabled:opacity-50"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Analyzing...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Skip the Fluff — Summarize
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
