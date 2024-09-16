import { IsString, IsInt, IsDate, IsOptional } from 'class-validator';

export class CreatePrestamoDto {
  @IsString()
  codigo: string;

  @IsInt()
  valorPrestado: number;

  @IsInt()
  valorTotal: number;

  @IsInt()
  saldo: number;

  @IsInt()
  cuotas: number;

  @IsInt()
  clienteId: number;

  @IsInt()
  cobradorId: number;

  @IsInt()
  estadoId: number;

  @IsInt()
  rutaId: number;

  @IsDate()
  fecha_creacion?: Date;
}
