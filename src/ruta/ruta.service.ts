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
    return `This action returns all ruta`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ruta`;
  }

  update(id: number, updateRutaDto: UpdateRutaDto) {
    return `This action updates a #${id} ruta`;
  }

  remove(id: number) {
    return `This action removes a #${id} ruta`;
  }
}
