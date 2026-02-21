import { Controller, Get, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CronJobService } from './cron.service';

/**
 * GET /api/cron/fetch-latest
 *
 * Manually trigger the fetch pipeline.
 * In production, secured with CRON_SECRET header (Vercel Cron sends this).
 * In development, the secret check is skipped if CRON_SECRET is not set.
 */
@Controller('cron')
export class CronController {
  private readonly logger = new Logger(CronController.name);

  constructor(
    private readonly cronService: CronJobService,
    private readonly config: ConfigService,
  ) { }

  @Get('fetch-latest')
  async fetchLatest(
    @Headers('authorization') authHeader: string,
  ) {
    // Verify cron secret in production
    const secret = this.config.get<string>('CRON_SECRET');
    if (secret && authHeader !== `Bearer ${secret}`) {
      throw new UnauthorizedException('Invalid cron secret');
    }

    this.logger.log('Manual fetch triggered via /api/cron/fetch-latest');

    // Fire and forget: the pipeline takes ~8 mins (due to Apify + Gatekeeper throttling)
    // Serverless platforms will kill the HTTP request long before it finishes if we await it.
    this.cronService.fetchAndFilter().catch(err => {
      this.logger.error('Background fetchAndFilter pipeline failed', err);
    });

    return {
      success: true,
      message: 'Feed synchronization started in the background. Supabase will update dynamically.',
      status: 'processing'
    };
  }
}
