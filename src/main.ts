import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  dotenv.config(); // Carga las variables de entorno desde .env
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted:true
    }),
  );
  await app.listen(3000);
}
bootstrap();
