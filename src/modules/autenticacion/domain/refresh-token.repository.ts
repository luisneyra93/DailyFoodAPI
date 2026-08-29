import type { RefreshToken } from './refresh-token.entity';

/** Datos necesarios para persistir un refresh token (el hash ya viene calculado). */
export interface NuevoRefreshToken {
  readonly idUsuario: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
}

/** Puerto de persistencia de refresh tokens. */
export abstract class RefreshTokenRepository {
  abstract save(token: NuevoRefreshToken): Promise<RefreshToken>;
  abstract findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  /** Marca un token como revocado, indicando cuál lo sustituye si hubo rotación. */
  abstract revoke(id: string, replacedById: string | null): Promise<void>;
  /** Revoca todas las sesiones vivas de un usuario. */
  abstract revokeAllByUsuario(idUsuario: string): Promise<void>;
}
