import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { LoggerService } from 'log/logger.service';
import { PrestamoService } from 'src/prestamo/prestamo.service';

@Controller('cliente')
export class ClienteController {
  constructor(
    private readonly clienteService: ClienteService,
    private readonly prestamoService: PrestamoService,
    private readonly logger: LoggerService,
  ) {}

  @Post('create')
  async create(@Body() data) {
    let newClient;
    let newPrestamo;
    try {
      newClient = await this.clienteService.create(data['cliente']);
      let prestamo = {
        ...data['prestamo'],
        clienteId: newClient['id'],
      };
      newPrestamo = await this.prestamoService.create(prestamo);
    } catch (error) {
      this.logger.error(
        `create cliente error o prestamo error : ${newClient} ${newPrestamo}`,
        'ClienteController : error',
        `create cliente error: ${error}`,
      );
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return { success: true, newClient, newPrestamo };
  }

  @Get()
  findAll() {
    return this.clienteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clienteService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clienteService.remove(+id);
  }
}
