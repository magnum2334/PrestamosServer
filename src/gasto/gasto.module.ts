import { Module } from '@nestjs/common';
import { GastoService } from './gasto.service';
import { GastoController } from './gasto.controller';
import { PrismaService } from 'prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtSecret } from 'src/auth/auth.module';

@Module({
  controllers: [GastoController],
  imports: [
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '1d' }, 
    }),
  ],
  providers: [GastoService, PrismaService],
})
export class GastoModule {}
