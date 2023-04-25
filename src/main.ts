import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { logStandar } from './helper/logStandar';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(cookieParser());

  logStandar();
  logStandar('MERCADO URBANO');
  logStandar(`PORT: ${process.env.PORT}`);
  logStandar();
  logStandar('RUTAS');
  logStandar();

  await app.listen(process.env.PORT);

  logStandar();
  logStandar('LOGS');
  logStandar();
}
bootstrap();
