import { Module } from '@nestjs/common';
import JopService from './jop.service';
import { JopController } from './jop.controller';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from 'log/logger.service';
import { PagoService } from 'src/pago/pago.service';

@Module({
  controllers: [JopController],
  providers: [JopService, PrismaService, LoggerService, PagoService],
})
export class JopModule {}
