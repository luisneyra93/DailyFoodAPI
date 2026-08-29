import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import type { SecurityConfig } from '../../config/configuration';
import { HashingService } from './hashing.service';

/** Implementación de {@link HashingService} con bcrypt. */
@Injectable()
export class BcryptHashingService extends HashingService {
  private readonly saltRounds: number;

  constructor(configService: ConfigService) {
    super();
    this.saltRounds =
      configService.getOrThrow<SecurityConfig>('security').bcryptSaltRounds;
  }

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
