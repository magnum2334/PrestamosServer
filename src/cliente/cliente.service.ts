import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ClienteService {
  constructor(private prisma: PrismaService) {}
  async create(cliente) {
    if (cliente.id) {
      const existingCliente = await this.prisma.cliente.findUnique({
        where: { id: cliente.id },
      });
      
      if (existingCliente) {
        return existingCliente;
      }
    }

    return this.prisma.cliente.create({
      data: cliente,
    });
  }

  findAll() {
    return `This action returns all cliente`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cliente`;
  }

  remove(id: number) {
    return `This action removes a #${id} cliente`;
  }
}
