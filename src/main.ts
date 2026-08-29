import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import type { AppConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appConfig = configService.getOrThrow<AppConfig>('app');

  // Seguridad y CORS.
  app.use(helmet());
  app.enableCors({ origin: appConfig.corsOrigins, credentials: true });

  // Prefijo global y versionado por URI (/api/v1/...).
  app.setGlobalPrefix(appConfig.apiPrefix);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Cierre ordenado de conexiones (BD, etc.).
  app.enableShutdownHooks();

  // Documentación OpenAPI.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('DailyFood API')
    .setDescription('API REST de DailyFood — usuarios y autenticación JWT')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${appConfig.apiPrefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(appConfig.port);

  const base = `http://localhost:${appConfig.port}/${appConfig.apiPrefix}`;
  Logger.log(`🚀 DailyFoodAPI escuchando en ${base}`, 'Bootstrap');
  Logger.log(`📖 Swagger disponible en ${base}/docs`, 'Bootstrap');
}

void bootstrap();
