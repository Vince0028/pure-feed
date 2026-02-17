import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { SummarizerService } from './summarizer.service';

/**
 * POST /api/summarize
 * Body: { title: string, content?: string }
 * Returns: { summary: string[] }
 */
@Controller('summarize')
export class SummarizerController {
  constructor(private readonly summarizerService: SummarizerService) {}

  @Post()
  @HttpCode(200)
  async summarize(
    @Body() body: { title: string; content?: string },
  ): Promise<{ summary: string[] }> {
    try {
      const summary = await this.summarizerService.summarize(body.title, body.content);
      return { summary };
    } catch {
      return { summary: [] };
    }
  }
}
