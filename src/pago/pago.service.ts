import { Injectable } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PagoService {
  constructor(private prisma: PrismaService) {}
  async create(data) {
    try {
    let  {prestamoId, numeroCuota, monto } = data
      // Obtener el préstamo y sus pagos asociados
      const prestamo = await this.prisma.prestamo.findUnique({
        where: { id: prestamoId },
        include: { pagos: true },
      });

      if (!prestamo) {
        throw new Error('El préstamo especificado no existe');
      }
      // Calcular el monto a abonar (puede ser el monto completo del pago o un abono parcial)
      const montoAbonar = monto;
      // Obtener la cuota específica (podrías manejar esto según tu lógica de pagos)
      const cuota = prestamo.pagos.find(
        (pago) => pago.numeroCuota === numeroCuota,
      );

      // Actualizar el saldo del préstamo restando el monto abonado
      const saldoActualizado = prestamo.saldo - montoAbonar;

      // Actualizar el registro del préstamo en la base de datos
      await this.prisma.prestamo.update({
        where: { id: prestamoId },
        data: { saldo: saldoActualizado },
      });

      // Verificar y actualizar estado del préstamo si está completamente pagado
      if (saldoActualizado <= 0) {
        await this.prisma.prestamo.update({
          where: { id: prestamoId },
          data: { estadoId: 2 }, // Cambiar estado a pagado total
        });

        console.log('¡El préstamo ha sido pagado completamente!');
      }

      // Registrar el pago en la base de datos
      // const nuevoPago = await this.prisma.pago.create({
      //     prestamoId,
      //     numeroCuota,
      //     monto: montoAbonar,
      //     fecha_creacion: new Date(),
      // });

      // console.log('Pago registrado:', nuevoPago);

      return true;
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
