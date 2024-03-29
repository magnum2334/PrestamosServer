import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // Importa ConfigService si estás utilizando la configuración de variables de entorno

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // Inyecta ConfigService
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'), // Obtén la clave secreta de JWT desde tu configuración
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username }; // Puedes devolver cualquier información necesaria del token JWT
  }
}
