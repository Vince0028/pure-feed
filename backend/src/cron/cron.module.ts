import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { CronJobService } from './cron.service';
import { YoutubeModule } from '../youtube/youtube.module';
import { RssModule } from '../rss/rss.module';
import { ExternalArticlesModule } from '../external-articles/external-articles.module';
import { GatekeeperModule } from '../gatekeeper/gatekeeper.module';
import { FeedModule } from '../feed/feed.module';
import { TiktokModule } from '../tiktok/tiktok.module';

@Module({
  imports: [YoutubeModule, RssModule, ExternalArticlesModule, GatekeeperModule, FeedModule, TiktokModule],
  controllers: [CronController],
  providers: [CronJobService],
})
export class CronModule { }
