import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix — all routes become /api/*
  app.setGlobalPrefix('api');

  // Enable CORS for the frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: 'GET,POST',
    credentials: true,
  });

  // Validation pipe for DTOs
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 NoFluff.ai backend running on http://localhost:${port}/api`);
}

bootstrap();
