import { IsInt, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGastoDto {
  @IsInt()
  valor: number;

  @IsString()
  descripcion: string;

  @IsDateString()
  fecha: string;

  @Type(() => Number) // Transformar automáticamente a número
  @IsInt()
  usuarioId: number; // Cambiar a número
}
