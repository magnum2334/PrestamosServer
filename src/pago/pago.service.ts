import { Injectable } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PagoService {
  constructor(private prisma: PrismaService) {}
  async create(data) {
    try {
      const { prestamoId, numeroCuota, monto, abono, fecha } = data; // Agrega abono y fecha si son necesarios
  
      // Obtener el préstamo y sus pagos asociados
      const prestamo = await this.prisma.prestamo.findUnique({
        where: { id: prestamoId },
        include: { pagos: true },
      });
  
      if (!prestamo) {
        throw new Error('El préstamo especificado no existe');
      }
  
      // Crea el nuevo pago
      const nuevoPago = await this.prisma.pago.create({
        data: {
          prestamoId,
          numeroCuota,
          monto,
          abono, // Asegúrate de que abono sea parte del objeto data si es necesario
          fecha, // Asegúrate de que fecha sea parte del objeto data si es necesario
          diasMora: 0, // Puedes establecer esto a 0 o ajustarlo según la lógica que necesites
          fecha_creacion: new Date(), // La fecha de creación
        },
      });
      return nuevoPago;
    } catch (error) {
      console.error('Error al registrar pago:', error);
      throw error;
    }
  }


  findAll() {
    return `This action returns all pago`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pago`;
  }

  update(id: number, updatePagoDto: UpdatePagoDto) {
    return `This action updates a #${id} pago`;
  }

  remove(id: number) {
    return `This action removes a #${id} pago`;
  }
}
