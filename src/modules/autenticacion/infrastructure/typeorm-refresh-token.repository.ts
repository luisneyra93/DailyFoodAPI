import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { RefreshToken } from '../domain/refresh-token.entity';
import {
  NuevoRefreshToken,
  RefreshTokenRepository,
} from '../domain/refresh-token.repository';

/** Adaptador de {@link RefreshTokenRepository} sobre TypeORM/MySQL. */
@Injectable()
export class TypeOrmRefreshTokenRepository extends RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {
    super();
  }

  save(token: NuevoRefreshToken): Promise<RefreshToken> {
    return this.repository.save(this.repository.create(token));
  }

  findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.repository.findOne({ where: { tokenHash } });
  }

  async revoke(id: string, replacedById: string | null): Promise<void> {
    await this.repository.update(id, { revokedAt: new Date(), replacedById });
  }

  async revokeAllByUsuario(idUsuario: string): Promise<void> {
    await this.repository.update(
      { idUsuario, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }
}
