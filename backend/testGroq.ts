import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { GatekeeperService } from './src/gatekeeper/gatekeeper.service';
import { SummarizerService } from './src/summarizer/summarizer.service';

async function bootstrap() {
    try {
        const app = await NestFactory.createApplicationContext(AppModule);
        const gate = app.get(GatekeeperService);

        console.log('--- Testing Gatekeeper (Fame Score) ---');
        const res = await gate.classify({
            id: 'test-id',
            pubDate: 'today',
            sourceId: 'test-source',
            link: 'test-link',
            title: 'Claude 3.5 Sonnet released',
            caption: 'Huge leap in coding benchmarks',
            contentType: 'article',
            thumbnail: 'none'
        });
        console.log('Gatekeeper Response:', res);

        console.log('--- Testing Summarizer (New Format) ---');
        const sum = app.get(SummarizerService);
        const res2 = await sum.summarize(
            'Claude 3.5 Sonnet released',
            'It scores 92% on HumanEval, beating GPT-4o. The model is dramatically faster and cheaper for developers.'
        );
        console.log('Summarizer Response:', res2);

        await app.close();
    } catch (e) {
        console.error(e);
    }
}

bootstrap();
