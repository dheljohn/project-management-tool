import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const allowedOrigins = [
    process.env.FRONTEND_URL, // e.g. https://proyekto-blue.vercel.app
    'http://localhost:3000',
    ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:8000'] : []),
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Proyekto')
      .setDescription('Kanban-style project management API')
      .setVersion('1.0')
      // Short-lived access token (15 min) — sent with every authenticated request.
      .addCookieAuth(
        'auth_token',
        { type: 'apiKey', in: 'cookie', name: 'auth_token' },
        'auth_token',
      )
      // Long-lived refresh token (7 days) — sent ONLY to POST /testlogin/refresh.
      // Scoped via cookie path so the browser never attaches it to other requests.
      .addCookieAuth(
        'refresh_token',
        { type: 'apiKey', in: 'cookie', name: 'refresh_token' },
        'refresh_token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
