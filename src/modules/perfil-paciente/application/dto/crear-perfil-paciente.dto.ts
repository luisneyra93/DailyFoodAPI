import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/** Recorta espacios y convierte la cadena vacía en `null`. */
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || null : value;

/** Datos de entrada para dar de alta el perfil de un paciente. */
export class CrearPerfilPacienteDto {
  @ApiProperty({
    description: 'Id del usuario dueño del perfil. Debe tener rol Paciente.',
    example: 3,
  })
  @IsInt()
  @Min(1)
  idUsuario: number;

  @ApiProperty({ example: 'Luis', maxLength: 100 })
  @IsString()
  @Transform(trim)
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'Neyra', maxLength: 45 })
  @IsString()
  @Transform(trim)
  @MinLength(2)
  @MaxLength(45)
  apellidoPaterno: string;

  @ApiPropertyOptional({ example: 'Morales', maxLength: 45 })
  @IsOptional()
  @IsString()
  @Transform(trim)
  @MinLength(2)
  @MaxLength(45)
  apellidoMaterno?: string;

  @ApiProperty({
    description: 'Fecha de nacimiento en formato ISO (YYYY-MM-DD).',
    example: '1993-05-14',
    format: 'date',
  })
  @IsDateString({ strict: true })
  fechaNacimiento: string;

  @ApiProperty({
    description: 'Estatura en metros, con hasta dos decimales.',
    example: 1.75,
    minimum: 0.3,
    maximum: 2.8,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.3)
  @Max(2.8)
  estatura: number;

  @ApiProperty({
    description: 'Peso en kilogramos, con hasta dos decimales.',
    example: 72.5,
    minimum: 1,
    maximum: 500,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(500)
  peso: number;
}
