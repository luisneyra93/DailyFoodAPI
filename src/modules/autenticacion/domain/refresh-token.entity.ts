import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Refresh token emitido a un usuario.
 *
 * Nunca se guarda el token en claro: sólo su hash SHA-256. Si alguien lee la
 * tabla no puede usar los tokens, igual que con las contraseñas. Basta SHA-256
 * (y no bcrypt) porque el token es un valor aleatorio de 384 bits, no algo
 * adivinable por fuerza bruta.
 */
@Entity({ name: 'RefreshTokens' })
export class RefreshToken {
  /** `BIGINT` se expone como `string` para no perder precisión en JS. */
  @PrimaryGeneratedColumn({ name: 'Id', type: 'bigint' })
  id: string;

  @Column({ name: 'IdUsuario', type: 'bigint' })
  idUsuario: string;

  @Column({ name: 'TokenHash', type: 'char', length: 64 })
  tokenHash: string;

  @Column({ name: 'ExpiresAt', type: 'datetime' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime' })
  createdAt: Date;

  /** Fecha de revocación: al rotarlo, al cerrar sesión o al detectar reúso. */
  @Column({ name: 'RevokedAt', type: 'datetime', nullable: true })
  revokedAt: Date | null;

  /** Token que lo sustituyó al rotar. Deja la cadena de rotación auditable. */
  @Column({ name: 'ReplacedById', type: 'bigint', nullable: true })
  replacedById: string | null;
}
