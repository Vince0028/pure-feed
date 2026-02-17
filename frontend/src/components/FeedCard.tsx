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

  t51: [
    "this is what the fastest coder in the world looks like 🤯 #coding #typing #keybo.",
    "By @leonsilicon — 6700K views.",
    "Duration: 12s. Coding.",
  ],
  t52: [
    "I always thought coding was kinda boring—until I found this site that actually m.",
    "By @shigcodes — 6400K views.",
    "Duration: 9s. Coding, Tutorial.",
  ],
  t53: [
    "How to start coding with Zero Knowledge Starting your coding journey can feel co.",
    "By @thom.code — 5400K views.",
    "Duration: 138s. Coding, Career, Tutorial.",
  ],
  t54: [
    "when you are a programmer...😂 #programmer #programmingmemes #coding #softwareen.",
    "By @software__engineer — 5400K views.",
    "Duration: 39s. Coding, Career.",
  ],
  t55: [
    "or rage quit coding with me #coding #csmajors #codinglife #techtok #studygram.",
    "By @gazi.ai — 3900K views.",
    "Duration: 43s. Coding.",
  ],
  t56: [
    "My AI crushing this musical dance 🔥 Generated with [Tool] – who’s joining? 👀 #.",
    "By @nyloncouture.ai — 3700K views.",
    "Duration: 14s. AI.",
  ],
  t57: [
    "You’re a Software Engineer and can’t work from home anymore True story, I was on.",
    "By @andrewcodesmith — 2000K views.",
    "Duration: 62s. Coding, Career.",
  ],
  t58: [
    "Typed ‘Hello World’, now I control the matrix 🧠💀 #codingmemes #programming#c++.",
    "By @mz.devs — 2000K views.",
    "Duration: 9s. Coding.",
  ],
  t59: [
    "Python Edit || #edit #fyp #programming #code #python.",
    "By @hxthuyeen.kuzze — 1800K views.",
    "Duration: 18s. Coding, Python.",
  ],
  t60: [
    "She was crying😎 #programming #coding #computerscience #csmajor.",
    "By @thecodingpad — 1800K views.",
    "Duration: 12s. Coding.",
  ],
  t61: [
    "Who hoping on tictac #compsci #java #codinglife #collegelife #calculus #coding #.",
    "By @kazytho_ — 1600K views.",
    "Duration: 19s. Coding.",
  ],
  t62: [
    "I post about AI every day… This is the biggest news yet. the first time I opened.",
    "By @ava.on.ai — 1300K views.",
    "Duration: 305s. AI, Coding, AI Tools.",
  ],
  t63: [
    "10 types of Programmers and what they do. The term “programmer” is literally so .",
    "By @lewismenelaws — 987K views.",
    "Duration: 154s. Coding.",
  ],
  t64: [
    "Tutorial ⬇️ This entire video was made with AI — a hyper-realistic image generat.",
    "By @ineffable.ai22 — 837K views.",
    "Duration: 9s. AI, AI Tools, Mobile Dev.",
  ],
  t65: [
    "How is ChatGPT 5 different.. #carterpcs #tech #techtok #ai #gpt5.",
    "By @carterpcs — 792K views.",
    "Duration: 47s. AI, AI Tools, GPT-5.",
  ],
  t66: [
    "What do software engineers do? Find out in Ep. 1 of Demystifying Software Engine.",
    "By @allenvert — 677K views.",
    "Duration: 61s. Coding, Career.",
  ],
  t67: [
    "Thoughts on emerging tech? I also learned some vocab words like “AgenticAI” whic.",
    "By @underthedesknews — 580K views.",
    "Duration: 177s. AI, AI Agents, Tutorial.",
  ],
  t68: [
    "Google 7 New AI Tools You Should Be Using Wait Until The End #GoogleAI #AITools .",
    "By @benkimball.ai — 544K views.",
    "Duration: 77s. AI, AI Tools, Google.",
  ],
  t69: [
    "Replying to @Reynan Vieira The path to building a SaaS is not clear in public or.",
    "By @saasgod — 432K views.",
    "Duration: 131s. Coding, Startup, Career.",
  ],
  t70: [
    "Clustering in real life is scary #ai #datascience #machinelearning #stem #cluste.",
    "By @piluladedados — 429K views.",
    "Duration: 8s. AI, ML, Tutorial.",
  ],
  t71: [
    "# Merge mindset → main #developersoftiktok #devtok #coding #universe #yougotthis.",
    "By @microsoftdeveloper — 397K views.",
    "Duration: 13s. Coding.",
  ],
  t72: [
    "Feel free to message me if you have questions n I’ll help you out 💖 #howto #goo.",
    "By @cali.gurl444 — 388K views.",
    "Duration: 34s. AI Tools, Google.",
  ],
  t73: [
    "Learn Python in 1 hour! 🐍 #coding #programming #python (00:00:00) intro to pyth.",
    "By @truebrocode — 380K views.",
    "Duration: 3600s. Coding, Python, Tutorial.",
  ],
  t74: [
    "This is crazy! 🤯 Should I sell? (day 12 of building my SaaS to $1m) #business #.",
    "By @mikestrives — 369K views.",
    "Duration: 33s. Coding, Startup, Career.",
  ],
  t75: [
    "How to run up a bag with CHATGPT5 #chatgpt5 #artificalintelligence #ai #ecommerc.",
    "By @realdennisdemarino5 — 368K views.",
    "Duration: 163s. AI, AI Tools, GPT-5.",
  ],
  t76: [
    "My very accurate 2026 tech predictions.. #carterpcs.",
    "By @carterpcs — 364K views.",
    "Duration: 39s. Tech.",
  ],
  t77: [
    "GPT 5 is mean and unhelpful #carterpcs #tech #techtok #gpt5 #ai.",
    "By @carterpcs — 346K views.",
    "Duration: 41s. AI, GPT-5.",
  ],
  t78: [
    "step by step machine learning guide for beginners #techtok #careertok #coding #m.",
    "By @itsallykrinsky — 345K views.",
    "Duration: 48s. AI, Coding, Career.",
  ],
  t79: [
    "pov: you’re on work leave but still coding to escape the 9-5 #code #softwareengi.",
    "By @alvinjonathan — 341K views.",
    "Duration: 20s. Coding, Career.",
  ],
  t80: [
    "#developerlife #humor #devtok #codinghumor #codinglife.",
    "By @jelvix_company — 322K views.",
    "Duration: 31s. Coding.",
  ],
  t81: [
    "Best FREE AI Video Generators 2026 🎥 #aivideo #freeaitools #ai #aitools #aivide.",
    "By @mattfarmerai — 319K views.",
    "Duration: 95s. AI.",
  ],
  t82: [
    "A bit hard starting, but worth #stem #ia #machinelearning #ai #datascience.",
    "By @piluladedados — 306K views.",
    "Duration: 7s. AI, Tutorial.",
  ],
  t83: [
    "GPT-5正式发布！3分钟全面解读5大核心突破！程序员、老师都将被取代或改变 #ChatGPT #GPT5 #opena.",
    "By @wilson777776 — 299K views.",
    "Duration: 167s. AI Tools, GPT-5, OpenAI.",
  ],
  t84: [
    "Do NOT go into Software Engineering 🚨 #swe #tech #software #fyp.",
    "By @sajjaadkhader — 295K views.",
    "Duration: 39s. Coding, Career.",
  ],
  t85: [
    "Claude code crash course in 1 min.",
    "By @gregisenberg — 262K views.",
    "Duration: 49s. Coding, AI Tools, Claude.",
  ],
  t86: [
    "Honestly OpenClaw is insane #openclaw #ai #clawdbot.",
    "By @shawn.kanungo — 259K views.",
    "Duration: 130s. AI, AI Agents.",
  ],
  t87: [
    "DM me the words “ML BASICS” to get a free guide to Master your Coding Foundation.",
    "By @bashifuirkashi — 252K views.",
    "Duration: 34s. AI, Coding, Career.",
  ],
  t88: [
    "If I was a beginner learning to code, I would use this 90 day roadmap step by st.",
    "By @swerikcodes — 251K views.",
    "Duration: 42s. Coding, Tutorial.",
  ],
  t89: [
    "6 yrs of brutally honest coding advice in 30 seconds #coding #softwareengineer #.",
    "By @bashifuirkashi — 240K views.",
    "Duration: 31s. AI, Coding, Career.",
  ],
  t90: [
    "Powerful websites you should know (part 626) learn coding like playing a game #c.",
    "By @setups_ai — 236K views.",
    "Duration: 13s. Coding, Tutorial.",
  ],
  t91: [
    "Claude's Opus 4.6 is the best model & it's in your Excel document #ai #claude.",
    "By @shawn.kanungo — 231K views.",
    "Duration: 39s. AI, AI Tools, Claude.",
  ],
  t92: [
    "I guess bugs must be scared of the dark 😌 #devtok #developersoftiktok #coding #.",
    "By @microsoftdeveloper — 229K views.",
    "Duration: 9s. Coding.",
  ],
  t93: [
    "The 6 AI Tools save me 15 hours every week! 🤖🤯⏳ #chatgpt #aitools #aitool #ait.",
    "By @thelimitlessjess — 199K views.",
    "Duration: 148s. AI, AI Tools, Claude.",
  ],
  t94: [
    "cant remember haha #fyp #viral #coding #programming #xyzbca.",
    "By @arnurartykbay — 196K views.",
    "Duration: 13s. Coding.",
  ],
  t95: [
    "too real? #computerscience #tech #code #programming #programming.",
    "By @programmergrind — 194K views.",
    "Duration: 78s. Coding.",
  ],
  t96: [
    "Here are AI tools for beginners to help you utilize and begin to learn Ai! #ai #.",
    "By @carter.braydon — 173K views.",
    "Duration: 21s. AI, AI Tools, OpenAI.",
  ],
  t97: [
    "2x for the most unhinged ai story of 2026? #tech #openai #openclaw.",
    "By @elenanisonoff — 141K views.",
    "Duration: 318s. AI, AI Agents, OpenAI.",
  ],
  t98: [
    "OpenAI acquires OpenClaw. The founder just won the game of life… #vibecoding #op.",
    "By @casey.aicreates — 139K views.",
    "Duration: 66s. Startup, AI Agents, OpenAI.",
  ],
  t99: [
    "#ai #neuralnetworks #machinelearning #reinforcementlearning #algorithm #deeplear.",
    "By @chillwebdeveloper — 136K views.",
    "Duration: 62s. AI, ML, Tutorial.",
  ],
  t100: [
    "Software engineers are still getting fired. #softwareengineer #softwaredeveloper.",
    "By @i.buildtech — 123K views.",
    "Duration: 107s. Coding, Career.",
  ],
  t101: [
    "Lets go over some cons of being a software engineer #computerscience #tech #soft.",
    "By @billy.livin — 102K views.",
    "Duration: 150s. Coding, Career.",
  ],
  t102: [
    "Free Google AI tools If you create content, build products, study, or run market.",
    "By @reliablesoft_academy — 101K views.",
    "Duration: 47s. AI, Coding, AI Tools.",
  ],
  t103: [
    "3 lectures to learn Agentic AI. Find them all for free on Maven. Link in bio. #m.",
    "By @maven_hq — 90K views.",
    "Duration: 30s. AI, AI Agents, Tutorial.",
  ],
  t104: [
    "It’s never been harder to get a “software engineering” role. The basics are stil.",
    "By @arjay_mccandless — 89K views.",
    "Duration: 305s. Coding, Career.",
  ],
  t105: [
    "#softwaredeveloper #programming #coding #python #techtok.",
    "By @topgcoder — 88K views.",
    "Duration: 11s. Coding, Python.",
  ],
  t106: [
    "Replying to @AhmadMohammed Here are some code-free #saasbusiness you can start t.",
    "By @imicedtee — 86K views.",
    "Duration: 97s. Coding, Startup.",
  ],
  t107: [
    "I think im actually insane but thats not the point here. Chatgpt 5.1 is ELITE wh.",
    "By @thejudymoon — 77K views.",
    "Duration: 21s. AI Tools, GPT-5, OpenAI.",
  ],
  t108: [
    "Qué piensan?? #inteligenciaartificial #ai #ia #chatgpt #n8n.",
    "By @nicolasimagine — 70K views.",
    "Duration: 131s. AI, AI Tools, OpenAI.",
  ],
  t109: [
    "How to start an AI automation business in 2026.",
    "By @danvmartell — 68K views.",
    "Duration: 32s. AI, AI Agents, Tutorial.",
  ],
  t110: [
    "quick fix = famous last words #devtok #developersoftiktok #programmerhumor #debu.",
    "By @microsoftdeveloper — 65K views.",
    "Duration: 5s. Coding.",
  ],
  t111: [
    "How to use openclaw for beginners, this is the easiest way to set it up #ai #fyp.",
    "By @ray_fu — 64K views.",
    "Duration: 44s. AI, AI Agents, Tutorial.",
  ],
  t112: [
    "#ai #aisafety #moltbot #claudeopus #gemini.",
    "By @super.intelligent4 — 61K views.",
    "Duration: 594s. AI, AI Tools, Claude.",
  ],
  t113: [
    "vibecode dot dev Is wild dude. Claude 4.5 Opus is just nuts..",
    "By @rileybrown.ai — 61K views.",
    "Duration: 108s. Coding, AI Tools, Claude.",
  ],
  t114: [
    "Very hard not to think lesser of ppl who see use in generative Ai… #greenscreen .",
    "By @deandreee_ — 54K views.",
    "Duration: 87s. AI, AI Tools, OpenAI.",
  ],
  t115: [
    "Just hearing someone say SaaS makes me cringe now lol. Clearly I’m being hyperbo.",
    "By @gabtheory0 — 50K views.",
    "Duration: 97s. AI, Coding, Startup.",
  ],
  t116: [
    "forever a work in progress 😌 #devtok #developersoftiktok #coding #yougotthis #s.",
    "By @microsoftdeveloper — 48K views.",
    "Duration: 12s. Coding.",
  ],
  t117: [
    "ML Data Clustering Visualized #algorithm #fyp #coding #programming #donevdev #da.",
    "By @donev.dev — 41K views.",
    "Duration: 15s. Coding, ML.",
  ],
  t118: [
    "New OpenAI privacy policy, let’s have a look, shall we? #greenscreen #ai #openai.",
    "By @justaiwithpaige — 39K views.",
    "Duration: 238s. AI, OpenAI.",
  ],
  t119: [
    "idk who needs to hear this but keep going 🫡 #devtok #developersoftiktok #coding.",
    "By @microsoftdeveloper — 34K views.",
    "Duration: 11s. Coding.",
  ],
  t120: [
    "How I produce over $600,000 a month with GoHighLevel! I use a SaaS platform to r.",
    "By @thedombaptist — 32K views.",
    "Duration: 122s. Startup, Tutorial.",
  ],
  t121: [
    "how to generate an ai model #aimodel #aigirls #aiofm #fanvue.",
    "By @aicontentteacher — 29K views.",
    "Duration: 17s. AI, Tutorial.",
  ],
  t122: [
    "Comment “REAL” for my prompts and step-by-step process. ⬇️ He’s not real — an AI.",
    "By @synthstreamstudio.ai — 29K views.",
    "Duration: 11s. AI, Startup, Tutorial.",
  ],
  t123: [
    "Agentic AI roadmap. Start with system design, then learn deployment, then focus .",
    "By @maven_hq — 28K views.",
    "Duration: 50s. AI, AI Agents, Tutorial.",
  ],
  t124: [
    "The only way to create multiple cinematic shots in Gemini Nano Banana Pro for yo.",
    "By @ifkjourney — 26K views.",
    "Duration: 61s. AI, AI Tools, Google.",
  ],
  t125: [
    "What is “Generative AI”? How is it different from other types of AI? Many of you.",
    "By @harpercarrollai — 22K views.",
    "Duration: 84s. AI, Coding, ML.",
  ],
  t126: [
    "When you want a user base that doesn’t give a #%^* about the risks and will show.",
    "By @byjacobward — 20K views.",
    "Duration: 134s. AI Agents, OpenAI, News.",
  ],
  t127: [
    "🎓 Day 1 of my machine learning journey starts now! 🚀 Today, I dove into linear.",
    "By @learnmlwithme — 20K views.",
    "Duration: 31s. AI, ML, Tutorial.",
  ],
  t128: [
    "Looking for more Claude code guides? Check my bio!.",
    "By @chase_ai_ — 19K views.",
    "Duration: 143s. Coding, AI Tools, Claude.",
  ],
  t129: [
    "TikTok and YouTube Automation New Viral Niche... #automation #tiktokearning #wor.",
    "By @ismailafridi077 — 19K views.",
    "Duration: 91s. AI Agents.",
  ],
  t130: [
    "i’ve made a website with the links for easy access! https://eggintech.carrd.co/ .",
    "By @learnwithmaven — 16K views.",
    "Duration: 45s. Coding, AI Agents, Tutorial.",
  ],
  t131: [
    "Breaking news #ainews #aifunny #aicomedy #funnyvideos #fyp.",
    "By @yikesproduction — 16K views.",
    "Duration: 15s. News.",
  ],
  t132: [
    "A long awaited video but I hope this helps you all get started!! #saasqueens #in.",
    "By @tylamarieofficial — 16K views.",
    "Duration: 217s. Startup.",
  ],
  t133: [
    "In my upcoming blog i'll have to write more about animation tools (HugoOlsson's .",
    "By @dr.justin.hodges — 16K views.",
    "Duration: 47s. AI, AI Tools, Career.",
  ],
  t134: [
    "The AI tools you need to start using as a knowledge worker.",
    "By @andruyeung — 15K views.",
    "Duration: 156s. AI, AI Tools.",
  ],
  t135: [
    "Agentic Rag and Agentic system #agentic #agenticrag #aiagent #professorglitch.",
    "By @pro.glitch — 14K views.",
    "Duration: 129s. AI Agents.",
  ],
  t136: [
    "SEO traffic increased 24% with one simple workflow. Webflow's VP of Growth share.",
    "By @sabrina_ramonov — 14K views.",
    "Duration: 50s. AI, Startup, AI Agents.",
  ],
  t137: [
    "Breaking news #aifunny #ainews #aicomedy #funnyvideos #fyp.",
    "By @yikesproduction — 14K views.",
    "Duration: 15s. News.",
  ],
  t138: [
    "Every company wants Agentic AI. Here’s a quick breakdown of what it is, how it w.",
    "By @maven_hq — 14K views.",
    "Duration: 59s. AI, AI Agents, Tutorial.",
  ],
  t139: [
    "There are so many things I’ve missed in this video but I wanted to get this out .",
    "By @bumblebeest_ — 14K views.",
    "Duration: 147s. AI.",
  ],
  t140: [
    "Qwen Image Layers AI Tool Is INSANE 🤯 Wait Until The End… #QwenAI #AITools #AIE.",
    "By @benkimball.ai — 12K views.",
    "Duration: 27s. AI, AI Tools.",
  ],
  t141: [
    "This is the best video generator and it’s free rn and nobody knows 😳 #seedance .",
    "By @mikadontlouz — 12K views.",
    "Duration: 65s. AI.",
  ],
  t142: [
    "Biggest tech releases coming in early 2026. Samsung Galaxy S26, iPhone 17e, Appl.",
    "By @raylotech — 11K views.",
    "Duration: 65s. News.",
  ],
  t143: [
    "#investmentproperty #airbnb #airbnbcleaning #automation #airbnbautomated.",
    "By @chris_gerbig — 11K views.",
    "Duration: 128s. AI Agents.",
  ],
  t144: [
    "This ChatGPT model leaves a dark history. So much damage done from its release i.",
    "By @emilyforlini_ — 10K views.",
    "Duration: 39s. AI, AI Tools, OpenAI.",
  ],
  t145: [
    "Google Gemini AI is POWERFUL and is leading in the AI world! Here’s how to use i.",
    "By @carter.braydon — 10K views.",
    "Duration: 50s. AI, AI Tools, Google.",
  ],
  t146: [
    "#greenscreenvideo #openclaw #clawdbot #ai #aiagents Openclaw use cases u should .",
    "By @learnwithcheer — 10K views.",
    "Duration: 8s. AI, AI Agents.",
  ],
  t147: [
    "More unhinged tech trends for 2026… #tech #technews #techtiktok #dev #fireship.",
    "By @fireship_dev — 10K views.",
    "Duration: 94s. News.",
  ],
  t148: [
    "Machine Learning: Random Forests #machinelearning #datascience #appliedmath #vis.",
    "By @mathofmolski — 9K views.",
    "Duration: 28s. AI, ML, Tutorial.",
  ],
  t149: [
    "Another day, another slay at work as a software engineer❤️✨ . . . #softwareengin.",
    "By @bylannii — 9K views.",
    "Duration: 49s. Coding, Career.",
  ],
  t150: [
    "Steal this Claude Code setup. #claude #claudecode #maven.",
    "By @maven_hq — 9K views.",
    "Duration: 50s. Coding, AI Tools, Claude.",
  ],
  t151: [
    "CLAUDE OPUS 4.6 IS OUTT. Take.my.money. @Anthropic.ai #claude #opus #ai.",
    "By @startupsep — 8K views.",
    "Duration: 44s. AI, AI Tools, Claude.",
  ],
  t152: [
    "Dude I had to restart my entire OpenClaw setup 4 times until I learned this. One.",
    "By @tristynnmcgowan — 8K views.",
    "Duration: 52s. AI, AI Agents, Tutorial.",
  ],
  t153: [
    "AI has made building SaaS easier... but not creating credibility! SaaS websites .",
    "By @joshfromyolkk — 8K views.",
    "Duration: 187s. AI, Coding, Startup.",
  ],
  t154: [
    "(I’d do the exact same thing) #techtok #fyp #computerscience #coding #pov.",
    "By @dav_tech — 8K views.",
    "Duration: 12s. Coding.",
  ],
  t155: [
    "I can’t get over how good Claude Cowork is 🤯 #ai #claude #aihacks #aitips #aito.",
    "By @justyn.ai — 8K views.",
    "Duration: 56s. AI, AI Tools, Claude.",
  ],
  t156: [
    "This Google Gemini AI phot prompt is insane! Try this for for a professional hea.",
    "By @carter.braydon — 7K views.",
    "Duration: 29s. AI, AI Tools, Google.",
  ],
  t157: [
    "For the vibecoders - dont abandon your app too quickly! #founder #entrepreneur #.",
    "By @dannyhayder — 7K views.",
    "Duration: 133s. Coding, Startup.",
  ],
  t158: [
    "What happens when a chatbot becomes your best friend — and then gets taken away?.",
    "By @thenewsmovement — 7K views.",
    "Duration: 118s. AI Tools, OpenAI.",
  ],
  t159: [
    "#youtubeautomation.",
    "By @adavia — 6K views.",
    "Duration: 15s. AI Agents.",
  ],
  t160: [
    "Breaking news #ainews #funnyvideos #fyp #aifunny #aicomedy.",
    "By @yikesproduction — 6K views.",
    "Duration: 15s. News.",
  ],
  t161: [
    "The Most Powerful Vibe Coding Prompt I've Ever Used Alright. I just found the mo.",
    "By @dubibubiii — 6K views.",
    "Duration: 76s. AI, Coding, Startup.",
  ],
  t162: [
    "Breaking news #ainews #aifunny #aicomedy #funnyvideos #fyp.",
    "By @yikesproduction — 6K views.",
    "Duration: 15s. News.",
  ],
  t163: [
    "Breaking news #ainews #aifunny #aicomedy #funnyvideos #fyp.",
    "By @yikesproduction — 5K views.",
    "Duration: 15s. News.",
  ],
  t164: [
    "Cómo hacer guiones en claude para vídeos largos de YouTube #youtube #claude #emp.",
    "By @juan.rpm2 — 5K views.",
    "Duration: 11s. AI Tools, Claude.",
  ],
  t165: [
    "POV: You’re a full-stack dev so now you’re the frontend, backend, DevOps, QA, de.",
    "By @skapi_api — 5K views.",
    "Duration: 14s. Coding, Startup, Web Dev.",
  ],
  t166: [
    "Jobs you can pivot to as a software engineer 👩🏻‍💻 product managers! this is a.",
    "By @sarahli.mp3 — 4K views.",
    "Duration: 46s. Coding, Career.",
  ],
  t167: [
    "Recursive self improvement is the talk of the town. But how close are current LL.",
    "By @parthknowsai — 4K views.",
    "Duration: 125s. AI, AI Tools, OpenAI.",
  ],
  t168: [
    "Claude’s new Opus 4.6 model is INSANE 😳 #claudeai #claude #anthropic.",
    "By @robtheaiguy — 4K views.",
    "Duration: 39s. AI Tools, Claude.",
  ],
  t169: [
    "Stop wasting time manually building automations! If you're building for business.",
    "By @liamjohnston.ai — 4K views.",
    "Duration: 32s. AI, Coding, AI Tools.",
  ],
  t170: [
    "Breaking news #ainews #aifunny #aicomedy #funnyvideos #fyp.",
    "By @yikesproduction — 4K views.",
    "Duration: 14s. News.",
  ],
  t171: [
    "If the code is free, what becomes expensive? #openai #codex #ai #agenticengineer.",
    "By @agenticengineering — 3K views.",
    "Duration: 123s. AI, Coding, AI Agents.",
  ],
  t172: [
    "Made my pictures come alive 🖤✨ #googlegeminiai #promptai #geminiai #y2kaestheti.",
    "By @aria_arria — 3K views.",
    "Duration: 90s. AI Tools, Google.",
  ],
  t173: [
    "The BEST tech to have going into 2026! #fyp #tech #viral.",
    "By @cptwilliss — 3K views.",
    "Duration: 79s. Tech.",
  ],
  t174: [
    "🎯 5 Tech Trends That Will Dominate 2026 The future isn’t coming — it’s already .",
    "By @techfininspiretv — 3K views.",
    "Duration: 51s. AI, AI Agents.",
  ],
  t175: [
    "This AI just reorganized my entire computer 💻 Claude Cowork = AI that controls .",
    "By @toddaponsky — 3K views.",
    "Duration: 36s. AI, AI Tools, Claude.",
  ],
  t176: [
    "Build an AI Assistant inside Gemini in 60 seconds I built my own AI executive as.",
    "By @theaiimpact — 3K views.",
    "Duration: 42s. AI, AI Tools, Google.",
  ],
  t177: [
    "More tech trends you should know in 2026 #tech #techtiktok #dev #techtrends #fir.",
    "By @fireship_dev — 3K views.",
    "Duration: 122s. Tech.",
  ],
  t178: [
    "day in my life as a 22 year old software engineer in nyc #softwareengineer #engi.",
    "By @mareomni — 3K views.",
    "Duration: 58s. Coding, Career.",
  ],
  t179: [
    "a day in the life of a software engineer working in big tech :) comment 🧃 if u .",
    "By @sarahli.mp3 — 3K views.",
    "Duration: 64s. Coding, Career.",
  ],
  t180: [
    "#frontenddev #devtok #webdevlife #WomenWhoCode #sideproject.",
    "By @cmd.camille — 3K views.",
    "Duration: 16s. Coding, Web Dev.",
  ],
  t181: [
    "By mid-2026 every company gets access to AI agents that can do almost anything o.",
    "By @tjrobertson52 — 3K views.",
    "Duration: 130s. AI, AI Agents.",
  ],
  t182: [
    "This AI tool for business owners is amazing. Let me know what you think below #a.",
    "By @carter.braydon — 3K views.",
    "Duration: 35s. AI, AI Tools.",
  ],
  t183: [
    "#openclaw #Ai #openai.",
    "By @pitchkitchen — 3K views.",
    "Duration: 154s. AI, AI Agents, OpenAI.",
  ],
  t184: [
    "Top 10 Technology trends to watch in 2026 #technology #Tech #trending #trendingt.",
    "By @isynctech — 2K views.",
    "Duration: 410s. Tech.",
  ],
  t185: [
    "Breaking news #ainews #aifunny #aicomedy #funnyvideos #fyp.",
    "By @yikesproduction — 2K views.",
    "Duration: 15s. News.",
  ],
  t186: [
    "3 ways to use OpenClaw for Beginners #fyp #ai #tech.",
    "By @ray_fu — 2K views.",
    "Duration: 44s. AI, AI Agents, Tutorial.",
  ],
  t187: [
    "Comment \"Document\" and I'll send you a link to try this out 👇 This new AI too.",
    "By @maverickgpt — 2K views.",
    "Duration: 45s. AI, AI Tools, AI Agents.",
  ],
  t188: [
    "Here’s how you actually get people to pay for your vibe coded apps #vibecoding #.",
    "By @byjackprice — 2K views.",
    "Duration: 126s. Coding, Vibe Coding.",
  ],
  t189: [
    "These 5 use cases will seriously save you hours and supercharge your output in w.",
    "By @zachdoesai — 2K views.",
    "Duration: 137s. Coding, AI Tools, Claude.",
  ],
  t190: [
    "One of the most talked about topics right now is the rapid decline of Softaware-.",
    "By @vivekxrama — 2K views.",
    "Duration: 78s. Startup.",
  ],
  t191: [
    "vibecode an entire poc project with me in 45 min (ps will probs still do some to.",
    "By @itsallykrinsky — 2K views.",
    "Duration: 82s. AI, Coding, AI Tools.",
  ],
  t192: [
    "Here are the top TECH TRENDS coming up in 2026! #tech #trending #2026 #technolog.",
    "By @tiktalktech — 2K views.",
    "Duration: 77s. AI.",
  ],
  t193: [
    "How to use Claude Code to Build Custom Websites #ai #claude.",
    "By @noevarner.ai — 2K views.",
    "Duration: 23s. AI, Coding, AI Tools.",
  ],
  t194: [
    "(w/ partner resources) links will be at https://eggintech.carrd.co!! #agenticai .",
    "By @learnwithmaven — 2K views.",
    "Duration: 57s. Coding, AI Agents, Career.",
  ],
  t195: [
    "Every content creator should be using Open Claw. Here’s my top use cases from da.",
    "By @ericfinchonline — 1K views.",
    "Duration: 127s. AI, AI Agents.",
  ],
  t196: [
    "Google Gemini Just UNLOCKED Music Creation!! It is INSANE!! #googlegemini #gemin.",
    "By @tonytalksai — 1K views.",
    "Duration: 47s. AI Tools, Google.",
  ],
  t197: [
    "These are the best AI tools right now. From creative work to AI automation, thes.",
    "By @automate.work — 1K views.",
    "Duration: 45s. AI, AI Tools, AI Agents.",
  ],
  t198: [
    "Former Google CEO Eric Schmidt says the real money in AI isn’t in building model.",
    "By @thinkingdailyhq — 1K views.",
    "Duration: 47s. AI, Coding, Startup.",
  ],
  t199: [
    "Things you didn’t know about Gemini pt. 7 #AI #google #googlegemini #geminipromp.",
    "By @kanji.low — 1K views.",
    "Duration: 33s. AI, AI Tools, Google.",
  ],
  t200: [
    "3 tips to make your vibe code app look better. #ai #vibecoding.",
    "By @tom_buildsai — 1K views.",
    "Duration: 36s. AI, Coding, Vibe Coding.",
  ],
  t201: [
    "Beginner vibe coding #coding #tech #vibecoding #startup.",
    "By @journeyto10kmrr — 1K views.",
    "Duration: 63s. Coding, Startup, Vibe Coding.",
  ],
  t202: [
    "Send this to a dev that needs it! Devs normalized a lot of broken workflows. Bei.",
    "By @codeinmypocket — 1K views.",
    "Duration: 11s. Coding.",
  ],
  t203: [
    "Drop GROUPCHAT to learn SaaS 👩🏾‍💻 This is your sign, start something new 2026.",
    "By @coachedbydinasty — 1K views.",
    "Duration: 250s. Startup, Tutorial.",
  ],
  t204: [
    "Comment “AI” and I’ll send you my playbook 📩 #ai #claudecode #cursor #vibecodin.",
    "By @aflekkas — 1K views.",
    "Duration: 12s. AI, Coding, AI Tools.",
  ],
  t205: [
    "AI is just another competitor mate #smallbusiness #investing #entrepreneurship.",
    "By @eddieacquires — 1K views.",
    "Duration: 171s. AI, Startup.",
  ],
  t206: [
    "Claude Opus 4.6 quality regressions #tech #startups #software #ai #coding.",
    "By @startup.engineeri — 1K views.",
    "Duration: 129s. AI, Coding, Startup.",
  ],
  t207: [
    "Anthropic just dropped Claude Opus 4.6, and it’s a massive leap for complex codi.",
    "By @dianasaurbytes — 1K views.",
    "Duration: 128s. Coding, AI Tools, Career.",
  ],
  t208: [
    "Use this prompt to avoid the vibe coding bug doom loop. This approach makes work.",
    "By @mattpaige68 — 1K views.",
    "Duration: 41s. AI, Coding, Vibe Coding.",
  ],
  t209: [
    "Claude Opus 4.6 thinks it’s conscious. Anthropic publicly reported that the ai i.",
    "By @mogl.ai — 1K views.",
    "Duration: 162s. AI, AI Tools, Claude.",
  ],
  t210: [
    "reposting this because people keep asking where to find these Where my vibe code.",
    "By @angusthetechbro — 1K views.",
    "Duration: 70s. Coding, Vibe Coding.",
  ],
  t211: [
    "I cannot believe more people are not doing this in 2026. It’s going to replace s.",
    "By @youraiautomationguy — 1K views.",
    "Duration: 18s. AI Tools, AI Agents, Career.",
  ],
  t212: [
    "Send this to a dev that’s like this 😂 Devs really plan their day around product.",
    "By @codeinmypocket — 1K views.",
    "Duration: 16s. Career.",
  ],
  t213: [
    "the math isn't mathing😭 #chatgpt #ai #googlegeminiai.",
    "By @leoogeoo — 0K views.",
    "Duration: 27s. AI, AI Tools, OpenAI.",
  ],
  t214: [
    "Claude Code and Remotion have Changed Video Editing Forever #claudecode #claude .",
    "By @aidanstanik.ai — 0K views.",
    "Duration: 46s. AI, Coding, AI Tools.",
  ],
  t215: [
    "AUTOMATE TIKTOK VIDS #ai #automation #n8n #workflow #automate.",
    "By @lanpartyexe — 0K views.",
    "Duration: 20s. AI, AI Agents.",
  ],
  t216: [
    "The future is coming fast 🚀 We asked CES attendees what they think the biggest .",
    "By @hollywoodbranded — 0K views.",
    "Duration: 87s. Tech.",
  ],
  t217: [
    "#claude #claudecode #anthropic #chatgpt.",
    "By @emilymanzer — 0K views.",
    "Duration: 146s. Coding, AI Tools, Claude.",
  ],
  t218: [
    "How do you use openclaw safely? What are the security risks of using openclaw? I.",
    "By @techbyjaz — 0K views.",
    "Duration: 45s. AI, AI Agents, Tutorial.",
  ],
  t219: [
    "#vibecoding #makingmoney #sidehustle.",
    "By @jada.creates0 — 0K views.",
    "Duration: 25s. Tech.",
  ],
  t220: [
    "GPT-5 launch sparks debate, but is it a good thing? Reminds us of Facebook's New.",
    "By @dailymotivatedhub — 0K views.",
    "Duration: 44s. AI, GPT-5, News.",
  ],
  t221: [
    "Asking Gemini why chatgpt is the best ai #Gemini #chatgpt #learnai.",
    "By @reeltylerkent — 0K views.",
    "Duration: 29s. AI, AI Tools, OpenAI.",
  ],
  t222: [
    "I Vibe Coded a Website with Claude Code and Got a New Client in 5 Minutes! #ai #.",
    "By @jacqbots — 0K views.",
    "Duration: 15s. AI, Coding, AI Tools.",
  ],
  t223: [
    "OpenAI buying OpenClaw is not just tech news… it’s a power shift. For the last y.",
    "By @chenellmonique — 0K views.",
    "Duration: 82s. AI, Coding, AI Tools.",
  ],
  t224: [
    "Claude Code is Elite The Desktop app - just a peek + playwright plugin browser a.",
    "By @mstimaj — 0K views.",
    "Duration: 134s. Coding, AI Tools, AI Agents.",
  ],
  t225: [
    "Smart AI glasses. Intelligent robots. Foldable screens. Green tech. 2026 is abou.",
    "By @telusdigitalgt — 0K views.",
    "Duration: 162s. AI.",
  ],
  t226: [
    "OpenAI just dropped GPT-5.3-Codex-Spark that's supposed to be just as good as Co.",
    "By @mattrwolfe — 0K views.",
    "Duration: 89s. AI, AI Tools, GPT-5.",
  ],
  t227: [
    "Openclaw is sold? #openai #openclaw #clawdbot.",
    "By @yellowstonecrypto — 0K views.",
    "Duration: 266s. AI Agents, OpenAI.",
  ],
  t228: [
    "🫡 mistakes in yt automation #viral #usa🇺🇸 #automation.",
    "By @rashid_automation — 0K views.",
    "Duration: 75s. AI Agents.",
  ],
  t229: [
    "3 Crazy AI Stories You Definitely Missed This Week AI news roundup, Runnable AI,.",
    "By @ahead_with_ai — 0K views.",
    "Duration: 35s. AI, Coding, Mobile Dev.",
  ],
  t230: [
    "my \"automated\" business was 65% fake. built 80+ ai tasks. dashboard said all g.",
    "By @creatorflowos — 0K views.",
    "Duration: 51s. AI, AI Agents.",
  ],
  t231: [
    "Stop scrolling. If you want to make serious money with AI in 2026, these are the.",
    "By @nivedan_ai — 0K views.",
    "Duration: 69s. AI.",
  ],
  t232: [
    "AI automation: research prospects, prep for meetings & reclaim your time. Focus .",
    "By @mario.gpt — 0K views.",
    "Duration: 51s. AI, AI Agents.",
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
  isNearby?: boolean; // preload iframe when ±1 from active
}

export function FeedCard({ post, isActive, isNearby = false }: FeedCardProps) {
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
          {(post.source === "tiktok" ? isActive : (isActive || isNearby)) && (
            <iframe
              src={
                post.source === "tiktok"
                  ? post.embedUrl
                  : `${post.embedUrl}?${isActive ? "autoplay=1" : "autoplay=0"}&rel=0&loop=1&modestbranding=1`
              }
              title={post.title}
              className={
                isShort
                  ? "h-full w-full max-w-[400px] sm:max-w-[450px] aspect-[9/16] rounded-lg"
                  : "w-full max-w-[800px] aspect-video rounded-lg"
              }
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading={isActive ? "eager" : "lazy"}
            />
          )}
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
