import { Injectable } from '@nestjs/common';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class RutaService {
  constructor(private prisma: PrismaService) {}

  create(ruta) {
    return this.prisma.ruta.create({
      data: ruta,
    });
  }

  findAll() {
    return this.prisma.ruta.findMany(); // Cambiado para retornar todas las rutas
  }

  findOne(id: number) {
    return this.prisma.ruta.findUnique({
      where: { id },
    });
  }

  update(id: number, updateRutaDto: UpdateRutaDto) {
    return this.prisma.ruta.update({
      where: { id },
      data: updateRutaDto,
    });
  }

  remove(id: number) {
    return this.prisma.ruta.delete({
      where: { id },
    });
  }

  // Nuevo método para buscar rutas por cobradorId
  findByCobradorId(cobradorId: number) {
    return this.prisma.ruta.findMany({
      where: { cobradorId }, // Suponiendo que el modelo tiene este campo
    });
  }
}
