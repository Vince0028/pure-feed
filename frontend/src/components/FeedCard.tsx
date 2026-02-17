import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Youtube, Rss, ExternalLink, ChevronDown, Play, Music, Clock, BookOpen } from "lucide-react";
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
    "They developed their own slang, religion, and social dynamics organically.",
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
    "Next.js for frontend and backend, TailwindCSS for styling.",
    "MongoDB with Mongoose for data, Auth0 for auth, Stripe for payments.",
    "Easy to set up and build high quality projects quickly.",
  ],
  t6: [
    "AI agent capabilities are accelerating faster than expected.",
    "Multiple companies shipped autonomous coding and research agents this month.",
    "The gap between demo and production-ready agents is shrinking fast.",
  ],
  t7: [
    "Voice AI agents can now make outbound phone calls autonomously.",
    "They handle scheduling, customer support, and sales calls.",
    "Latency is under 500ms, making conversations feel natural.",
  ],
  t8: [
    "Use Cursor or Copilot for AI-assisted coding to move faster.",
    "TypeScript plus Next.js covers most full-stack needs.",
    "Automate deployments with Vercel or Railway for instant shipping.",
  ],
  t9: [
    "Compares stacks for web apps, mobile apps, and AI projects.",
    "React plus Node.js dominates web, Swift and Kotlin lead mobile.",
    "Python with PyTorch is the default for machine learning work.",
  ],
  t10: [
    "React Native with Expo handles cross-platform mobile development.",
    "Supabase provides backend, auth, and real-time data out of the box.",
    "PostHog and Sentry handle analytics and error tracking.",
  ],
  t11: [
    "Python, React, TypeScript, Docker, and AWS form the core stack.",
    "Focus on depth over surface knowledge for each technology.",
    "This stack landed multiple software engineering internship offers.",
  ],
  t12: [
    "The agent monitors tasks, processes data, and sends reports 24/7.",
    "Built with OpenClaw on a Mac mini for continuous operation.",
    "Replaced hours of daily manual work with zero human intervention.",
  ],
  t13: [
    "Cursor plus Claude for coding, Vercel for hosting, Supabase for database.",
    "Resend handles email, Fal.ai provides AI model access.",
    "You can launch and validate an idea without spending a dollar on infra.",
  ],
  t14: [
    "OpenAI acquired OpenClaw, a robotics startup focused on dexterous manipulation.",
    "The deal signals OpenAI's push into physical AI beyond software.",
    "OpenClaw's hardware enables robots to handle objects with human-like precision.",
  ],
  t15: [
    "AI agents can now execute trades on crypto markets autonomously.",
    "Platforms are opening up API access for agent-driven trading.",
    "Builders who integrate AI with DeFi protocols will have an advantage.",
  ],
  t16: [
    "Running a real production software stack costs real money monthly.",
    "Cloud hosting, databases, monitoring, and CDN fees add up quickly.",
    "Choosing the right tier for each service keeps costs under control.",
  ],
  t17: [
    "Vibe coding means using AI to generate most of the boilerplate.",
    "Cursor plus Claude handles 80% of repetitive code.",
    "Focus shifts from typing code to reviewing and directing the AI.",
  ],
  t18: [
    "This tech stack landed 4 software engineering intern offers.",
    "JavaScript, Python, React, and SQL cover most interview requirements.",
    "Building projects with these tools proves real competence to employers.",
  ],
  t19: [
    "OpenClaw builds robotic hands with fine motor control for real-world tasks.",
    "OpenAI plans to integrate GPT models directly into robotic systems.",
    "Physical AI agents could handle warehouse, lab, and household tasks.",
  ],
  t20: [
    "Popular technologies have many devs coding in them daily.",
    "Focus on depth in a specific stack rather than learning everything.",
    "The stack includes React, Node, TypeScript, and PostgreSQL.",
  ],
  t21: [
    "Netflix uses Java and Python for backend microservices.",
    "React powers the frontend across web and TV apps.",
    "Custom A/B testing framework drives all product decisions.",
  ],
  t22: [
    "Kixie for calling, HighLevel for CRM, Retell AI for voice agents.",
    "Stripe handles payments, Fellow manages meetings.",
    "The full AI agency tech stack from sales to delivery.",
  ],
  t23: [
    "AI agents are evolving from task executors to decision makers.",
    "They can now evaluate options, weigh tradeoffs, and choose actions.",
    "The most valuable role for agents is judgment, not just execution.",
  ],
  t24: [
    "HubSpot for CRM, Apollo for outreach, Slack for team communication.",
    "These three tools cover most of the tech sales workflow.",
    "Integration between them is key for pipeline efficiency.",
  ],
  t25: [
    "Start with AI receptionist and appointment booking agents.",
    "Use no-code platforms to build MVPs before writing custom code.",
    "Charge monthly retainers for ongoing AI agent management.",
  ],
  t26: [
    "Creative stack includes design tools, video editors, and AI generators.",
    "Figma for design, After Effects for motion, Midjourney for concepts.",
    "The tools you pick shape your creative output speed.",
  ],
  t27: [
    "AI agents and crypto tokens are merging into new platforms.",
    "Autonomous agents can execute on-chain transactions independently.",
    "The intersection creates new business models for builders.",
  ],
  t28: [
    "Not every AI tool is worth adopting for your business.",
    "Focus on tools that solve a real bottleneck, not just trending ones.",
    "The basics like CRM and analytics still matter more than AI hype.",
  ],
  t29: [
    "Gamma for presentations, Google Workspace for docs and email.",
    "Squarespace for the website, ChatGPT for content and strategy.",
    "A lean consulting business needs fewer tools than you think.",
  ],
  t30: [
    "AI agency tools include voice platforms, CRMs, and automation builders.",
    "Start with one service offering before expanding your toolkit.",
    "Client acquisition is harder than the actual AI implementation.",
  ],
  t31: [
    "AI receptionists handle inbound calls without human staff.",
    "Sales agents qualify leads and book meetings automatically.",
    "Some clients deploy all five agent types across their business.",
  ],
  t32: [
    "Wonda handles scripting, voices, editing, and rendering automatically.",
    "It uses multiple AI models chained together for each production step.",
    "Full podcast episodes go from topic to published in under 10 minutes.",
  ],
  t33: [
    "The SaaS runs on a lean stack with minimal monthly costs.",
    "Framework plus database plus hosting covers the essentials.",
    "Keeping the stack simple reduces bugs and deployment complexity.",
  ],
  t34: [
    "Squarespace for web, Collective for finance, iPostal1 for mail.",
    "MotionAI for automation and workflow management.",
    "A non-technical founder can run operations with just four tools.",
  ],
  t35: [
    "Mobile development with a vibe coding approach uses AI assistance.",
    "React Native or Flutter for cross-platform, Cursor for AI pairing.",
    "Ship an MVP mobile app in days instead of months.",
  ],
  t36: [
    "React Native with Expo for the app framework.",
    "Supabase for backend, RevenueCat for subscriptions.",
    "PostHog for analytics, Sentry for crash reporting.",
  ],
  t37: [
    "OpenClaw plus Novi enables agents that generate revenue autonomously.",
    "Set up once and the agents handle tasks while you sleep.",
    "Monetization through AI agent services is becoming viable.",
  ],
  t38: [
    "Different AI tools excel at different tasks.",
    "ChatGPT for writing, Cursor for code, Perplexity for research.",
    "Pick the right tool for each workflow step as an entrepreneur.",
  ],
  t39: [
    "OpenAI recruited a top robotics researcher to lead their agent hardware team.",
    "The hire accelerates their timeline for physical AI products.",
    "Anthropic leads with Claude but OpenAI is closing the gap fast.",
  ],
  t40: [
    "Essential AI and dev tools that every startup should consider.",
    "Automation platforms, AI copilots, and monitoring services.",
    "The right toolset compounds productivity over time.",
  ],
  t41: [
    "Discord bot pulls daily data from Apple Watch, smart scale, and MacroFactor.",
    "Cron jobs trigger the agent to check in and hold you accountable.",
    "Eventually becomes a full Life OS with all health logs in one place.",
  ],
  t42: [
    "OpenAI hired the OpenClaw founder to build physical AI agents.",
    "Jobs in AI are shifting from software-only to hardware plus software.",
    "The move signals a race between OpenAI, Google, and Tesla on embodied AI.",
  ],
  t43: [
    "Laravel plus React provides a fast full-stack development workflow.",
    "Shipping fast is the priority to validate ideas quickly.",
    "No fancy frameworks needed — use what you already know well.",
  ],
  t44: [
    "A solopreneur built a timer app making $25K/month.",
    "Simple product, lean stack, 4,400 paying customers.",
    "No complex frameworks, just tools he already knew.",
  ],
  t45: [
    "OpenClaw agents run tasks autonomously on connected systems.",
    "Integration works with various platforms for end-to-end automation.",
    "Still early but the potential for always-on AI workers is clear.",
  ],
  t46: [
    "Real AI agents build their own plans and recover when things break.",
    "Fake ones just follow your script and stop when they hit a wall.",
    "Ask if it can handle unexpected inputs to test if it's truly autonomous.",
  ],
  t47: [
    "Voice AI agents can do outbound sales and client acquisition.",
    "Testing whether an agent can land a $10K client on its own.",
    "Sales AI is moving from demos to real revenue generation.",
  ],
  t48: [
    "Multiple tech stacks used daily for different project types.",
    "Web, mobile, and backend each have their optimal tool combinations.",
    "Experience with multiple stacks makes you more versatile as a developer.",
  ],
  t49: [
    "Selling AI agents as a service is more scalable than building them in-house.",
    "No dev work needed if you use existing platforms and white-label solutions.",
    "The business model is recurring revenue with minimal ongoing effort.",
  ],
  t50: [
    "AI agent businesses can generate income within the first week.",
    "Start with a niche, build one agent, then expand the offering.",
    "The barrier to entry is lower than most people think.",
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
  a21: [
    "Codex Agent runs in a sandboxed cloud environment to write an test code autonomously.",
    "It solves 78% of SWE-bench tasks end-to-end without human intervention.",
    "Supports full-stack Python, TypeScript, and Go projects.",
  ],
  a22: [
    "Perplexity Enterprise integrates with Confluence, Notion, and internal knowledge bases.",
    "Every answer links back to the original source document for verification.",
    "Role-based access controls keep sensitive corporate data properly scoped.",
  ],
  a23: [
    "RT-3 generalizes across 700+ manipulation tasks with zero-shot transfer.",
    "Trained on 130K robot demonstrations for diverse object handling.",
    "Google plans warehouse and logistics deployment by late 2026.",
  ],
  a24: [
    "AMD MI400 delivers inference within 10% of H100 at 30% lower cost.",
    "Built on TSMC 3nm with 192GB HBM4 memory.",
    "Azure and Oracle Cloud committed to deploying MI400 clusters.",
  ],
  a25: [
    "SmolLM 3 is a 1.7B model that beats GPT-3.5 on MMLU and HumanEval.",
    "Runs at 60 tokens per second on a MacBook Air with no GPU.",
    "Proves data quality can overcome parameter count disadvantages.",
  ],
  a26: [
    "Codestral 2 generates code 3x faster than Code Llama 70B at matching accuracy.",
    "22B parameters with a 256K context window and 80+ language support.",
    "Under 100ms streaming completions when running locally on a single GPU.",
  ],
  a27: [
    "UMG, Sony, and Warner sued Suno and Udio over training on copyrighted recordings.",
    "Labels seek up to $150,000 per work in damages.",
    "The case could set precedent for all generative AI and copyrighted content.",
  ],
  a28: [
    "Transformers cannot reliably solve problems requiring 15+ sequential logical steps.",
    "Attention mechanisms fail to maintain consistent variable bindings in deep reasoning.",
    "Hybrid neuro-symbolic architectures are suggested as a path forward.",
  ],
  a29: [
    "Stripe's AI fraud engine blocked over $5B in fraudulent payments in 12 months.",
    "Analyzes 150+ signals per transaction in under 50ms using transformer ensembles.",
    "False positive rate dropped to 0.3%, reducing legitimate transaction blocks.",
  ],
  a30: [
    "Salesforce, ServiceNow, and Microsoft ship production-ready enterprise AI agents.",
    "Many startups still lack SOC 2 compliance and enterprise-grade reliability.",
    "The demo-to-production gap remains the biggest challenge in enterprise AI.",
  ],
  a31: [
    "AI training and inference consumed 6.6 billion liters of water for cooling in 2025.",
    "A single GPT-5 training run used approximately 3 billion liters.",
    "Microsoft, Google, and Amazon all missed their water sustainability targets.",
  ],
  a32: [
    "Model Context Protocol is now supported by 40+ major tool providers.",
    "Provides a unified interface for AI models to use Stripe, GitHub, and Salesforce.",
    "The protocol is being considered for formal IETF standardization.",
  ],
  a33: [
    "Cloudflare AI Gateway processes over 10 billion LLM API requests daily.",
    "Caching reduces costs by up to 80% for repeated queries.",
    "Intelligent routing selects between models based on latency and cost.",
  ],
  a34: [
    "Nvidia NIM packages optimized models into single-command Docker deployments.",
    "Supports Llama, Mistral, and custom fine-tuned models with automatic batching.",
    "Pre-configured containers include weights, runtime, and API endpoints.",
  ],
  a35: [
    "Sora API generates 1080p videos at $0.10 per second with fine-grained control.",
    "Supports text-to-video, image-to-video, and video-to-video transformations.",
    "Rate limits start at 100 generations per hour on the standard tier.",
  ],
  a36: [
    "pgvector 0.7 delivers 10x faster HNSW index construction and 3x faster queries.",
    "Binary quantization cuts storage by 32x with less than 5% recall loss.",
    "Postgres-native vector search now handles billion-scale embeddings.",
  ],
  a37: [
    "Galaxy S26 runs a 7B parameter model on-device with zero cloud fallback.",
    "Exynos 2600 NPU hits 80 TOPS for real-time inference.",
    "Features include call translation in 16 languages and on-device summarization.",
  ],
  a38: [
    "Deno 2.1 achieves full npm compatibility with zero configuration.",
    "Built-in AI SDK provides a unified interface for OpenAI, Anthropic, and local models.",
    "Edge deploy supports functions in 35 global regions.",
  ],
  a39: [
    "Diffusion model designs novel proteins that have never existed in nature.",
    "Created enzymes that break down microplastics and antibodies for drug-resistant bacteria.",
    "Three designed proteins have entered preclinical testing.",
  ],
  a40: [
    "AWS Bedrock Agents combine foundation models with action groups and guardrails.",
    "Agents autonomously query databases, call APIs, and execute business workflows.",
    "Pay-per-invocation pricing with no minimum commitment.",
  ],
  a41: [
    "AI engineer salaries are 40% higher than traditional software engineering roles.",
    "Manual QA testing roles declined 25% as AI handles routine test generation.",
    "Companies prioritize candidates who can ship AI-integrated products.",
  ],
  a42: [
    "Stable Audio 3 generates 44.1kHz stereo music tracks up to 3 minutes.",
    "Built-in stem separation lets users isolate vocals, drums, bass, and melody.",
    "Licensed for commercial use, competing directly with Suno and Udio.",
  ],
  a43: [
    "Huawei's Ascend 920 achieves 80% of H100 performance on 7nm domestic manufacturing.",
    "Alibaba, Baidu, and Tencent are deploying the chips in their data centers.",
    "The development challenges effectiveness of US export controls on AI chips.",
  ],
  a44: [
    "Replit Agent v2 builds full apps including database, auth, and deployment.",
    "Iterates until all tests pass and the app works end-to-end.",
    "Free users get 5 agent sessions per month.",
  ],
  a45: [
    "KV-cache compression reduces memory usage by 8x with under 1% quality loss.",
    "Makes million-token context windows practical on a single GPU.",
    "Learned quantization preserves the most important attention patterns.",
  ],
  a46: [
    "Adobe Firefly 3 trained only on licensed content with full IP indemnity.",
    "Quality approaches Midjourney v7 while guaranteeing commercial safety.",
    "Integrates natively with Photoshop, Illustrator, and Creative Cloud API.",
  ],
  a47: [
    "Spotify AI DJ generates personalized commentary using listening history and mood.",
    "Available in 50 markets with 25% longer average session length.",
    "The model adapts to time-of-day preferences and individual music taste.",
  ],
  a48: [
    "DBRX 2 has 132B total params, 36B active, trained on 12T enterprise tokens.",
    "Outperforms Llama 3.1 70B on SQL generation and document analysis.",
    "Open license available for self-hosting outside Databricks platform.",
  ],
  a49: [
    "Waymo expanded fully autonomous rides to 10 US cities with no safety driver.",
    "Completed 10 million autonomous miles in 2025 with zero at-fault serious incidents.",
    "Custom transformer model processes lidar, cameras, and radar inputs for driving decisions.",
  ],
  a50: [
    "Figma AI generates complete design systems from uploaded brand guideline PDFs.",
    "Produces color tokens, typography scales, and component libraries with variants.",
    "Cuts design system creation time from weeks to hours.",
  ],
  a51: [
    "Meta's AI cluster comprises over 600,000 GPUs connected by custom network fabric.",
    "The company spent $37B on AI infrastructure in 2025, plans $60B in 2026.",
    "Powers Llama 4 training and recommendation models serving 3 billion users.",
  ],
  a52: [
    "Tailwind v4 Oxide engine replaces PostCSS with a Rust compiler for instant HMR.",
    "Build times drop from seconds to milliseconds with under 5ms hot reload.",
    "Zero-config setup works out of the box with Vite projects.",
  ],
  a53: [
    "Whisper v4 achieves 99% accuracy in English with 200ms streaming latency.",
    "Built-in speaker diarization identifies and labels individual speakers.",
    "Pricing at $0.003 per minute makes it the cheapest high-accuracy transcription API.",
  ],
  a54: [
    "Global AI startup funding was $120B in 2025, doubling 2024 levels.",
    "Foundation model companies raised over $40B combined.",
    "AI infrastructure and developer tooling saw the fastest growth.",
  ],
  a55: [
    "Docker AI Assistant generates Dockerfiles and Compose configs from plain English.",
    "Understands framework best practices for Node.js, Python, Go, and Rust.",
    "Includes proper layer caching, security hardening, and minimal base image selection.",
  ],
  a56: [
    "Spending more compute at inference time consistently improves output quality.",
    "Models generate multiple solutions, verify them, and select the best one.",
    "10x more inference compute yields roughly 2x better accuracy on hard problems.",
  ],
  a57: [
    "Linear AI auto-triages issues by reading descriptions and assigning labels.",
    "Accuracy improves from 70% to 95% within the first month of use.",
    "Detects and links duplicate issues automatically.",
  ],
  a58: [
    "Cloudflare Workers AI runs GPU inference at 300+ edge locations globally.",
    "Under 50ms latency from anywhere for Llama, Stable Diffusion, and Whisper.",
    "Pricing starts at $0.01 per 1,000 tokens for text models.",
  ],
  a59: [
    "DOJ investigates OpenAI and Google for AI market concentration practices.",
    "Probe examines exclusive cloud deals and predatory API pricing strategies.",
    "Microsoft's $13B investment in OpenAI under scrutiny for anticompetitive dependency.",
  ],
  a60: [
    "LangSmith visualizes every prompt, response, and tool call in production AI apps.",
    "Drill into traces for latency breakdowns, token usage, and cost per request.",
    "Automatic regression detection alerts when output quality drops below thresholds.",
  ],
  a61: [
    "Phi-4 is a 14B model matching GPT-4 on graduate-level reasoning benchmarks.",
    "Trained primarily on synthetic reasoning data from larger models.",
    "Runs on a single consumer GPU, ideal for local deployment.",
  ],
  a62: [
    "Copilot code review analyzes PRs with inline bug fix and security suggestions.",
    "Understands full repository context to flag potentially breaking changes.",
    "Catches 30% more issues than human reviewers alone.",
  ],
  a63: [
    "Spotify replaced collaborative filtering with a transformer-based sequential model.",
    "Improved niche artist discovery by 35% and reduced listening fatigue.",
    "Processes 500M recommendation requests daily with 20ms P99 latency.",
  ],
  a64: [
    "AI-powered cyberattacks increased 300% in 2025 including deepfake phishing.",
    "LLM-generated polymorphic malware evades traditional detection methods.",
    "Companies deploying AI defense systems in an emerging AI-versus-AI arms race.",
  ],
  a65: [
    "Rust is replacing C++ for AI inference engines due to memory safety guarantees.",
    "Hugging Face, Mistral, and startups now use Rust for serving runtimes.",
    "Eliminates entire classes of memory bugs that cause production outages.",
  ],
  a66: [
    "Hybrid search combining BM25 with vector similarity improves RAG retrieval quality.",
    "Proper metadata pre-filtering reduces search space by 100x.",
    "Real-time indexing keeps RAG systems current without full re-indexing.",
  ],
  a67: [
    "FDA cleared its 200th AI medical device across radiology, pathology, and cardiology.",
    "AI-assisted radiologists detect cancers 25% more accurately than unassisted physicians.",
    "AI diagnostics becoming standard of care in many hospital systems.",
  ],
  a68: [
    "Next.js 16 makes React Server Components the default with 50% smaller bundles.",
    "Turbopack bundler is now stable and 700x faster than Webpack on large projects.",
    "Partial prerendering combines static and dynamic content in a single request.",
  ],
  a69: [
    "Modal offers serverless H100 GPUs at $0.80/hr with pay-per-second billing.",
    "Zero cold start for cached models with automatic multi-region scaling.",
    "Companies report 5-10x cost savings compared to reserved GPU instances.",
  ],
  a70: [
    "AI tutors matched or exceeded human 1-on-1 tutoring in a 50-school trial.",
    "Students showed 20% greater improvement on standardized tests.",
    "Systems adapt difficulty in real-time with unlimited patience for learners.",
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
  const isArticle = post.contentType === "article";

  /** Highlight tech keywords inside the snippet */
  const highlightKeywords = useMemo(() => {
    if (!post.snippet) return null;
    const keywords = [
      "GPT-5", "GPT-4", "GPT-4o", "Gemini", "Claude", "Llama 4", "Qwen 3",
      "OpenAI", "Anthropic", "Google", "Meta", "Microsoft", "Apple", "Tesla",
      "Nvidia", "TSMC", "Copilot", "Cursor", "Vercel", "LangChain", "LangGraph",
      "PyTorch", "AlphaFold", "Sora", "Stability AI", "Hugging Face",
      "chain-of-thought", "mixture-of-experts", "Mixture of Depths",
      "10 million tokens", "10M token", "500K context", "128K tokens",
      "1000 logical qubits", "1,000 logical qubits",
      "400B", "52B", "3B parameter", "40 TOPS",
      "3nm process", "torch.compile", "Flash Attention",
      "RLHF", "RAG", "transformer", "MoE", "AI agents", "AI Act",
      "2x", "3x", "10x", "40%", "30%", "15%", "400%",
      "$400M", "$4B", "$25,000", "35 million euros", "7%",
      "Apache 2.0", "Phase 1", "Q3 2026", "2027",
      "autonomous", "on-device", "open weights", "open-weight",
      "code execution", "computer-use", "multi-step", "multi-file",
      "inference", "hallucination", "fine-tuning",
    ];
    const escaped = keywords
      .sort((a, b) => b.length - a.length)
      .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const re = new RegExp(`(${escaped.join("|")})`, "gi");
    const parts = post.snippet.split(re);
    return parts.map((part, i) => {
      if (re.test(part)) {
        return (
          <mark
            key={i}
            className="bg-amber-400/15 text-amber-300 rounded-sm px-0.5 font-medium"
          >
            {part}
          </mark>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }, [post.snippet]);

  /** Time-ago string for articles */
  const timeAgo = useMemo(() => {
    const diff = Date.now() - new Date(post.createdAt).getTime();
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }, [post.createdAt]);

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
      ) : isArticle ? (
        /* ──────────────────────────────────────────
           ARTICLE — "Paper" style card
           ────────────────────────────────────────── */
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-background overflow-y-auto scrollbar-hide">
          <div className="w-full max-w-lg mx-auto px-5 py-16 sm:py-20 space-y-5">
            {/* Top meta row: source, time, read time */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-md bg-badge-article/10 border border-badge-article/15 px-2 py-0.5 text-badge-article font-medium">
                <BookOpen className="h-3 w-3" />
                {post.sourceName || "Article"}
              </span>
              <span className="text-foreground/20">·</span>
              <span>{timeAgo}</span>
              {post.readTime && (
                <>
                  <span className="text-foreground/20">·</span>
                  <span className="inline-flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {post.readTime} min read
                  </span>
                </>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-foreground/6 border border-foreground/8 px-2.5 py-0.5 text-[10px] font-medium text-foreground/50 uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title — editorial style */}
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-foreground">
              {post.title}
            </h1>

            {/* Divider */}
            <div className="h-px w-12 bg-badge-article/40" />

            {/* Snippet with keyword highlights */}
            {post.snippet && (
              <p className="text-sm sm:text-base leading-relaxed text-foreground/65 font-light">
                {highlightKeywords}
              </p>
            )}

            {/* Caption / subtitle */}
            {post.caption && (
              <p className="text-xs sm:text-sm text-muted-foreground italic border-l-2 border-badge-article/30 pl-3">
                {post.caption}
              </p>
            )}

            {/* Read full article link */}
            <a
              href={post.sourceId}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border/40 bg-foreground/5 px-4 py-2.5 text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition-all group"
            >
              Read full article
              <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            {/* Summary toggle */}
            <div>
              <button
                onClick={handleToggle}
                disabled={loading}
                className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-foreground/5 backdrop-blur-md px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-foreground/10 disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  {loading ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-foreground/40 border-t-transparent" />
                      Summarizing...
                    </>
                  ) : (
                    "AI Summary — 3 Key Points"
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
                    <ul className="mt-2 space-y-2 rounded-lg border border-border/40 bg-foreground/5 p-4">
                      {summary.map((point, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-foreground/80">
                          <span className="mt-0.5 text-badge-article font-semibold shrink-0">{i + 1}.</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom spacer for the bottom bar */}
            <div className="h-16" />
          </div>
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

      {/* ── Video overlay (gradient + title + summary) — hidden for articles ── */}
      {isVideo && (
        <>
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
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-400">
                  <Play className="h-3 w-3" />
                  Video
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
              <p className="text-sm text-foreground/50 line-clamp-2 hidden sm:block">
                {post.caption}
              </p>
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
        </>
      )}
    </div>
  );
}
