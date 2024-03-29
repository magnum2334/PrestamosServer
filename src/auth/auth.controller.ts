import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoggerService } from 'log/logger.service';
import { OnEvent } from '@nestjs/event-emitter';
import { PublicEndpoint } from 'src/utils/public-endpoint.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: LoggerService,
  ) {}

  @PublicEndpoint()
  @Post('login')
  login(@Body() { email, password }: LoginDto) {
    const token = this.authService.login(email, password);

    if (token) {
      // Emitir el evento 'user.login' después de la autenticación
      this.eventEmitter.emit('user.login', email);
    }

    return token;
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // Escuchar el evento 'user.login'
  @OnEvent('user.login')
  handleUserLoginEvent(email: string) {
    this.logger.log(`Usuario ha iniciado sesión: ${email}`, 'AuthController');
  }
}
