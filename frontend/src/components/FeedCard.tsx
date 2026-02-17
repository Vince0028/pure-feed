import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Youtube, Rss, ExternalLink, ChevronDown, Play, Music } from "lucide-react";
import { FeedPost } from "@/data/mockPosts";
import { summarizePost } from "@/lib/api";

const mockSummaries: Record<string, string[]> = {
  // ── Shorts ──
  s1: [
    "GPT-5 adds native chain-of-thought reasoning and multimodal input.",
    "Tool-use loop lets it browse, code, and run multi-step tasks autonomously.",
    "Developers get a unified API instead of juggling separate vision and text models.",
  ],
  s2: [
    "Gemini handles longer context and grounded search with sources.",
    "ChatGPT is still stronger at creative writing and conversation.",
    "For coding, both are close but Gemini's code execution sandbox gives it an edge.",
  ],
  s3: [
    "Uses Cursor for code, ChatGPT for writing, and Perplexity for research.",
    "AI handles the first draft, human reviews and refines.",
    "Saves roughly 3 hours per day on repetitive tasks.",
  ],
  s4: [
    "TypeScript adds static types on top of JavaScript.",
    "Catches bugs at compile time instead of runtime.",
    "Dominant in modern frontend and backend Node.js projects.",
  ],
  s5: [
    "Cursor's agent mode generates full features from a single prompt.",
    "Multi-file editing and context awareness set it apart from Copilot.",
    "Free tier gives 50 agent requests per month.",
  ],
  s6: [
    "React uses a virtual DOM to efficiently update the real DOM.",
    "Components, props, and state are the three core concepts.",
    "Hooks replaced class components as the standard pattern.",
  ],
  s7: [
    "Nvidia controls 80%+ of the AI training chip market.",
    "Data center revenue grew 400% year-over-year driven by H100 demand.",
    "B300 chips are already sold out through 2027.",
  ],
  s8: [
    "AI engineer roles pay 30-50% more than traditional software roles.",
    "Core skills needed: Python, PyTorch, LLM APIs, and RAG pipelines.",
    "Companies want people who can ship AI products, not just train models.",
  ],
  s9: [
    "ElevenLabs can clone any voice from a 10-second sample.",
    "Used for dubbing, audiobooks, and accessibility tools.",
    "Raises serious concerns about deepfake audio and scams.",
  ],
  s10: [
    "Cursor is fastest for full-feature scaffolding from a prompt.",
    "Copilot integrates tighter into VS Code but generates less complete code.",
    "Claude Code handles complex refactors better than both.",
  ],
  s11: [
    "RAG retrieves relevant docs from a vector database before generating.",
    "Cuts hallucination by grounding the model in real source material.",
    "Most production AI apps use RAG instead of fine-tuning.",
  ],
  s12: [
    "Docker packages apps into containers that run the same everywhere.",
    "Images are built from Dockerfiles and stored in registries.",
    "Compose runs multi-container setups with one YAML file.",
  ],
  s13: [
    "Suno generates full songs with vocals, instruments, and lyrics from text.",
    "Quality jumped massively between v3 and v4.",
    "Free tier gives 5 songs per day, enough to experiment.",
  ],
  s14: [
    "Rust guarantees memory safety at compile time without garbage collection.",
    "Ownership and borrowing replace manual memory management.",
    "Used in browsers, game engines, and CLI tools where speed matters.",
  ],
  s15: [
    "Midjourney v7 output is nearly indistinguishable from real photos.",
    "Prompt engineering matters less now, the model infers intent better.",
    "Still no API access, Discord-only workflow.",
  ],
  s16: [
    "Next.js adds SSR and static generation on top of React.",
    "API routes let you build backend endpoints inside your frontend.",
    "App Router uses React Server Components by default.",
  ],
  s17: [
    "Apple Intelligence runs a 3B parameter model entirely on-device.",
    "No data leaves the phone for Siri, search, or summarization.",
    "Writing tools and image generation work offline.",
  ],
  s18: [
    "Python is the most popular language for AI, data science, and scripting.",
    "Simple syntax makes it fast to prototype.",
    "Ecosystem: NumPy, Pandas, PyTorch, FastAPI.",
  ],
  s19: [
    "Tesla Optimus Gen 3 walks, picks objects, and navigates warehouses.",
    "Target manufacturing cost is $25,000 per unit.",
    "Tesla plans 10,000 units deployed in its own factories by end of 2026.",
  ],
  s20: [
    "Git tracks every change to your codebase with snapshots.",
    "Branches let teams work in parallel without conflicts.",
    "Merge, rebase, and cherry-pick control how changes combine.",
  ],

  // ── TikTok Shorts ──
  t1: [
    "AI agents on Moltbook post, comment, and interact without human input.",
    "They developed their own slang and social dynamics organically.",
    "The experiment shows emergent behavior at scale with LLM-powered agents.",
  ],
  t2: [
    "Use a framework like LangChain or CrewAI to define your agent.",
    "Connect it to tools like web search, code execution, or APIs.",
    "Deploy it in under 60 seconds with a simple Python script.",
  ],
  t3: [
    "Moltbook agents started creating shared beliefs and rituals.",
    "Some formed groups around specific topics and excluded outsiders.",
    "Researchers see parallels to how human cultures emerge.",
  ],
  t4: [
    "An AI agent is software that perceives its environment and takes actions.",
    "It uses an LLM as its reasoning engine to decide what to do next.",
    "Agents can use tools, browse the web, and complete multi-step tasks.",
  ],
  t5: [
    "Voice AI agents can now make outbound phone calls autonomously.",
    "They handle scheduling, customer support, and sales calls.",
    "Latency is under 500ms, making conversations feel natural.",
  ],
  t6: [
    "AI agent capabilities are accelerating faster than expected.",
    "Multiple companies shipped autonomous coding and research agents this month.",
    "The gap between demo and production-ready agents is shrinking fast.",
  ],
  t7: [
    "The agent monitors tasks, processes data, and sends reports 24/7.",
    "Built with Python, LangChain, and a scheduler for continuous operation.",
    "Replaced 3 hours of daily manual work with zero human intervention.",
  ],
  t8: [
    "OpenAI acquired OpenClaw, a robotics startup focused on dexterous manipulation.",
    "The deal signals OpenAI's push into physical AI beyond software.",
    "OpenClaw's hardware enables robots to handle objects with human-like precision.",
  ],
  t9: [
    "React or Next.js for frontend, Node or Python for backend.",
    "PostgreSQL for data, Redis for caching, Docker for deployment.",
    "Tailwind CSS and TypeScript are now considered essentials.",
  ],
  t10: [
    "Use Cursor or Copilot for AI-assisted coding to move faster.",
    "TypeScript plus Next.js covers most full-stack needs.",
    "Automate deployments with Vercel or Railway for instant shipping.",
  ],
  t11: [
    "Next.js, Supabase, and Vercel give you a full SaaS stack for free.",
    "Stripe handles payments with no upfront cost.",
    "You can launch and validate an idea without spending a dollar on infra.",
  ],
  t12: [
    "Vibe coding means using AI to generate most of the boilerplate.",
    "Cursor plus Claude handles 80% of repetitive code.",
    "Focus shifts from typing code to reviewing and directing the AI.",
  ],
  t13: [
    "OpenClaw builds robotic hands with fine motor control for real-world tasks.",
    "OpenAI plans to integrate GPT models directly into robotic systems.",
    "Physical AI agents could handle warehouse, lab, and household tasks.",
  ],
  t14: [
    "The agent writes scripts, generates voiceover, and edits video automatically.",
    "It uses multiple AI models chained together for each production step.",
    "Full podcast episodes go from topic to published in under 10 minutes.",
  ],
  t15: [
    "OpenAI recruited a top robotics researcher to lead their agent hardware team.",
    "The hire accelerates their timeline for physical AI products.",
    "Competitors like Google and Tesla are also racing to build embodied agents.",
  ],

  // ── Videos ──
  v1: [
    "Neural networks are layers of interconnected nodes loosely inspired by the brain.",
    "Each connection has a weight that adjusts during training.",
    "Deep learning just means more hidden layers stacked together.",
  ],
  v2: [
    "Gradient descent finds the minimum of the loss function by following the slope.",
    "Learning rate controls how big each step is.",
    "Stochastic gradient descent uses mini-batches for faster training.",
  ],
  v3: [
    "Backpropagation computes how much each weight contributed to the error.",
    "Chain rule from calculus propagates gradients backward through layers.",
    "This is the core algorithm that makes neural network training possible.",
  ],
  v4: [
    "Makemore builds character-level language models step by step.",
    "Starts with bigrams, then scales to MLPs and transformers.",
    "Great intro to how LLM training actually works under the hood.",
  ],
  v5: [
    "Karpathy builds a GPT from an empty Python file to a working model.",
    "Covers tokenization, embeddings, attention, and text generation.",
    "Uses the same architecture as GPT-2 but trained on Shakespeare.",
  ],
  v6: [
    "BPE tokenization merges frequent character pairs into tokens.",
    "Vocabulary size directly affects model performance and speed.",
    "Tokenization bugs cause most weird LLM behavior with numbers and code.",
  ],
  v7: [
    "Self-attention lets every token look at every other token in the sequence.",
    "Query, key, value matrices compute relevance scores between words.",
    "Multi-head attention captures different types of relationships in parallel.",
  ],
  v8: [
    "Covers every major language, framework, and cloud tool a dev needs in 2026.",
    "Recommends TypeScript, React, and Go as the core stack.",
    "DevOps, AI tools, and system design are must-haves for senior roles.",
  ],
  v9: [
    "Covers HTTP, DNS, APIs, databases, auth, and dozens more web concepts.",
    "Each one explained in a few seconds with visual examples.",
    "Good refresher for interviews or filling knowledge gaps.",
  ],
  v10: [
    "Built a real-time AI meeting summarizer at a hackathon using GPT-4o.",
    "Stack: Next.js frontend, WebSocket transcription, vector DB for context.",
    "Won Best AI Track for polished UX and fast response time.",
  ],
  v11: [
    "Transformers process entire sequences in parallel instead of one token at a time.",
    "Positional encoding tells the model where each token sits in the sequence.",
    "Layer normalization and residual connections keep deep networks stable.",
  ],
  v12: [
    "Vectors are arrows with magnitude and direction in space.",
    "Matrices transform vectors: rotate, scale, shear, project.",
    "Eigenvalues reveal the axes along which a transformation stretches.",
  ],
  v13: [
    "RAG retrieves relevant docs from a vector database before generating.",
    "Cuts hallucination by grounding the model in real source material.",
    "Most production AI apps use RAG instead of fine-tuning.",
  ],
  v14: [
    "Cursor is the fastest for full-feature scaffolding from a prompt.",
    "Copilot integrates tighter into VS Code but generates less complete code.",
    "Claude Code handles complex refactors better than both.",
  ],
  v15: [
    "Backpropagation calculus shows exactly how each weight affects the loss.",
    "Partial derivatives chain together through every layer.",
    "Understanding this makes debugging training issues much easier.",
  ],
  v16: [
    "Diffusion models add noise to images then learn to reverse the process.",
    "U-Net architecture predicts the noise at each denoising step.",
    "Text conditioning via CLIP embeddings guides what the model generates.",
  ],
  v17: [
    "Chess engine uses minimax search with alpha-beta pruning.",
    "Neural network evaluates board positions instead of handcrafted heuristics.",
    "Training against itself for millions of games produces strong play.",
  ],
  v18: [
    "LLMs work by predicting the next token given all previous tokens.",
    "Embeddings convert words to vectors in high-dimensional space.",
    "Temperature and top-p sampling control how creative the output is.",
  ],
  v19: [
    "Zero-shot prompting gives the model a task with no examples.",
    "Few-shot adds examples to guide the output format and style.",
    "Chain-of-thought prompting makes the model show its reasoning steps.",
  ],
  v20: [
    "RLHF trains a reward model on human preferences then optimizes against it.",
    "Instruction tuning makes base models follow user prompts.",
    "Safety training reduces harmful outputs without killing usefulness.",
  ],

  // ── Articles ──
  a1: [
    "GPT-5 has built-in chain-of-thought reasoning with 3x better math scores.",
    "Single vision encoder handles images, video, and documents together.",
    "New tool-use loop lets GPT-5 browse the web, write code, and run multi-step tasks.",
  ],
  a2: [
    "Gemini 3 Pro handles 10 million tokens of context, enough for entire codebases.",
    "Built-in code execution sandbox lets the model run and debug code during inference.",
    "Grounded search pulls real-time web data with sources, cutting hallucination by 40%.",
  ],
  a3: [
    "Claude 4 extended thinking lets it reason for up to 128K tokens before answering.",
    "Computer-use tool lets Claude click buttons, fill forms, and navigate UIs.",
    "500K context window. 30% faster than Claude 3.5 Sonnet.",
  ],
  a4: [
    "B300 doubles inference throughput compared to H100 at half the power draw.",
    "Targets AI data centers running large model inference at scale.",
    "Expected to ship Q3 2026 with major cloud provider partnerships.",
  ],
  a5: [
    "Copilot agents handle multi-step workflows across Office 365 and Azure.",
    "Can book meetings, draft reports, and trigger CI/CD pipelines autonomously.",
    "Enterprise customers get audit logs and policy controls for agent actions.",
  ],
  a6: [
    "Google hit 1000 logical qubits with error correction below the surface code threshold.",
    "Successor to the Willow chip announced in late 2024.",
    "Still years away from practical quantum advantage for most workloads.",
  ],
  a7: [
    "LangGraph v2 adds built-in persistence so agents can resume across sessions.",
    "Human-in-the-loop nodes let users approve or correct agent decisions.",
    "Multi-agent coordination runs parallel tool calls across specialized agents.",
  ],
  a8: [
    "New leaderboard benchmarks test reasoning, code generation, and instruction following.",
    "Llama 4 and Qwen 3 trade the top spot depending on the eval category.",
    "Open models are closing the gap with proprietary ones fast.",
  ],
  a9: [
    "Stability AI's model generates 30-second 1080p clips from text prompts.",
    "Weights released under Apache 2.0 for commercial use.",
    "Quality approaches Sora on simple scenes but struggles with complex motion.",
  ],
  a10: [
    "All Siri processing now runs on-chip with a 3B parameter local model.",
    "No data leaves the device for voice commands, search, or summarization.",
    "A19 Pro neural engine runs 40 TOPS for real-time inference.",
  ],
  a11: [
    "Cursor hit 2M daily active developers after raising $400M.",
    "Plans to build autonomous multi-file coding that handles full features.",
    "Valuation jumped from $400M to $4B in one year.",
  ],
  a12: [
    "Mixture of Depths lets tokens skip layers they don't need.",
    "Reduces inference compute by 40% with almost no quality drop.",
    "Could make large models viable on consumer hardware.",
  ],
  a13: [
    "v0 agents generate frontend, backend, database schema, and deploy in one prompt.",
    "Uses Next.js App Router, Drizzle ORM, and Vercel Postgres under the hood.",
    "Free tier includes 10 agent runs per month.",
  ],
  a14: [
    "TSMC fabs are fully booked through 2027 for AI chip production.",
    "Nvidia H200 and B300 lead times stretch to 9 months.",
    "Cloud providers are stockpiling GPUs to lock in capacity.",
  ],
  a15: [
    "Llama 4 uses mixture-of-experts with 400B total parameters, 52B active.",
    "Outperforms GPT-4 on code generation and multilingual benchmarks.",
    "Fully open weights under a permissive license for commercial use.",
  ],
  a16: [
    "Copilot Workspace turns a GitHub issue into a working PR with multi-file edits.",
    "Generates a plan, implements changes, runs CI, and requests review.",
    "Available for GitHub Enterprise and Teams plans.",
  ],
  a17: [
    "Optimus Gen 3 handles warehouse picking, packing, and logistics tasks.",
    "Tesla plans to deploy 10,000 units across its own factories by end of 2026.",
    "Each unit costs about $25,000 to manufacture at current scale.",
  ],
  a18: [
    "AlphaFold 3 identified a novel compound targeting a previously undruggable protein.",
    "The candidate is now in Phase 1 clinical trials for pancreatic cancer.",
    "Structure prediction accuracy improved 15% over AlphaFold 2.",
  ],
  a19: [
    "EU AI Act high-risk classifications now apply to healthcare and hiring AI.",
    "Companies must complete conformity assessments and maintain audit trails.",
    "Fines up to 35 million euros or 7% of global revenue for violations.",
  ],
  a20: [
    "torch.compile is now the default execution mode in PyTorch 3.0.",
    "Distributed training setup reduced from 100 lines of boilerplate to 3.",
    "New memory-efficient attention is built into core, no external libraries needed.",
  ],
};

