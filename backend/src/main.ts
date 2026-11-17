import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { PASTA_UPLOADS } from './pets/fotos';

async function bootstrap() {
  process.env.TZ = 'America/Sao_Paulo';

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // remove campos que não estão no DTO
      forbidNonWhitelisted: true, // e dá erro se mandarem campos extras
      transform: true,            // converte o JSON para a classe do DTO
    }),
  );

  app.enableCors({ origin: 'http://localhost:5173' });

  // http://localhost:3000/uploads/pets/<arquivo>.jpg
  app.useStaticAssets(PASTA_UPLOADS, {
    prefix: '/uploads/',
    maxAge: '30d', // cada upload tem nome novo, então pode ficar em cache
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
