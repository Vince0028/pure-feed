const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { GatekeeperService } = require('./dist/gatekeeper/gatekeeper.service');
const { SummarizerService } = require('./dist/summarizer/summarizer.service');

async function bootstrap() {
    try {
        const app = await NestFactory.createApplicationContext(AppModule);
        const gate = app.get(GatekeeperService);

        console.log('--- Testing Gatekeeper (Fame Score) ---');
        const res = await gate.classify({
            title: 'Claude 3.5 Sonnet released',
            caption: 'Huge leap in coding benchmarks',
            contentType: 'article'
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
