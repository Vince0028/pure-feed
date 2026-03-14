import { configure as serverlessExpress } from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedServer: any;

export const handler = async (event: any, context: any, callback: any) => {
  // If triggered by AWS EventBridge (the 3-day cron job)
  if (event.source === 'aws.events') {
    // We fool the serverless wrapper into thinking we made an HTTP request
    // directly to the fetch-latest endpoint!
    event = {
      ...event,
      path: '/api/cron/fetch-latest',
      httpMethod: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'aws-cron-secret'}`,
        'Host': 'localhost'
      },
      requestContext: {}
    };
  }

  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    
    // Exact same configuration as main.ts
    app.setGlobalPrefix('api');
    app.enableCors({
      origin: '*',
      methods: 'GET,POST',
    });
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    cachedServer = serverlessExpress({ app: expressApp });
  }

  return cachedServer(event, context, callback);
};
