import { Global, Module } from '@nestjs/common';

import { BcryptHashingService } from './bcrypt-hashing.service';
import { HashingService } from './hashing.service';

/**
 * Expone el puerto {@link HashingService} resuelto con bcrypt. Es global porque
 * es una utilidad transversal (registro de usuarios, login, cambio de clave).
 */
@Global()
@Module({
  providers: [{ provide: HashingService, useClass: BcryptHashingService }],
  exports: [HashingService],
})
export class SecurityModule {}
