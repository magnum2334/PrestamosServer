import { Module } from '@nestjs/common';
import { ClienteController } from './cliente.controller';
import { ClienteService } from './cliente.service';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from 'log/logger.service';
import { PrestamoService } from 'src/prestamo/prestamo.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtSecret } from 'src/auth/auth.module';
import { PagoService } from 'src/pago/pago.service';

@Module({
  controllers: [ClienteController],
  imports: [JwtModule.register({
    secret: jwtSecret,
    signOptions: { expiresIn: '1d' },
  }),
  ],
  providers: [
    AuthService,
    ClienteService,
    PrismaService,
    LoggerService,
    PrestamoService,
    PagoService],
})
export class ClienteModule { }
