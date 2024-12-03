import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LoggerService } from 'log/logger.service';
import { PagoService } from 'src/pago/pago.service';
@Injectable()
export default class JopService {
  constructor(private readonly logger: LoggerService, private readonly pagos: PagoService) {
    // this.logger.log('JobService initialized'); // Mensaje para verificar que el servicio se inicializa
  }

  @Cron('0 * * * *')
  handleCron() {
    console.log('actualizar Dias De Mora Y Estado de Prestamos: ', new Date().toISOString());
    this.pagos.actualizarDiasDeMoraYEstadoPrestamos();
  }
  
}
