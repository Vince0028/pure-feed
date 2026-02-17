import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { GeminiModule } from './common/gemini.module';
import { FeedModule } from './feed/feed.module';
import { GatekeeperModule } from './gatekeeper/gatekeeper.module';
import { SummarizerModule } from './summarizer/summarizer.module';
import { CronModule } from './cron/cron.module';
import { YoutubeModule } from './youtube/youtube.module';
import { RssModule } from './rss/rss.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    GeminiModule,
    FeedModule,
    YoutubeModule,
    RssModule,
    GatekeeperModule,
    SummarizerModule,
    CronModule,
  ],
})
export class AppModule {}
