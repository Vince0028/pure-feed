import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedPost } from '../common/types';

/**
 * GET /api/feed       — Returns all tech-only posts
 * GET /api/feed/:id   — Returns a single post by ID
 */
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  getAll(): FeedPost[] {
    return this.feedService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string): FeedPost {
    const post = this.feedService.getById(id);
    if (!post) throw new NotFoundException(`Post ${id} not found`);
    return post;
  }
}
