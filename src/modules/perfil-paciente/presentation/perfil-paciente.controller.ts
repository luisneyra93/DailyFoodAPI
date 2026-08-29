import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import { CrearPerfilPacienteDto } from '../application/dto/crear-perfil-paciente.dto';
import { PerfilPacienteService } from '../application/perfil-paciente.service';
import { PerfilPacienteResponseDto } from './dto/perfil-paciente-response.dto';

@ApiTags('perfil-paciente')
@ApiBearerAuth()
@Controller('perfil-paciente')
export class PerfilPacienteController {
  constructor(private readonly perfilPacienteService: PerfilPacienteService) {}

  @Post()
  @ApiOperation({ summary: 'Crear el perfil de un paciente' })
  @ApiCreatedResponse({ type: PerfilPacienteResponseDto })
  @ApiNotFoundResponse({ description: 'El usuario no existe.' })
  @ApiUnprocessableEntityResponse({
    description: 'El usuario no tiene rol Paciente.',
  })
  @ApiConflictResponse({ description: 'El usuario ya tiene perfil.' })
  async create(
    @Body() dto: CrearPerfilPacienteDto,
  ): Promise<PerfilPacienteResponseDto> {
    return PerfilPacienteResponseDto.fromEntity(
      await this.perfilPacienteService.create(dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar perfiles de paciente' })
  @ApiOkResponse({ type: [PerfilPacienteResponseDto] })
  async findAll(): Promise<PerfilPacienteResponseDto[]> {
    const perfiles = await this.perfilPacienteService.findAll();
    return perfiles.map((perfil) =>
      PerfilPacienteResponseDto.fromEntity(perfil),
    );
  }

  @Get('usuario/:idUsuario')
  @ApiOperation({ summary: 'Consultar el perfil por id de usuario' })
  @ApiOkResponse({ type: PerfilPacienteResponseDto })
  @ApiNotFoundResponse({ description: 'El usuario no tiene perfil.' })
  async findByUsuario(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
  ): Promise<PerfilPacienteResponseDto> {
    return PerfilPacienteResponseDto.fromEntity(
      await this.perfilPacienteService.findByIdUsuarioOrFail(String(idUsuario)),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un perfil por id' })
  @ApiOkResponse({ type: PerfilPacienteResponseDto })
  @ApiNotFoundResponse({ description: 'El perfil no existe.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PerfilPacienteResponseDto> {
    return PerfilPacienteResponseDto.fromEntity(
      await this.perfilPacienteService.findByIdOrFail(String(id)),
    );
  }
}
