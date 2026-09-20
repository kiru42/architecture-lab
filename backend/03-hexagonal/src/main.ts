import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Allow the Vite dev servers to call the API directly during local development
  app.enableCors();

  // Every TaskFlow backend listens on PORT and defaults to 3000 (see openapi.yaml)
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Hexagonal backend running on http://localhost:${port}`);
}

bootstrap();
