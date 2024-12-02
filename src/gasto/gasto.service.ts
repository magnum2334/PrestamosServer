import { Injectable } from '@nestjs/common';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class GastoService {

  constructor(private prisma: PrismaService) {}

  async create(gasto) {
    return await this.prisma.gasto.create({
      data: gasto,
    });
  }

  findAll() {
    return `This action returns all gasto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gasto`;
  }

  update(id: number, updateGastoDto: UpdateGastoDto) {
    return `This action updates a #${id} gasto`;
  }

  remove(id: number) {
    return `This action removes a #${id} gasto`;
  }
}
