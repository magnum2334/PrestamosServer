import { Module } from '@nestjs/common';
import { ClienteController } from './cliente.controller';
import { ClienteService } from './cliente.service';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from 'log/logger.service';
import { PrestamoService } from 'src/prestamo/prestamo.service';

@Module({
  controllers: [ClienteController],
  providers: [ClienteService, PrismaService, LoggerService, PrestamoService],
})
export class ClienteModule {}
