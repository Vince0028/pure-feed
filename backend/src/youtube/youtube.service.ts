import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RawFeedItem } from '../common/types';

/**
 * YoutubeService — Fetches AI/tech YouTube content via YouTube Data API v3.
 *
 * Free tier: 10,000 quota units/day.
 * A search.list call costs 100 units, so ~100 searches/day.
 */
@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://www.googleapis.com/youtube/v3';

  /** Hashtag pools organized by category — rotated through on each fetch. */
  private readonly hashtagPool: Record<string, string[]> = {
    core_ai: [
      'AI', 'ArtificialIntelligence', 'Tech', 'Technology', 'FutureTech', 'Innovation'
    ],
    specific_ai: [
      'MachineLearning', 'DeepLearning', 'NeuralNetworks', 'DataScience', 'GenerativeAI'
    ],
    coding_dev: [
      'Python', 'OpenSource', 'SoftwareEngineering', 'DevOps', 'LLM'
    ],
    general_tools: [
      'AITools', 'AIPowered', 'SmartTools', 'Automation', 'Workflow'
    ],
    creative_ai: [
      'Midjourney', 'ChatGPT', 'StableDiffusion', 'AIArt', 'AIVideo'
    ],
    productivity: [
      'LifeHacks', 'Efficiency', 'NoCode', 'SaaS', 'FutureOfWork'
    ]
  };

  private readonly shortsHashtagPool: Record<string, string[]> = {
    essential: [
      'Shorts', 'YouTubeShorts', 'TechShorts', 'Viral'
    ],
    engagement: [
      'WaitForIt', 'MindBlowing', 'TechTrends', 'DidYouKnow'
    ]
  };

  private categoryIndex = 0;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('YOUTUBE_API_KEY') || '';
  }

  /**
   * Pick a random subset of hashtags from the next category in rotation.
   */
  private getSearchQuery(): string {
    const categories = Object.keys(this.hashtagPool);
    const category = categories[this.categoryIndex % categories.length];
    this.categoryIndex++;

    const tags = this.hashtagPool[category];
    // Pick 3-4 random tags from the category for the search query
    const shuffled = [...tags].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).join(' ');
  }

  /**
   * Search for recent AI/tech YouTube Shorts.
   */
  async fetchShorts(query?: string, maxResults = 10): Promise<RawFeedItem[]> {
    const q = query || this.getSearchQuery();

    // Add shorts specific tags
    const shortsCategories = Object.keys(this.shortsHashtagPool);
    const shortsCategory = shortsCategories[this.categoryIndex % shortsCategories.length];
    const shortsTags = this.shortsHashtagPool[shortsCategory];
    const shuffledShorts = [...shortsTags].sort(() => Math.random() - 0.5).slice(0, 2);

    const finalQuery = `${q} ${shuffledShorts.join(' ')}`;
    return this.fetchVideos(finalQuery, 'short', maxResults);
  }

  /**
   * Search for recent AI/tech YouTube Videos (longer form).
   */
  async fetchLongVideos(query?: string, maxResults = 10): Promise<RawFeedItem[]> {
    const q = query || this.getSearchQuery();
    return this.fetchVideos(q, 'medium', maxResults);
  }

  /**
   * Core fetch method for both shorts and longer videos.
   */
  private async fetchVideos(
    query: string,
    duration: 'short' | 'medium' | 'long',
    maxResults: number,
  ): Promise<RawFeedItem[]> {
    if (!this.apiKey) {
      this.logger.warn('YOUTUBE_API_KEY not set — returning mock data');
      return this.getMockShorts();
    }

    try {
      const params = new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'video',
        videoDuration: duration,
        order: 'date',
        maxResults: String(maxResults),
        key: this.apiKey,
      });

      const res = await fetch(`${this.baseUrl}/search?${params}`);
      if (!res.ok) {
        this.logger.error(`YouTube API error: ${res.status} ${res.statusText}`);
        return this.getMockShorts();
      }

      const data = await res.json();

      return (data.items || []).map((item: any) => ({
        source: 'youtube' as const,
        contentType: duration === 'short' ? 'short' : 'video',
        sourceId: item.id.videoId,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
        title: item.snippet.title,
        caption: item.snippet.description,
        tags: this.extractTags(item.snippet.title + ' ' + item.snippet.description),
      }));
    } catch (err) {
      this.logger.error('Failed to fetch YouTube videos', err);
      return this.getMockShorts();
    }
  }

  /**
   * Extract relevant tech tags from text.
   */
  private extractTags(text: string): string[] {
    const keywords = [
      // Core AI
      'AI', 'LLM', 'GPT', 'Gemini', 'Claude', 'OpenAI', 'Anthropic',
      'Neural Network', 'Transformer', 'Deep Learning', 'Machine Learning',
      'NLP', 'Computer Vision', 'Generative AI',
      // Image & Video
      'Stable Diffusion', 'Midjourney', 'DALL-E', 'Sora',
      // Frameworks & Tools
      'LangChain', 'RAG', 'Fine-tuning', 'RLHF', 'Prompt Engineering',
      // Coding
      'Cursor', 'Copilot', 'AI Coding', 'DevTools',
      // Agents
      'AI Agents', 'AutoGPT', 'Agentic',
      // Industry
      'NVIDIA', 'Tesla', 'Robotics', 'Quantum Computing', 'Apple', 'Google', 'Microsoft',
    ];
    return keywords.filter((kw) =>
      text.toLowerCase().includes(kw.toLowerCase()),
    );
  }

  /**
   * Mock data for development when no API key is set.
   */
  private getMockShorts(): RawFeedItem[] {
    return [
      {
        source: 'youtube',
        contentType: 'short',
        sourceId: 'aircAruvnKk',
        embedUrl: 'https://www.youtube.com/embed/aircAruvnKk',
        title: 'But what is a neural network? | Deep Learning Ch.1',
        caption: '3Blue1Brown explains fundamentals of neural networks',
        tags: ['Neural Network', 'Deep Learning'],
      },
      {
        source: 'youtube',
        contentType: 'short',
        sourceId: 'zjkBMFhNj_g',
        embedUrl: 'https://www.youtube.com/embed/zjkBMFhNj_g',
        title: 'Attention in Transformers, visually explained',
        caption: 'A visual walkthrough of the attention mechanism',
        tags: ['Transformer', 'AI'],
      },
      {
        source: 'youtube',
        contentType: 'short',
        sourceId: 'VMj-3S1tku0',
        embedUrl: 'https://www.youtube.com/embed/VMj-3S1tku0',
        title: 'Building makemore: intro to language modeling',
        caption: 'Andrej Karpathy builds a character-level language model from scratch',
        tags: ['LLM', 'Deep Learning'],
      },
    ];
  }
}
