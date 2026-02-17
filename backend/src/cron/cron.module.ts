import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { CronJobService } from './cron.service';
import { YoutubeModule } from '../youtube/youtube.module';
import { RssModule } from '../rss/rss.module';
import { GatekeeperModule } from '../gatekeeper/gatekeeper.module';
import { FeedModule } from '../feed/feed.module';

@Module({
  imports: [YoutubeModule, RssModule, GatekeeperModule, FeedModule],
  controllers: [CronController],
  providers: [CronJobService],
})
export class CronModule {}
