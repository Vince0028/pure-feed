import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedPost } from '../common/types';

/**
 * GET /api/feed       — Returns all tech-only posts
 * GET /api/feed/:id   — Returns a single post by ID
 */
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) { }

  @Get()
  async getAll(): Promise<FeedPost[]> {
    return this.feedService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<FeedPost> {
    const post = await this.feedService.getById(id);
    if (!post) throw new NotFoundException(`Post ${id} not found`);
    return post;
  }
}
