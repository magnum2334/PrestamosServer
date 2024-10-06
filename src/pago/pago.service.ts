import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PagoService {
  constructor(private prisma: PrismaService) { }

  async findPrestamosPayment(prestamoId: number, abono: number) {
    // Validar inputs
    if (abono <= 0) {
      throw new Error("El abono debe ser mayor que 0");
    }
  
    // Obtener el préstamo con sus pagos desde la base de datos utilizando Prisma
    const prestamo = await this.prisma.prestamo.findUnique({
      where: { id: prestamoId },
      include: { pagos: true }, // Incluir los pagos del préstamo
    });
  
    if (!prestamo) {
      throw new Error(`Préstamo con ID ${prestamoId} no encontrado`);
    }
  
    // Validar que el abono no exceda el total del préstamo
    const totalPrestamo = prestamo.pagos.reduce((total, pago) => total + pago.monto, 0);
    if (abono > totalPrestamo) {
      throw new Error(`El abono no puede ser mayor que el total del préstamo (${totalPrestamo})`);
    }
  
    // Ordenar las cuotas por fecha (de la más antigua a la más reciente)
    const pagosOrdenados = prestamo.pagos.sort((a, b) => {
      // Convertir las fechas de 'DD-MM-YYYY' a 'YYYY-MM-DD' para que las ordene correctamente
      const fechaA = a.fecha.split('-').reverse().join('-'); // Convierte '26-10-2024' en '2024-10-26'
      const fechaB = b.fecha.split('-').reverse().join('-');
      
      return new Date(fechaA).getTime() - new Date(fechaB).getTime(); // Orden ascendente por fecha
    });
    
    console.log('pagosOrdenados', pagosOrdenados)
    // Usar una transacción para asegurar la atomicidad de las actualizaciones
    await this.prisma.$transaction(async (prisma) => {
      let abonoRestante = abono; // Variable para manejar el abono restante
  
      for (const pago of pagosOrdenados) {
        if (abonoRestante <= 0) break; // Si ya se ha usado todo el abono, salir del bucle
  
        const saldoCuota = pago.monto - pago.abono; // Cuánto falta por pagar en esta cuota
  
        if (saldoCuota > 0) {
          if (abonoRestante >= saldoCuota) {
            // Si el abono cubre el saldo restante de esta cuota, abonar todo el saldo restante
            await prisma.pago.update({
              where: { id: pago.id },
              data: {
                abono: pago.monto, // No puede exceder el monto de la cuota
              },
            });
            abonoRestante -= saldoCuota; // Restar el abono usado para esta cuota
          } else {
            // Si el abono es menor que el saldo restante de la cuota, abonar lo disponible
            await prisma.pago.update({
              where: { id: pago.id },
              data: {
                abono: pago.abono + abonoRestante, // Abonar solo lo que quede
              },
            });
            abonoRestante = 0; // Todo el abono se ha usado
          }
        }
      }
  
      // se verifica que las cuotas en mora ya fueron pagas para quitar la mora del prestamo
    const todasCuotasMoraPagadas = (await prisma.pago.findMany({
        where: { prestamoId: prestamoId },
    })).filter((pago) => pago.diasMora > 0) // Filtrar cuotas con días de mora
      .every((pago) => {
        // Cuota se considera pagada si su abono es >= que el monto
        return pago.abono >= pago.monto;
      });
    

      
      console.log('todasCuotasPagadasMora', todasCuotasMoraPagadas);
      // Actualizar el estado del préstamo si todas son igual o mayor las cuotas están pagadas
      await prisma.prestamo.update({
        where: { id: prestamoId },
        data: {
          saldo: prestamo.saldo + abono > prestamo.valorTotal ? prestamo.valorTotal : prestamo.saldo + abono,
          estadoId: todasCuotasMoraPagadas ? 1 : prestamo.estadoId, // Si todas las cuotas están pagadas, estado = 1
        },
      });
    });
  
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
              fecha: 'asc', // Ordena los pagos por la fecha (en formato string 'YYYY-MM-DD') de manera ascendente
            }
          },
          estado: true,
          Cliente: true // Incluye también los pagos relacionados si es necesario
        },


      });

      if (!prestamos || prestamos.length === 0) {
        throw new Error(`No se encontraron préstamos para la ruta con ID ${rutaId}`);
      }
      this.actualizarDiasDeMoraYEstadoPrestamos()
      var prestamosAcitvos = prestamos.filter(prestamo => {
        const totalPagos = prestamo.pagos.reduce((acc, pago) => acc + pago.abono, 0); // Sumar el abono
        return totalPagos < prestamo.valorTotal; // Conservar préstamos que no están completos
      });
      return prestamosAcitvos.map(prestamo => {
        let prestamoData = {
          ...prestamo,
          'estado': prestamo['estado']['descripcion']
        };
        return {
          ...prestamoData,
          pagos: prestamo.pagos.filter(pago => pago.monto !== pago.abono)
        };
      }).filter(prestamo => prestamo.pagos.length > 0);

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
  async actualizarDiasDeMoraYEstadoPrestamos() {
    try {
      const rutasActivas = await this.prisma.ruta.findMany({
        where: { cobrador: { estado: 'activo' } },
      });
  
      if (!rutasActivas.length) throw new Error('No hay rutas activas para procesar.');
  
      const prestamos = await this.prisma.prestamo.findMany({
        where: { rutaId: { in: rutasActivas.map(ruta => ruta.id) } },
        include: { pagos: true },
      });
  
      if (!prestamos.length) throw new Error('No se encontraron préstamos para las rutas activas.');
  
      const fechaActual = new Date();
  
      for (const prestamo of prestamos) {
        let tieneDiasDeMora = false;
  
        // Actualizar días de mora
        prestamo.pagos.forEach((pago) => {
          const [dia, mes, anio] = pago.fecha.split('-');
          const fechaPago = new Date(`${anio}-${mes}-${dia}`);
  
          if (!isNaN(fechaPago.getTime()) && fechaPago < fechaActual) {
            pago.diasMora = Math.floor((fechaActual.getTime() - fechaPago.getTime()) / (1000 * 60 * 60 * 24));
            tieneDiasDeMora = true;
          }
        });
  
        // Verificar si todas las cuotas con mora están pagadas
        const todasCuotasMoraPagadas = prestamo.pagos
          .filter(pago => pago.diasMora > 0)
          .every(pago => pago.abono >= pago.monto);
  
        // Actualizar estado del préstamo
        const nuevoEstado = (tieneDiasDeMora && !todasCuotasMoraPagadas) ? 2 : 1;
        await this.prisma.prestamo.update({ where: { id: prestamo.id }, data: { estadoId: nuevoEstado } });
  
        // Actualizar días de mora en los pagos
        for (const pago of prestamo.pagos) {
          await this.prisma.pago.update({ where: { id: pago.id }, data: { diasMora: pago.diasMora } });
        }
      }
  
    } catch (error) {
      console.error('Error al actualizar días de mora y estado de préstamos:', error);
      throw error;
    }
  }

}


