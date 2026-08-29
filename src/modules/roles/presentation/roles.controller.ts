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
} from '@nestjs/swagger';

import { RolesService } from '../application/roles.service';
import { CrearRolDto } from '../application/dto/crear-rol.dto';
import { RolResponseDto } from './dto/rol-response.dto';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un rol' })
  @ApiCreatedResponse({ type: RolResponseDto })
  @ApiConflictResponse({ description: 'Ya existe un rol con ese nombre.' })
  async create(@Body() dto: CrearRolDto): Promise<RolResponseDto> {
    return RolResponseDto.fromEntity(await this.rolesService.create(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Listar el catálogo de roles' })
  @ApiOkResponse({ type: [RolResponseDto] })
  async findAll(): Promise<RolResponseDto[]> {
    const roles = await this.rolesService.findAll();
    return roles.map((rol) => RolResponseDto.fromEntity(rol));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un rol por id' })
  @ApiOkResponse({ type: RolResponseDto })
  @ApiNotFoundResponse({ description: 'El rol no existe.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RolResponseDto> {
    return RolResponseDto.fromEntity(
      await this.rolesService.findByIdOrFail(String(id)),
    );
  }
}
