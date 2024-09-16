import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PrestamoService {
  constructor(private prisma: PrismaService) {}
  async create(createPrestamoDto: CreatePrestamoDto) {
    const { valorPrestado, rutaId } = createPrestamoDto;
    const prismaClient = this.prisma; // Asigna el cliente Prisma a una variable local

    try {
      // Obtener la suma de los préstamos existentes para la ruta especificada
      const totalPrestamos = await prismaClient.prestamo.aggregate({
        where: {
          rutaId,
          estadoId: 1, // Validar solo préstamos actuales
        },
        _sum: {
          valorPrestado: true,
        },
      });

      // Obtener el capital disponible para la ruta especificada
      const ruta = await prismaClient.ruta.findUnique({
        where: { id: rutaId },
        include: { capital: true },
      });

      // Validar si la ruta especificada existe
      if (!ruta) {
        throw new Error('La ruta especificada no existe');
      }

      // Extraer el total de valor prestado y el capital disponible
      const totalValorPrestado = totalPrestamos._sum.valorPrestado || 0;
      const capitalDisponible = ruta.capital.valor;

      // Extraer el total de valor prestado y el capital disponible
      if (totalValorPrestado + valorPrestado > capitalDisponible) {
        throw new Error(
          'El total de préstamos excede el capital disponible de la ruta',
        );
      }

      // Crear el préstamo si la validación es exitosa
      const nuevoPrestamo = await prismaClient.prestamo.create({
        data: createPrestamoDto,
      });

      return nuevoPrestamo;
    } catch (error) {
      // Manejo de errores específicos de negocio
      if (
        error.message ===
        'El total de préstamos excede el capital disponible de la ruta'
      ) {
        throw new Error(error.message); // Devolver el mensaje específico de negocio
      } else {
        throw new Error('Error desconocido: ' + error.message); // Manejo genérico de otros errores
      }
    }
  }

  findAll() {
    return `This action returns all prestamo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} prestamo`;
  }

  update(id: number, updatePrestamoDto: UpdatePrestamoDto) {
    return `This action updates a #${id} prestamo`;
  }

  remove(id: number) {
    return `This action removes a #${id} prestamo`;
  }
}
