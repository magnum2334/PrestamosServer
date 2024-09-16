import { Module } from '@nestjs/common';
import { PrestamoService } from './prestamo.service';
import { PrestamoController } from './prestamo.controller';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from 'log/logger.service';

@Module({
  controllers: [PrestamoController],
  providers: [PrestamoService, PrismaService, LoggerService],
})
export class PrestamoModule {}
