import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

let appPromise: Promise<void> | null = null;

async function bootstrap() {
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(server),
    );
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: process.env.FRONTEND_URL || '*',
        methods: 'GET,POST,PUT,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
}

export default async function handler(req: any, res: any) {
    if (!appPromise) {
        appPromise = bootstrap();
    }
    await appPromise;
    server(req, res);
}
