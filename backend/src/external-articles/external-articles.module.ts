import { Module } from '@nestjs/common';
import { ExternalArticlesService } from './external-articles.service';

@Module({
    providers: [ExternalArticlesService],
    exports: [ExternalArticlesService],
})
export class ExternalArticlesModule { }