interface FeedCardProps {
  post: FeedPost;
  isActive: boolean;
}

export function FeedCard({ post, isActive }: FeedCardProps) {
  const [summary, setSummary] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Auto-close summary when leaving this card
  useEffect(() => {
    if (!isActive) {
      setOpen(false);
    }
  }, [isActive]);

  const handleToggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (summary) return; // already fetched
    setLoading(true);
    const backendSummary = await summarizePost(post.title, post.caption);
    if (backendSummary.length > 0) {
      setSummary(backendSummary);
    } else {
      await new Promise((r) => setTimeout(r, 1500));
      setSummary(mockSummaries[post.id] || ["No summary available."]);
    }
    setLoading(false);
  };

  const isVideo = post.contentType === "short" || post.contentType === "video";
  const isShort = post.contentType === "short";

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Video background / Article visual */}
      {isVideo ? (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
          <iframe
            src={isActive ? (post.source === "tiktok" ? post.embedUrl : `${post.embedUrl}?autoplay=0&rel=0&loop=1`) : undefined}
            title={post.title}
            className={
              isShort
                ? "h-full w-full max-w-[400px] sm:max-w-[450px] aspect-[9/16] rounded-lg"
                : "w-full max-w-[800px] aspect-video rounded-lg"
            }
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4 px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-badge-article/10 border border-badge-article/20">
              <Rss className="h-8 w-8 text-badge-article" />
            </div>
            <p className="text-lg font-medium text-muted-foreground max-w-md">Article</p>
          </div>
        </div>
      )}

      {/* Gradient overlay — only bottom portion so video stays visible */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] sm:h-[50%] bg-gradient-to-t from-background via-background/70 to-transparent z-10 pointer-events-none" />

      {/* Content overlay — pinned to bottom, above the bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-14 sm:pb-16 sm:px-5 space-y-2 sm:space-y-3 max-w-lg pointer-events-none">
        {/* Source badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {isShort && post.source === "tiktok" ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/15 px-2 py-0.5 text-[11px] font-medium text-cyan-400">
              <Music className="h-3 w-3" />
              TikTok
            </span>
          ) : isShort ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-400">
              <Youtube className="h-3 w-3" />
              Short
            </span>
          ) : post.contentType === "video" ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-400">
              <Play className="h-3 w-3" />
              Video
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-foreground/10 px-2 py-0.5 text-[11px] font-medium text-foreground/60">
              <Rss className="h-3 w-3" />
              Article
            </span>
          )}
          {post.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-foreground/8 px-1.5 py-0.5 text-[10px] text-foreground/50"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-semibold leading-tight text-foreground">
          {post.title}
        </h2>

        {/* Caption — hidden on very small screens for video to save space */}
        {post.caption && (
          <p className={`text-sm text-foreground/50 line-clamp-2 ${isVideo ? "hidden sm:block" : ""}`}>
            {post.caption}
          </p>
        )}

        {/* Article link */}
        {!isVideo && (
          <a
            href={post.sourceId}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition-colors pointer-events-auto"
          >
            Read full article <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        {/* Summary toggle */}
        <div className="pointer-events-auto">
          <button
            onClick={handleToggle}
            disabled={loading}
            className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-background/70 backdrop-blur-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary/60 disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-foreground/40 border-t-transparent" />
                  Summarizing...
                </>
              ) : (
                "Summarize"
              )}
            </span>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.span>
          </button>

          <AnimatePresence>
            {open && summary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <ul className="mt-2 space-y-1.5 rounded-lg border border-border/40 bg-background/70 backdrop-blur-md p-3">
                  {summary.map((point, i) => (
                    <li key={i} className="flex gap-2 text-xs sm:text-sm text-foreground/80">
                      <span className="mt-0.5 text-muted-foreground shrink-0">{i + 1}.</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
