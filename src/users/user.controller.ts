import {
  Controller,
  Get,
  Post,
  Body,ConflictException, 
  HttpException
} from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoggerService } from 'log/logger.service';
import { PrismaService } from 'prisma/prisma.service';


@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: LoggerService,
    private prisma: PrismaService
  ) {}

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      // Verificar si el correo electrónico ya existe
       const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Crear un nuevo objeto de usuario con la contraseña encriptada
      const newUser = {
        ...createUserDto,
        password: hashedPassword,
      };
      // Crear el usuario en la base de datos
      const user = await this.userService.createUser(newUser);

      return user;

    } catch (error) {
      console.log(error)
      // Si es una excepción ConflictException, se lanzará de nuevo
      if (error instanceof ConflictException) {
        throw error;
      }
      // Si es cualquier otro tipo de excepción, la lanzamos como un HttpException genérico
      throw new HttpException('Error al crear el usuario', 500);
    }
  }

  @Get('/')
  findAll() {
    return [];
  }
}
