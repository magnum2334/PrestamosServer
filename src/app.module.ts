import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_PIPE } from '@nestjs/core';
import { AuthModule, jwtSecret } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { FileModule } from './file/file.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import { HealthModule } from './health/health.module';
import { ClienteModule } from './cliente/cliente.module';
import { RutaModule } from './ruta/ruta.module';
//import { PrestamoService } from './prestamo/prestamo.service';
import { PrestamoModule } from './prestamo/prestamo.module';
import { PagoModule } from './pago/pago.module';
import { JopModule } from './jop/jop.module';
import { LoggerService } from 'log/logger.service';
import JopService from './jop/jop.service';
import { ScheduleModule } from '@nestjs/schedule';
import { GastoModule } from './gasto/gasto.module';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    
    ScheduleModule.forRoot(),
    AuthModule,
    FileModule,
    UsersModule,
    TerminusModule,
    //modulo Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    HealthModule,
    ClienteModule,
    RutaModule,
    PrestamoModule,
    PagoModule,
    JopModule,
    GastoModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    //PrestamoService,
  ],
})
export class AppModule {}
