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
  ) {}

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
    const result = await this.cronService.fetchAndFilter();

    return {
      success: true,
      message: `Fetched ${result.fetched} items → ${result.passed} passed gatekeeper → ${result.stored} new posts stored`,
      ...result,
    };
  }
}
