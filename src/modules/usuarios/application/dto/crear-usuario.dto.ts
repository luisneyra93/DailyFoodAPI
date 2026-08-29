import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/** Datos de entrada para dar de alta un usuario. */
export class CrearUsuarioDto {
  @ApiProperty({
    description:
      'Correo electrónico del usuario; hace de identificador de acceso.',
    example: 'luis.neyra@dailyfood.com',
    format: 'email',
    maxLength: 100,
  })
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'UserName debe ser un correo electrónico válido.' })
  // La columna `UserName` es VARCHAR(100): se rechaza antes de truncar.
  @MaxLength(100)
  userName: string;

  @ApiProperty({
    description:
      'Contraseña en claro. Se almacena únicamente como hash bcrypt.',
    example: 'DailyFood2026!',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @MinLength(8)
  // bcrypt trunca en 72 bytes: rechazamos antes de que sea un problema.
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'La contraseña debe incluir al menos una minúscula, una mayúscula y un número.',
  })
  password: string;

  @ApiPropertyOptional({
    description:
      'Id del rol a asignar. Si se omite, el usuario queda sin rol (IdRol nulo).',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  idRol?: number;
}
