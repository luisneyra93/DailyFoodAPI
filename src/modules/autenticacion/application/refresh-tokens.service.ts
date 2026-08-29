import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';

import type { JwtConfig } from '../../../config/configuration';
import { RefreshTokenRepository } from '../domain/refresh-token.repository';

/** Token recién emitido, con la única copia en claro que existirá. */
export interface RefreshTokenEmitido {
  readonly token: string;
  readonly expiresAt: Date;
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * Emisión, rotación y revocación de refresh tokens.
 *
 * Se usan tokens opacos guardados como hash, no JWT: así el servidor es la
 * fuente de verdad y una sesión puede revocarse de inmediato, cosa imposible
 * con un JWT de larga vida.
 *
 * La rotación es obligatoria: cada refresco invalida el token usado y emite uno
 * nuevo. Si llega un token ya revocado, se asume que fue robado y se revocan
 * todas las sesiones del usuario.
 */
@Injectable()
export class RefreshTokensService {
  private readonly logger = new Logger(RefreshTokensService.name);
  private readonly ttlDias: number;

  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    configService: ConfigService,
  ) {
    this.ttlDias = configService.getOrThrow<JwtConfig>('jwt').refreshTtlDias;
  }

  async issue(idUsuario: string): Promise<RefreshTokenEmitido> {
    // 384 bits de entropía: no hace falta más protección que el hash.
    const token = randomBytes(48).toString('base64url');
    const expiresAt = new Date(Date.now() + this.ttlDias * MS_POR_DIA);

    await this.refreshTokenRepository.save({
      idUsuario,
      tokenHash: this.hash(token),
      expiresAt,
    });

    return { token, expiresAt };
  }

  /**
   * Valida el token recibido, lo invalida y emite uno nuevo para el mismo
   * usuario. Devuelve el id de usuario para que quien llama reconstruya la
   * respuesta de autenticación.
   */
  async rotate(
    token: string,
  ): Promise<{ idUsuario: string; refreshToken: RefreshTokenEmitido }> {
    const almacenado = await this.refreshTokenRepository.findByTokenHash(
      this.hash(token),
    );

    if (!almacenado) {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    if (almacenado.revokedAt) {
      // Un token revocado que vuelve a aparecer sólo se explica por un robo:
      // se cortan todas las sesiones del usuario.
      this.logger.warn(
        `Reúso de refresh token del usuario ${almacenado.idUsuario}: se revocan sus sesiones.`,
      );
      await this.refreshTokenRepository.revokeAllByUsuario(
        almacenado.idUsuario,
      );
      throw new UnauthorizedException('Refresh token inválido.');
    }

    if (almacenado.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expirado.');
    }

    const refreshToken = await this.issue(almacenado.idUsuario);
    const nuevo = await this.refreshTokenRepository.findByTokenHash(
      this.hash(refreshToken.token),
    );
    await this.refreshTokenRepository.revoke(almacenado.id, nuevo?.id ?? null);

    return { idUsuario: almacenado.idUsuario, refreshToken };
  }

  /** Cierre de sesión: revoca el token recibido. Es idempotente. */
  async revoke(token: string): Promise<void> {
    const almacenado = await this.refreshTokenRepository.findByTokenHash(
      this.hash(token),
    );
    if (almacenado && !almacenado.revokedAt) {
      await this.refreshTokenRepository.revoke(almacenado.id, null);
    }
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
