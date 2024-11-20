import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { LoggerService } from 'log/logger.service';
import { PrestamoService } from 'src/prestamo/prestamo.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { PagoService } from 'src/pago/pago.service';

@Controller('cliente')
export class ClienteController {
  constructor(
    private readonly clienteService: ClienteService,
    private readonly prestamoService: PrestamoService,
    private readonly pagoService: PagoService,
    private readonly logger: LoggerService,
  ) { }

  @UseGuards(AuthGuard)
  @Post('create')
  async create(@Body() data) {
    let newClient;
    let newPrestamo;
    let newCuotas = [];
    try {
      newClient = await this.clienteService.create(data['cliente']);
      let prestamo = {
        ...data['prestamo'],
        clienteId: newClient['id'],
      };
      newPrestamo = await this.prestamoService.create(prestamo);
      for (const cuota of data['cuotasDetalles']) {
        let cuotaData = {
          numeroCuota: cuota.numeroCuota,  // Access the property correctly
          monto: cuota.monto,               // Access the property correctly
          fecha: cuota.fecha,               // Correctly assign fecha
          abono: 0,
          prestamoId: newPrestamo.id,       // Use newPrestamo.id to get the ID
        };
        let data = await this.pagoService.create(cuotaData);            // Log cuotaData to see the structure
        newCuotas.push(data); // Assuming create is an async function
      }

    } catch (error) {
      this.logger.error(
        `create cliente error o prestamo error : ${newClient} ${newPrestamo}`,
        'ClienteController : error',
        `create cliente error: ${error}`,
      );
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return { success: true, newClient, newPrestamo, newCuotas };
  }

  @Get()
  findAll() {
    return this.clienteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clienteService.findOne(+id);
  }
  
  @UseGuards(AuthGuard)
  @Get('prestamos/ruta/:rutaId')
  async findPrestamosByRuta(@Param('rutaId', ParseIntPipe) rutaId: number) {
    return this.pagoService.findPrestamosByRuta(rutaId);
  }

  @UseGuards(AuthGuard)
  @Post('prestamo/:prestamoId') // Usamos POST pero mantenemos la ruta
  async findPrestamosPayment(
    @Param('prestamoId', ParseIntPipe) prestamoId: number,
    @Body('abono', ParseIntPipe) abono: number, // Recibimos el abono desde el cuerpo de la solicitud
    @Body('usuarioId', ParseIntPipe) usuarioId: number,
  ) {
    return this.pagoService.findPrestamosPayment({ prestamoId, abono, usuarioId });
  }

  @UseGuards(AuthGuard) // Si estás usando autenticación
  @Get('cartera/:usuarioId/:fechaInicio/:fechaFin')
  async obtenerResumenCartera(
    @Param('usuarioId') usuarioId: number,
    @Param('fechaInicio') fechaInicio: string,
    @Param('fechaFin') fechaFin: string,
  ) {
    return this.pagoService.obtenerResumenCartera(fechaInicio, fechaFin, usuarioId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clienteService.remove(+id);
  }
}


