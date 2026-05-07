import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(3006);
  console.log('🚀 Backend #6 (CQRS + Event Sourcing) running on http://localhost:3006');
  console.log('📖 Read models built from event store');
  console.log('✍️ Commands append to event store');
}
bootstrap();
