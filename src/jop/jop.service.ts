import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LoggerService } from 'log/logger.service';
import { PagoService } from 'src/pago/pago.service';
@Injectable()
export default class JopService {
  constructor(private readonly logger: LoggerService, private readonly pagos: PagoService) {
    // this.logger.log('JobService initialized'); // Mensaje para verificar que el servicio se inicializa
  }

    @Cron('* * * * *') 
    handleCron() {
      this.logger.log('KEVIN cron'); // Mensaje para verificar que el método handleCron se llama
       this.pagos.actualizarDiasDeMoraYEstadoPrestamos();
      console.log("actualizarDiasDeMoraYEstadoPrestamos: ")
    }
}
