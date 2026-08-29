import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Observable } from 'rxjs';

import { ES_PUBLICO_KEY } from '../../../common/decorators/publico.decorator';

/**
 * Guard global: toda ruta exige JWT salvo que esté marcada con `@Publico()`.
 * Cerrado por defecto — olvidarse de proteger un endpoint no es posible.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const esPublico = this.reflector.getAllAndOverride<boolean>(
      ES_PUBLICO_KEY,
      [context.getHandler(), context.getClass()],
    );

    return esPublico ? true : super.canActivate(context);
  }
}
