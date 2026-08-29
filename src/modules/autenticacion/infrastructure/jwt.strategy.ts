import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { UsuarioAutenticado } from '../../../common/security/usuario-autenticado';
import type { JwtConfig } from '../../../config/configuration';
import { UsuariosService } from '../../usuarios/application/usuarios.service';
import type { JwtPayload } from '../application/jwt-payload';

/**
 * Valida el access token y resuelve la identidad de la request. Además de la
 * firma, comprueba que el usuario siga existiendo: un token de una cuenta
 * borrada deja de ser válido de inmediato.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {
    const jwt = configService.getOrThrow<JwtConfig>('jwt');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwt.secret,
      issuer: jwt.issuer,
      audience: jwt.audience,
    });
  }

  async validate(payload: JwtPayload): Promise<UsuarioAutenticado> {
    const usuario = await this.usuariosService
      .findByIdOrFail(payload.sub)
      .catch(() => null);

    if (!usuario) {
      throw new UnauthorizedException('El usuario del token ya no existe.');
    }

    return { id: String(usuario.id), userName: usuario.userName };
  }
}
