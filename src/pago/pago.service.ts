import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PagoService {
  constructor(private prisma: PrismaService) { }

  async findPrestamosPayment(prestamoId: number, abono: number) {
    // Obtener el préstamo con sus pagos desde la base de datos utilizando Prisma
    const prestamo = await this.prisma.prestamo.findUnique({
      where: { id: prestamoId },
      include: { pagos: true }, // Incluir los pagos del préstamo
    });

    if (!prestamo) {
      throw new Error(`Préstamo con ID ${prestamoId} no encontrado`);
    }

    // Ordenar las cuotas por fecha (de la más antigua a la más reciente)
    const pagosOrdenados = prestamo.pagos.sort((a, b) => {
      return new Date(a.fecha).getTime() - new Date(b.fecha).getTime(); // Orden ascendente por fecha
    });

    // Distribuir el abono entre las cuotas
    for (const pago of pagosOrdenados) {
      if (abono <= 0) break; // Si ya se ha usado todo el abono, salir del bucle

      const saldoCuota = pago.monto - pago.abono; // Cuánto falta por pagar en esta cuota

      if (saldoCuota > 0) {
        if (abono >= saldoCuota) {
          // Si el abono cubre el saldo restante de esta cuota, abonar todo el saldo restante
          await this.prisma.pago.update({
            where: { id: pago.id },
            data: {
              abono: pago.monto, // No puede exceder el monto de la cuota
            },
          });
          abono -= saldoCuota; // Restar el abono usado para esta cuota
        } else {
          // Si el abono es menor que el saldo restante de la cuota, abonar lo disponible
          await this.prisma.pago.update({
            where: { id: pago.id },
            data: {
              abono: pago.abono + abono, // Abonar solo lo que quede
            },
          });
          abono = 0; // Todo el abono se ha usado
        }
      }
    }

    // Retornar el préstamo actualizado con los pagos modificados
    return await this.prisma.prestamo.findUnique({
      where: { id: prestamoId },
      include: { pagos: true }, // Incluir nuevamente los pagos actualizados
    });
  }


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
          abono,
          fecha,
          diasMora: 0,
          fecha_creacion: new Date(),
        },
      });
      return nuevoPago;
    } catch (error) {
      console.error('Error al registrar pago:', error);
      throw error;
    }
  }

  // Nuevo método para obtener préstamos de una ruta específica
  async findPrestamosByRuta(rutaId: number) {
    try {
      const prestamos = await this.prisma.prestamo.findMany({
        where: {
          rutaId, // Asumiendo que el modelo 'prestamo' tiene un campo 'rutaId' que referencia la ruta
        },
        include: {
          pagos: {
            orderBy: {
              fecha: 'desc', // Ordena los pagos por la fecha (en formato string 'YYYY-MM-DD') de manera ascendente
            }
          },
          Cliente: true // Incluye también los pagos relacionados si es necesario
        },


      });

      if (!prestamos || prestamos.length === 0) {
        throw new Error(`No se encontraron préstamos para la ruta con ID ${rutaId}`);
      }

      return prestamos.filter(prestamo => {
        const totalPagos = prestamo.pagos.reduce((acc, pago) => acc + pago.abono, 0); // Sumar el abono
        return totalPagos < prestamo.valorTotal; // Conservar préstamos que no están completos
      });
    } catch (error) {
      console.error('Error al obtener préstamos por ruta:', error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all pagos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pago`;
  }

  remove(id: number) {
    return `This action removes a #${id} pago`;
  }
}
