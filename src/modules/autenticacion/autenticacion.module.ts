import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import type { JwtConfig } from '../../config/configuration';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AutenticacionService } from './application/autenticacion.service';
import { RefreshTokensService } from './application/refresh-tokens.service';
import { RefreshToken } from './domain/refresh-token.entity';
import { RefreshTokenRepository } from './domain/refresh-token.repository';
import { TypeOrmRefreshTokenRepository } from './infrastructure/typeorm-refresh-token.repository';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { AutenticacionController } from './presentation/autenticacion.controller';

/**
 * Módulo de autenticación. El secreto y la vigencia del token se resuelven en
 * tiempo de arranque desde el ConfigService: nada de valores en el código.
 */
@Module({
  imports: [
    UsuariosModule,
    TypeOrmModule.forFeature([RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwt = configService.getOrThrow<JwtConfig>('jwt');
        return {
          secret: jwt.secret,
          signOptions: {
            // El tipo de `expiresIn` es el literal de `ms` (p. ej. '1h'); el valor
            // real se valida en el esquema Joi al arrancar.
            expiresIn: jwt.expiresIn as JwtSignOptions['expiresIn'],
            issuer: jwt.issuer,
            audience: jwt.audience,
          },
        };
      },
    }),
  ],
  controllers: [AutenticacionController],
  providers: [
    AutenticacionService,
    RefreshTokensService,
    JwtStrategy,
    {
      provide: RefreshTokenRepository,
      useClass: TypeOrmRefreshTokenRepository,
    },
  ],
  exports: [AutenticacionService],
})
export class AutenticacionModule {}
