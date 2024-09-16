import { Module } from '@nestjs/common';
import { RutaService } from './ruta.service';
import { RutaController } from './ruta.controller';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from 'log/logger.service';

@Module({
  controllers: [RutaController],
  providers: [RutaService, PrismaService, LoggerService],
})
export class RutaModule {}
