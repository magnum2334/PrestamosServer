import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RutaService } from './ruta.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { LoggerService } from 'log/logger.service';

@Controller('ruta')
export class RutaController {
  constructor(
    private readonly rutaService: RutaService,
    private readonly logger: LoggerService,
  ) {}

  @Post('create')
  async create(@Body() createRutaDto: CreateRutaDto) {
    let ruta;
    try {
      ruta = await this.rutaService.create(createRutaDto);
    } catch (error) {
      this.logger.error(
        `create Ruta error: ${ruta}`,
        'RutaController : error',
        `error: ${error}`,
      );
    }
    return ruta;
  }

  @Get()
  findAll() {
    return this.rutaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rutaService.findOne(+id);
  }

  @Get('cobrador/:cobradorId') // Nueva ruta para buscar por cobradorId
  findByCobradorId(@Param('cobradorId') cobradorId: string) {
    return this.rutaService.findByCobradorId(+cobradorId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRutaDto: UpdateRutaDto) {
    return this.rutaService.update(+id, updateRutaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rutaService.remove(+id);
  }
}
