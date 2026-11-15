import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  process.env.TZ = 'America/Sao_Paulo';

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // remove campos que não estão no DTO
      forbidNonWhitelisted: true, // e dá erro se mandarem campos extras
      transform: true,            // converte o JSON para a classe do DTO
    }),
  );

  app.enableCors({ origin: 'http://localhost:5173' });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
