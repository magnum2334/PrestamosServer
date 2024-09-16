import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LoggerService } from 'log/logger.service';
@Injectable()
export class JopService {
  constructor(private readonly logger: LoggerService) {
    // this.logger.log('JobService initialized'); // Mensaje para verificar que el servicio se inicializa
  }

  // async actualizarDiasDeMora() {
  //   this.logger.error('test:', 'test', 'test');
  // }

  // @Cron('* * * * *') 
  // handleCron() {
  //   this.logger.log('ALEJANDRO cron'); // Mensaje para verificar que el método handleCron se llama
  //   // this.actualizarDiasDeMora();
  //   console.log("hola mundo")
  // }
}
