import { IsString, IsInt, IsBoolean, IsDateString } from 'class-validator';

export class CreateRutaDto {
  @IsString()
  nombre: string;

  @IsInt()
  cobradorId: number;

  @IsInt()
  interes: number;

  @IsInt()
  tMaximoPrestamo: number;

  @IsBoolean()
  interesLibre: boolean;

  @IsDateString()
  fecha_creacion: string;

  @IsInt()
  capitalId: number;
}
