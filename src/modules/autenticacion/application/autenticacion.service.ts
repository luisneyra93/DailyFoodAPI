import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { HashingService } from '../../../common/security/hashing.service';
import type { JwtConfig, RolesConfig } from '../../../config/configuration';
import { UsuariosService } from '../../usuarios/application/usuarios.service';
import type { Usuario } from '../../usuarios/domain/usuario.entity';
import { UsuarioResponseDto } from '../../usuarios/presentation/dto/usuario-response.dto';
import { AutenticacionResponseDto } from '../presentation/dto/autenticacion-response.dto';
import { AccesoDto } from './dto/acceso.dto';
import { CierreSesionDto } from './dto/cierre-sesion.dto';
import { RefrescoDto } from './dto/refresco.dto';
import { RegistroDto } from './dto/registro.dto';
import { RegistroPacienteDto } from './dto/registro-paciente.dto';
import type { JwtPayload } from './jwt-payload';
import {
  RefreshTokenEmitido,
  RefreshTokensService,
} from './refresh-tokens.service';

/**
 * Hash bcrypt de descarte. Al comparar contra él cuando el usuario no existe,
 * el login tarda lo mismo con usuario válido o inválido y no se puede deducir
 * qué cuentas existen midiendo tiempos (user enumeration).
 */
const DUMMY_HASH =
  '$2b$12$C6UzMDM.H6dfI/f/IKcEe.7Kkf/1cGDG7yq6qKz0y8hE2h9CQ5Xg2';

@Injectable()
export class AutenticacionService {
  private readonly logger = new Logger(AutenticacionService.name);
  private readonly jwtConfig: JwtConfig;
  private readonly pacienteRolId: number;

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly hashingService: HashingService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.jwtConfig = configService.getOrThrow<JwtConfig>('jwt');
    this.pacienteRolId =
      configService.getOrThrow<RolesConfig>('roles').pacienteId;
  }

  /** Alta de usuario; devuelve ya autenticado para evitar un login extra. */
  async register(dto: RegistroDto): Promise<AutenticacionResponseDto> {
    const usuario = await this.usuariosService.create(dto);
    return this.buildAuthResponse(usuario);
  }

  /** Alta de paciente: el rol lo impone el servidor, no el cliente. */
  async registerPaciente(
    dto: RegistroPacienteDto,
  ): Promise<AutenticacionResponseDto> {
    const usuario = await this.usuariosService.create({
      ...dto,
      idRol: this.pacienteRolId,
    });
    return this.buildAuthResponse(usuario);
  }

  async login(dto: AccesoDto): Promise<AutenticacionResponseDto> {
    const usuario = await this.usuariosService.findByUserNameWithPassword(
      dto.userName,
    );

    const passwordMatches = await this.hashingService.compare(
      dto.password,
      usuario?.password ?? DUMMY_HASH,
    );

    // Mensaje genérico a propósito: no revela si falló el usuario o la clave.
    if (!usuario || !passwordMatches) {
      this.logger.warn(`Intento de login fallido para "${dto.userName}"`);
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    return this.buildAuthResponse(usuario);
  }

  /**
   * Cambia un refresh token válido por un par de tokens nuevo. El token usado
   * queda revocado en el mismo paso (rotación).
   */
  async refresh(dto: RefrescoDto): Promise<AutenticacionResponseDto> {
    const { idUsuario, refreshToken } = await this.refreshTokensService.rotate(
      dto.refreshToken,
    );

    // El usuario pudo borrarse mientras el refresh token seguía vivo.
    const usuario = await this.usuariosService
      .findByIdOrFail(idUsuario)
      .catch(() => null);

    if (!usuario) {
      throw new UnauthorizedException('El usuario del token ya no existe.');
    }

    return this.buildAuthResponse(usuario, refreshToken);
  }

  /** Cierre de sesión: invalida el refresh token recibido. */
  async logout(dto: CierreSesionDto): Promise<void> {
    await this.refreshTokensService.revoke(dto.refreshToken);
  }

  private async buildAuthResponse(
    usuario: Usuario,
    refreshTokenExistente?: RefreshTokenEmitido,
  ): Promise<AutenticacionResponseDto> {
    const payload: JwtPayload = {
      sub: String(usuario.id),
      userName: usuario.userName,
    };
    const accessToken = this.jwtService.sign(payload);
    const { iat, exp } = this.jwtService.decode<JwtPayload>(accessToken);

    // En un refresco el token ya viene emitido por la rotación; en el resto de
    // flujos se emite aquí.
    const refreshToken =
      refreshTokenExistente ??
      (await this.refreshTokensService.issue(String(usuario.id)));

    const response = new AutenticacionResponseDto();
    response.accessToken = accessToken;
    response.tokenType = 'Bearer';
    response.expiresIn = exp && iat ? exp - iat : 0;
    response.refreshToken = refreshToken.token;
    response.refreshTokenExpiresAt = refreshToken.expiresAt;
    response.usuario = UsuarioResponseDto.fromEntity(usuario);
    return response;
  }
}
