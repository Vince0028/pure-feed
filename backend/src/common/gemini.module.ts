import { Module, Global } from '@nestjs/common';
import { GeminiService } from './gemini.service';

/**
 * Global module — GeminiService is available everywhere without importing.
 */
@Global()
@Module({
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
