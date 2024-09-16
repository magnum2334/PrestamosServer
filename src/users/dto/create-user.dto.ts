import { IsString, IsEmail, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly nombre?: string;

  @IsOptional()
  @IsString()
  readonly estado?: string;

  @IsOptional()
  @IsString()
  readonly telefono?: string;

  @IsNumber()
  @IsNotEmpty()
  readonly rolId: number;

  @IsOptional()
  @IsString()
  readonly managerId: number;

  @IsOptional()
  @IsString()
  readonly fecha_creacion: Date;
}
