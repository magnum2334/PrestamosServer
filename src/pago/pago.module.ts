import { Module } from '@nestjs/common';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from 'log/logger.service';

@Module({
  controllers: [PagoController],
  providers: [PagoService, PrismaService, LoggerService],
})
export class PagoModule {}
