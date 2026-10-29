import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permite que el front (otro puerto = otro origen) llame a la API
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5180',
  });

  // Valida los DTOs: descarta campos de más y rechaza los desconocidos
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // Swagger: documentación generada a partir de los controllers y DTOs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Gastos fijos API')
    .setDescription('API para registrar gastos fijos, días de débito y montos')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(process.env.PORT ?? 3100);
}
void bootstrap();
