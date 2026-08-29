import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { UsuarioActual } from '../../../common/decorators/usuario-actual.decorator';
import { Publico } from '../../../common/decorators/publico.decorator';
import { UsuariosService } from '../../usuarios/application/usuarios.service';
import { UsuarioResponseDto } from '../../usuarios/presentation/dto/usuario-response.dto';
import { AutenticacionService } from '../application/autenticacion.service';
import { AccesoDto } from '../application/dto/acceso.dto';
import { RegistroDto } from '../application/dto/registro.dto';
import { RegistroPacienteDto } from '../application/dto/registro-paciente.dto';
import { RefrescoDto } from '../application/dto/refresco.dto';
import { CierreSesionDto } from '../application/dto/cierre-sesion.dto';
import { AutenticacionResponseDto } from './dto/autenticacion-response.dto';

@ApiTags('autenticacion')
@Controller('autenticacion')
export class AutenticacionController {
  constructor(
    private readonly autenticacionService: AutenticacionService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Publico()
  @Post('registro')
  @ApiOperation({ summary: 'Registrar un usuario nuevo' })
  @ApiCreatedResponse({ type: AutenticacionResponseDto })
  @ApiConflictResponse({ description: 'El nombre de usuario ya existe.' })
  register(@Body() dto: RegistroDto): Promise<AutenticacionResponseDto> {
    return this.autenticacionService.register(dto);
  }

  @Publico()
  @Post('registro/paciente')
  @ApiOperation({
    summary: 'Registrar un usuario con rol Paciente',
    description:
      'Igual que /autenticacion/registro pero forzando el rol Paciente (ROL_PACIENTE_ID).',
  })
  @ApiCreatedResponse({ type: AutenticacionResponseDto })
  @ApiConflictResponse({ description: 'El nombre de usuario ya existe.' })
  registerPaciente(
    @Body() dto: RegistroPacienteDto,
  ): Promise<AutenticacionResponseDto> {
    return this.autenticacionService.registerPaciente(dto);
  }

  @Publico()
  @Post('acceso')
  @HttpCode(HttpStatus.OK)
  // Límite más estricto que el global: frena el fuerza bruta de contraseñas.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Autenticar y obtener un access token' })
  @ApiOkResponse({ type: AutenticacionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas.' })
  @ApiTooManyRequestsResponse({ description: 'Demasiados intentos de login.' })
  login(@Body() dto: AccesoDto): Promise<AutenticacionResponseDto> {
    return this.autenticacionService.login(dto);
  }

  @Publico()
  @Post('refresco')
  @HttpCode(HttpStatus.OK)
  // Un refresco legítimo es esporádico; un atacante probando tokens, no.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Renovar el access token',
    description:
      'Rota el refresh token: el recibido queda invalidado y se entrega uno nuevo.',
  })
  @ApiOkResponse({ type: AutenticacionResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Refresh token inválido, expirado o ya usado.',
  })
  refresh(@Body() dto: RefrescoDto): Promise<AutenticacionResponseDto> {
    return this.autenticacionService.refresh(dto);
  }

  @Publico()
  @Post('cierre-sesion')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Revoca el refresh token recibido. Es idempotente: no informa de si el token existía.',
  })
  @ApiNoContentResponse({ description: 'Sesión cerrada.' })
  logout(@Body() dto: CierreSesionDto): Promise<void> {
    return this.autenticacionService.logout(dto);
  }

  @Get('yo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perfil del usuario autenticado' })
  @ApiOkResponse({ type: UsuarioResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, inválido o expirado.',
  })
  async me(
    @UsuarioActual('id') idUsuario: string,
  ): Promise<UsuarioResponseDto> {
    return UsuarioResponseDto.fromEntity(
      await this.usuariosService.findByIdOrFail(idUsuario),
    );
  }
}
