import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoggerService } from 'log/logger.service';


@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  @Post('create')
  async createUser(
    @Body() createUserDto: CreateUserDto, // Usar el DTO como parámetro
  ) {
    var newUser;
    try {
      // Generar un hash seguro de la contraseña
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      // Crear un nuevo objeto de usuario con la contraseña encriptada
      newUser = {
        ...createUserDto,
        password: hashedPassword,
      };
    } catch (error) {
      console.log("hola")
       this.logger.error(
         `Login user error: ${createUserDto.email}`,
         'AuthController : error',
         `Login user error: ${error}`,
       );
    }
    return this.userService.createUser(newUser);
  }

  @Get('/')
  findAll() {
    return [];
  }
}
