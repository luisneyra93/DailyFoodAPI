import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AccesoDto {
  @ApiProperty({ example: 'luis.neyra@dailyfood.com', format: 'email' })
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'UserName debe ser un correo electrónico válido.' })
  @MaxLength(100)
  userName: string;

  @ApiProperty({ example: 'DailyFood2026!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password: string;
}
