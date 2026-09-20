import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './infrastructure/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Allow the Vite dev servers to call the API directly during local development
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🧅 Onion Architecture backend running on http://localhost:${port}`);
}
bootstrap();
