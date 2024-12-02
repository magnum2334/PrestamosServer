import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, HttpException } from '@nestjs/common';
import { GastoService } from './gasto.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
@Controller('gasto')
export class GastoController {
  constructor(private readonly gastoService: GastoService) {}

  
  @Post('create')
  @UseGuards(AuthGuard)
  async createGasto(@Body() createGastoDto: CreateGastoDto) {
    try {
      const { usuarioId, ...rest } = createGastoDto;

      // Validar datos adicionales si es necesario
      if (!usuarioId || isNaN(Number(usuarioId))) {
        throw new HttpException('usuarioId debe ser un número válido.', HttpStatus.BAD_REQUEST);
      }

      // Crear el gasto en la base de datos
      const gasto = await this.gastoService.create({
        ...rest,
        usuarioId: Number(usuarioId),
        fecha: new Date(createGastoDto.fecha),
      });

      // Retornar respuesta exitosa
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Gasto creado exitosamente',
        data: gasto,
      };
    } catch (error) {
      // Manejo de errores genéricos
      if (error instanceof HttpException) {
        // Si lanzamos una HttpException, reutilizarla
        throw error;
      }

      // En caso de errores inesperados
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ocurrió un error al crear el gasto',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get()
  findAll() {
    return this.gastoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gastoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGastoDto: UpdateGastoDto) {
    return this.gastoService.update(+id, updateGastoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gastoService.remove(+id);
  }
}
