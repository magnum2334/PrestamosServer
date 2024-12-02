import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    const logDir = path.resolve('log');

    // Crear el directorio de logs si no existe
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    this.logger = winston.createLogger({
      transports: [
        new winston.transports.File({
          level: 'info',
          filename: path.join(logDir, 'app.log'),
          handleExceptions: true,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
      exitOnError: false,
    });

    // Ejecutar la limpieza de logs antiguos al iniciar
    this.cleanOldLogs(logDir, 14); // Retención de 14 días
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace: string, context?: string) {
    this.logger.error(message, { context, trace });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  /**
   * Limpia automáticamente logs más antiguos que el período configurado.
   * @param logDir Directorio donde se almacenan los logs.
   * @param retentionDays Días de retención de los logs.
   */
  private cleanOldLogs(logDir: string, retentionDays: number) {
    fs.readdir(logDir, (err, files) => {
      if (err) {
        this.logger.error('Error al leer la carpeta de logs', err.message);
        return;
      }

      const now = Date.now();
      files.forEach(file => {
        const filePath = path.join(logDir, file);

        fs.stat(filePath, (err, stats) => {
          if (err) {
            this.logger.error(`Error al procesar archivo: ${file}`, err.message);
            return;
          }

          const fileAge = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24); // Edad del archivo en días
          if (fileAge > retentionDays) {
            fs.unlink(filePath, err => {
              if (err) {
                this.logger.error(`Error al eliminar archivo: ${file}`, err.message);
              } else {
                this.logger.info(`Archivo de log eliminado: ${filePath}`);
              }
            });
          }
        });
      });
    });
  }
}
