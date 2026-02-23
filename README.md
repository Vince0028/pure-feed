<div align="center">

  <h1>NoFluff.ai</h1>
  <h3>Pure AI News, Zero Filler</h3>
  <p>
    An AI-curated tech news and video aggregator that kills scroller's fatigue. No lifestyle trash. No 1-minute creator fluff. Just pure, hardcore tech updates summarized in 2 seconds.
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#free-apis">Free APIs</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#architecture">Architecture</a>
  </p>

  <div align="center">
    <!-- React -->
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <!-- TypeScript -->
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <!-- Vite -->
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <!-- Tailwind CSS -->
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <!-- NestJS -->
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
    <!-- Supabase -->
    <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
  </div>
</div>

<br />

## 🌟 Introduction

Social media feeds are broken for tech enthusiasts. You follow AI creators who spend 60 seconds rambling before dropping one line of useful info. You scroll through a feed that starts with tech but drifts into lifestyle content within seconds. There's no platform that delivers *only* raw, technical AI updates without the noise.

**NoFluff.ai** is a ruthless gatekeeper. It automatically fetches YouTube Shorts and tech articles via free APIs, uses an LLM to pre-screen every post, and gives users a **"Summarize"** button that instantly condenses any video into 3 bullet points so you never have to watch filler again.

## ✨ Features

- **📺 The Pure Feed**: A dark-mode, minimalist feed of cards. Each card embeds the *literal* YouTube Short or links the article directly.
- **🛡️ Zero Lifestyle Trash**: A backend AI (Gemini 1.5 Flash) pre-screens every post before it reaches the feed. If a video is tagged #AI but is actually a lifestyle vlog, it never makes it to the screen.
- **⚡ The "Skip the Fluff" Button**: Below every video, a single button. Click it, and the app reads the transcript via the LLM and instantly returns exactly 3 technical bullet points.
- **⭐ Fame Scoring**: For articles, Gemini assigns a `FAME_SCORE` (1 to 100) based on how impactful the news is so the biggest news appears first.
- **🧹 Clean UI**: Built with Shadcn UI, Tailwind CSS, and Framer Motion for a premium, accessible user experience.

## 🛠 Tech Stack

| Component | Technology | Purpose |
|-----------|------------|-------------|
| **Frontend** | [React 18](https://react.dev/) | UI framework |
| **Build Tool** | [Vite](https://vitejs.dev/) | Dev server & build tool |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type safety across the stack |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) | Accessible component library & utility styling |
| **Backend** | [NestJS](https://nestjs.com/) | Serverless-ready backend framework |
| **Database** | [Supabase](https://supabase.com/) | Data persistence |
| **AI Processing** | [Google Gemini](https://aistudio.google.com/) | Multimodal summarization & content gatekeeping |

## 🔗 Free APIs

All data sources are 100% free no credit card, no paid scrapers.
- **YouTube Data API v3**: Fetches AI-specific Shorts and videos.
- **RSS Feeds (`rss-parser`)**: Direct XML feeds from major sources like TechCrunch, Verge, OpenAI.
- **Google Gemini 1.5 Flash**: Content gatekeeping (TECH vs FLUFF) + 3-bullet summarization + Fame Scoring. (Includes auto-rotation of API keys).
- **Groq API**: High-speed fallback if Gemini exhausts quota.

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Vince0028/pure-feed.git
    cd pure-feed
    ```

2.  **Install dependencies**
    ```bash
    npm run install:all
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory based on `.env.example` and add your required credentials:

    ```env
    YOUTUBE_API_KEY=your_youtube_data_api_v3_key
    GEMINI_API_KEY=your_google_ai_studio_key
    GEMINI_API_KEYS=key1,key2,key3    # comma-separated for auto-rotation
    GROQ_API_KEYS=groq_key1,groq_key2 # comma-separated fallback keys
    
    # Supabase (Database)
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_ANON_KEY=your_anon_public_key
    ```

4.  **Database Setup**
    - Create a Supabase project.
    - Run the contents of `01_schema.sql` (in root) in the SQL Editor.

5.  **Run the application**
    ```bash
    npm run dev
    ```

6.  **Open in Browser**
    Visit `http://localhost:8080` (Frontend) or `http://localhost:3001/api` (Backend).

## 🏛 Architecture

```text
┌─────────────────────────────────────────────────┐
│                   VERCEL                        │
│             (Frontend Hosted Here)              │
│  ┌──────────────┐       ┌─────────────────────┐ │
│  │ User Browser │ ◄───► │   React + Vite      │ │
│  └──────────────┘       └──────────┬──────────┘ │
└────────────────────────────────────┼────────────┘
                                     │
┌────────────────────────────────────┼────────────┐
│                   RENDER           │            │
│              (Backend Hosted Here) │            │
│  ┌──────────────┐       ┌──────────▼──────────┐ │
│  │   Cron Job   │ ◄───► │  NestJS API Server  │ │
│  │(Every 3 Days)│       │  (Port 3001)        │ │
│  └──────┬───────┘       └──────────┬──────────┘ │
└─────────┼──────────────────────────┼────────────┘
          │                          │
┌─────────▼────────┐      ┌──────────▼──────────┐
│   SUPABASE       │      │   EXTERNAL APIs     │
│   (Postgres DB)  │      │   - YouTube Data    │
│                  │      │   - Hacker News     │
│  Saves 500+ items│      │   - Groq / Gemini   │
└──────────────────┘      └─────────────────────┘

┌─────────────────────────────────────────────────┐
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
│  │              │       │  │  (key rotation)  │ │
│  └──────────────┘       └──────────┬──────────┘ │
│                                    │            │
│                           ┌────────▼────────┐   │
│                           │  In-memory store│   │
│                           │  (MVP / no DB)  │   │
│                           └─────────────────┘   │
└─────────────────────────────────────────────────┘
```

## 📸 Usage

- **Scroll the Feed**: Browse highly technical posts seamlessly. Unrelated fluffy content has already been removed.
- **Summarize Videos**: Click "Summarize" on any video to get 3 technical bullet points via Gemini instantly.
- **Explore Top News**: Read articles automatically sorted by `FAME_SCORE`.

## 📞 Contact

Vince Alobin - [GitHub Profile](https://github.com/Vince0028)

---

<div align="center">
  <sub>Built with ❤️ by Vince using React & NestJS</sub>
</div>
