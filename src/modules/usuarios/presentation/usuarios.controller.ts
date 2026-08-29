import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { UsuariosService } from '../application/usuarios.service';
import { UsuarioResponseDto } from './dto/usuario-response.dto';

@ApiTags('usuarios')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un usuario por id' })
  @ApiOkResponse({ type: UsuarioResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UsuarioResponseDto> {
    return UsuarioResponseDto.fromEntity(
      await this.usuariosService.findByIdOrFail(String(id)),
    );
  }
}
