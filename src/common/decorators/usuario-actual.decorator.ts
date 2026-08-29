import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

import type { UsuarioAutenticado } from '../security/usuario-autenticado';

/**
 * Inyecta el usuario autenticado (o una de sus propiedades) en el controlador,
 * evitando manipular `request.user` sin tipar.
 */
export const UsuarioActual = createParamDecorator(
  (data: keyof UsuarioAutenticado | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    // `request.user` lo rellena Passport: el nombre viene del framework.
    const usuario = request.user as UsuarioAutenticado;
    return data ? usuario?.[data] : usuario;
  },
);
