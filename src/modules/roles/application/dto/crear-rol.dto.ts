import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

/** Datos de entrada para dar de alta un rol. */
export class CrearRolDto {
  @ApiProperty({
    description: 'Nombre del rol, único dentro del catálogo.',
    example: 'Administrador',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MinLength(2)
  // La columna `Nombre` es VARCHAR(100): se rechaza antes de truncar.
  @MaxLength(100)
  nombre: string;
}
