# NoFluff.ai — Pure AI News, Zero Filler

> An AI-curated tech news and video aggregator that kills scroller's fatigue. No lifestyle trash. No 1-minute creator fluff. Just pure, hardcore tech updates — summarized in 2 seconds.

---

## The Problem

Social media feeds are broken for tech enthusiasts. You follow AI creators who spend 60 seconds rambling before dropping one line of useful info. You scroll through a feed that starts with tech but drifts into lifestyle content within seconds. There's no platform that delivers *only* raw, technical AI updates without the noise.

## The Solution

**NoFluff.ai** is a ruthless gatekeeper. It automatically fetches YouTube Shorts and tech articles via free APIs, uses an LLM to pre-screen every post (discarding anything that isn't hard tech), and gives users a **"Summarize"** button that instantly condenses any video into 3 bullet points — so you never have to watch filler again.

### How It Works

1. **The Pure Feed** — A dark-mode, minimalist feed of cards. Each card embeds the *literal* YouTube Short or links the article directly.
2. **Zero Lifestyle Trash** — A backend AI (Gemini 1.5 Flash) pre-screens every post before it reaches the feed. If a video is tagged #AI but is actually a lifestyle vlog, it never makes it to the screen.
3. **The "Skip the Fluff" Button** — Below every video, a single button. Click it, and the app reads the transcript/caption via the LLM and instantly returns exactly 3 technical bullet points. Read it in 2 seconds, get the info, keep scrolling.

---

## Tech Stack

### Frontend (Current)

| Technology | Purpose |
|---|---|
| **React 18** + **TypeScript** | UI framework |
| **Vite** | Dev server & build tool |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Accessible component library |
| **Framer Motion** | Smooth animations |
| **Lucide React** | Icon set |
| **Vitest** | Unit testing |

### Backend

| Technology | Purpose |
|---|---|
| **NestJS** | Backend framework (serverless-ready) |
| **Vercel** | Deployment & serverless functions |
| **In-memory store** | MVP data persistence (no DB setup needed) |
| **Vercel Cron Jobs** | Scheduled data fetching (hourly) |

### AI Processing

| Technology | Purpose |
|---|---|
| **Google Gemini 1.5 Flash** | Multimodal summarization & content gatekeeping |
| **`@google/genai` SDK** | Node.js client for Gemini API |

---

## Free APIs

All data sources are **100% free** — no credit card, no paid scrapers.

### 1. YouTube Data API v3 (Videos & Shorts)

- **Free quota:** 10,000 units/day
- **Endpoint:** `GET https://www.googleapis.com/youtube/v3/search`
- **Usage:** Search for Shorts with queries like `#AI technology`, `artificial intelligence news`, `LLM update`
- **Params:** `type=video`, `videoDuration=short`, `order=date`
- **Embed:** `https://www.youtube.com/embed/{videoId}`
- **Get your key:** [Google Cloud Console](https://console.cloud.google.com/) → Enable "YouTube Data API v3" → Create API Key

### 2. RSS Feeds (Articles) — via `rss-parser`

No API key required. Unlimited. Direct XML feeds from major sources:

| Source | Feed URL |
|---|---|
| TechCrunch AI | `https://techcrunch.com/category/artificial-intelligence/feed/` |
| The Verge AI | `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml` |
| Ars Technica AI | `https://feeds.arstechnica.com/arstechnica/technology-lab` |
| OpenAI Blog | `https://openai.com/blog/rss.xml` |
| MIT Tech Review AI | `https://www.technologyreview.com/feed/` |

### 3. Google Gemini 1.5 Flash (AI Processing)

- **Free tier:** 1,500 requests/day per key, 1M tokens/minute
- **Auto-rotation:** Add multiple keys comma-separated in `GEMINI_API_KEYS` — when one key's quota runs out, it automatically swaps to the next
- **Usage:** Content gatekeeping (TECH vs FLUFF classification) + 3-bullet summarization + Fame Scoring
- **Get your key:** [Google AI Studio](https://aistudio.google.com/) → "Get API Key" (create multiple Google accounts for more free keys)

---

## Detailed API Logic & Scalability

### How the Fetching Pipeline Works
1. **Cron Job Orchestration**: The `CronJobService` runs in the background (e.g., on server startup or hourly via Vercel).
2. **Fetching Content**: 
   - **YouTube Videos & Shorts**: The backend calls the **YouTube Data API v3**, passing in rotating AI-specific hashtags (like `#AI`, `#MachineLearning`, `#YouTubeShorts`). It fetches multiple batches at once.
   - **Articles**: The backend uses **`rss-parser`** to fetch XML feeds from famous tech publishers like TechCrunch, MIT, and OpenAI. It grabs the top recent articles from each feed.
3. **The AI Gatekeeper**: 
   - All fetched items are sent to the **Google Gemini 1.5 Flash API**.
   - Gemini acts as a strict filter. It reads the title and caption, and if the post is lifestyle/fluff, it assigns `FLUFF` and deletes it. If it is highly technical, it passes as `TECH`.
   - **Fame Scoring**: For articles, Gemini also assigns a `FAME_SCORE` (1 to 100) based on how impactful the news is. The backend natively sorts articles by this score so the biggest news appears first.
4. **Storage**: The surviving `TECH` posts are stored in the backend's database (currently an in-memory MVP store). The frontend then fetches from this store.

### Will APIs Run Out if Many Users Are Scrolling?
**No.** 
Users scrolling through the feed **do not** trigger external API calls (like YouTube or RSS). When a user scrolls, they are simply querying your backend's own database. This means no matter if you have 10 users or 10,000 users scrolling, you will not hit YouTube or RSS API rate limits. 

**The Only Exception:** 
The "Summarize" button calls the Gemini API directly when a user clicks it. If thousands of users are clicking "Summarize" simultaneously, you might hit the Gemini rate limit. 
*Solution*: The app already includes **Automatic Key Rotation**. If you put multiple comma-separated keys in the `GEMINI_API_KEYS` environment variable, the backend will automatically rotate to a fresh, free API key if one runs out.

### Suggested APIs to Expand Content
If you want to pull in more content in the future, consider integrating these APIs:

#### For Shorts & Videos:
- **TikTok Scraper APIs (via RapidAPI)**: Official TikTok API access is heavily restricted, but RapidAPI offers unofficial scrapers to query `#AI` TikToks.
- **Instagram Graph API**: To fetch Instagram Reels using specific hashtags.
- **Reddit API**: Completely free. You can pull trending videos from subreddits like `r/artificial`, `r/MachineLearning`, and `r/singularity`.
- **Twitter/X API**: Great for finding the absolute latest trending tech demo videos, although the free tier is very limited.

#### For Articles & News:
- **Hacker News API**: 100% free and unlimited. The absolute best source for deep, technical programming and AI discussions. Highly recommended.
- **NewsAPI (newsapi.org)**: A popular global news aggregator. You can query "AI", "LLM", etc., but the free tier delays news by 24 hours.
- **GNews.io API**: A great alternative to Google News that provides up-to-date article search.
- **Dev.to API**: Free API to get technical blog posts directly from developers.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   VERCEL                        │
│                                                 │
│  ┌──────────────┐       ┌─────────────────────┐ │
│  │  React +     │  API  │  NestJS (Serverless)│ │
│  │  Tailwind    │◄─────►│                     │ │
│  │  Frontend    │       │  ┌─ FetchService    │ │
│  │              │       │  │  (YouTube + RSS) │ │
│  │  ┌────────┐  │       │  ├─ GatekeeperSvc   │ │
│  │  │Media   │  │       │  │  (Gemini: TECH   │ │
│  │  │Card    │  │       │  │   or FLUFF?)     │ │
│  │  │[video] │  │       │  ├─ SummarizerSc    │ │
│  │  │[summa- │  │       │  │  (Gemini: 3      │ │
│  │  │ rize]  │  │       │  │   bullet points) │ │
│  │  └────────┘  │       │  ├─ GeminiService   │ │
│  │              │       │  │  (key rotation)    │ 
│  └──────────────┘       └──────────┬────────────┘ 
│                                    │            │
│                           ┌────────▼────────┐   │
│                           │  In-memory store │  │
│                           │  (MVP / no DB)   │  │
│                           └─────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Backend Services

| Service | Role |
|---|---|
| **FetchService** | Pulls latest YouTube Shorts (via Data API v3) and articles (via RSS). Runs on a Vercel Cron every hour. |
| **GatekeeperService** | Pre-filters every fetched item through Gemini. Prompt: *"Is this a technical AI/LLM/programming update? Respond TECH or FLUFF."* Discards all FLUFF. |
| **SummarizerService** | On-demand (triggered by user click). Sends transcript/caption to Gemini. Returns exactly 3 technical bullet points. |
| **CronController** | `GET /api/cron/fetch-latest` — orchestrates Fetch → Gatekeeper → Save to DB. Runs hourly via `vercel.json` cron. |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Install Everything

```sh
npm run install:all
```

### Development (runs both frontend + backend)

```sh
npm run dev
```

This starts:
- **Frontend** on `http://localhost:8080` (Vite dev server)
- **Backend** on `http://localhost:3001/api` (NestJS)

The frontend automatically proxies `/api/*` requests to the backend.

### Run Individually

```sh
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

### Build for Production

```sh
npm run build
```

### Run Tests

```sh
npm test               # frontend tests
npm run test:backend   # backend tests
```

### Environment Variables (for backend integration)

```env
YOUTUBE_API_KEY=your_youtube_data_api_v3_key
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_API_KEYS=key1,key2,key3    # comma-separated for auto-rotation
CRON_SECRET=your_vercel_cron_secret
```

## Project Structure

```
nofluff-ai/
├── package.json              ← Root scripts (runs both frontend + backend)
├── README.md
│
├── frontend/                 ← React + Vite + Tailwind
│   ├── src/
│   │   ├── components/       — UI components (FeedCard, MediaCard, Header)
│   │   ├── pages/            — Route-level pages (Index, NotFound)
│   │   ├── data/             — Mock data for development
│   │   ├── hooks/            — Custom React hooks
│   │   └── lib/              — Utilities + API client (api.ts)
│   ├── public/               — Static assets
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── backend/                  ← NestJS (Serverless-ready)
│   ├── src/
│   │   ├── feed/             — Feed controller + in-memory store
│   │   ├── youtube/          — YouTube Data API v3 service
│   │   ├── rss/              — RSS feed parser service
│   │   ├── gatekeeper/       — Gemini TECH/FLUFF classifier
│   │   ├── summarizer/       — Gemini 3-bullet summarizer
│   │   ├── cron/             — Hourly fetch pipeline orchestrator
│   │   └── common/           — Shared types & interfaces
│   ├── package.json
│   ├── nest-cli.json
│   ├── vercel.json           — Vercel serverless + cron config
│   └── .env.example          — Required environment variables
```

---

## Deployment

### Frontend → Vercel

```sh
cd frontend
npm run build
vercel --prod
```

### Backend → Vercel (Serverless)

```sh
cd backend
npm run build
vercel --prod
```

The backend deploys as serverless functions using the `vercel.json` configuration.
Cron jobs run hourly via Vercel Cron (`/api/cron/fetch-latest`).

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/feed` | Get all tech-only posts |
| `GET` | `/api/feed/:id` | Get a single post by ID |
| `POST` | `/api/summarize` | Summarize content (body: `{ title, content? }`) |
| `GET` | `/api/cron/fetch-latest` | Trigger fetch pipeline (secured with `CRON_SECRET`) |

---

## License

This project is proprietary. All rights reserved.
