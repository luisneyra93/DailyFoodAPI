import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import type { DatabaseConfig } from '../config/configuration';

/**
 * Configura TypeORM de forma asíncrona a partir del ConfigService (no hardcodea
 * credenciales). `autoLoadEntities` deja que cada feature registre su entidad.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const db = configService.getOrThrow<DatabaseConfig>('database');
        return {
          type: 'mysql',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          autoLoadEntities: true,
          synchronize: db.synchronize, // false siempre; usar migraciones
          logging: db.logging,
          timezone: 'Z',
          charset: 'utf8mb4_general_ci',
          // Las columnas DATE se leen como cadena 'YYYY-MM-DD'. Sin esto el driver
          // las convierte a Date en UTC y, al pasarlas a texto en la zona local,
          // una fecha de nacimiento se desplaza un día.
          extra: { dateStrings: ['DATE'] },
          migrations: [`${__dirname}/migrations/*{.ts,.js}`],
        };
      },
    }),
  ],
})
export class DatabaseModule {}
