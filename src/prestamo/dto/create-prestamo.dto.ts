import { IsString, IsInt, IsDate, IsOptional } from 'class-validator';

export class CreatePrestamoDto {
  @IsString()
  codigo: string; // Code for the loan

  @IsInt()
  valorPrestado: number; // Initial loan amount

  @IsInt()
  valorTotal: number; // Total value of the loan including interests

  @IsInt()
  saldo: number; // Remaining balance of the loan

  @IsInt()
  cuotas: number; // Total number of installments

  @IsInt()
  interes: number; // Interest amount or rate

  @IsString()
  frecuencia: string; // Frequency of payments (e.g., "monthly", "weekly", etc.)

  @IsInt()
  clienteId: number; // ID of the associated client

  @IsInt()
  cobradorId: number; // ID of the associated collector

  @IsInt()
  estadoId: number; // ID of the current loan status

  @IsInt()
  rutaId: number; // ID of the route associated with the loan

  @IsOptional() // This field is optional
  @IsDate()
  fecha_creacion?: Date; // Creation date of the loan, defaults to now if not provided
  @IsOptional() // This field is optional
  
  @IsDate()
  fecha_finalizacion?: Date; // Creation date of the loan, defaults to now if not provided
}
