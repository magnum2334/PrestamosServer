import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PagoService {
  constructor(private prisma: PrismaService) { }

  async findPrestamosPayment(data) {
    const { abono, usuarioId, prestamoId } = data;
    if (abono <= 0) {
      throw new Error("El abono debe ser mayor que 0");
    }

    // Obtener el préstamo 
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

    const updatedPrestamo = await this.prisma.$transaction(async (prisma) => {
      let abonoRestante = abono;

      for (const pago of pagosOrdenados) {
        if (abonoRestante <= 0) break; // Si ya se ha usado todo el abono, salir del bucle

        const saldoCuota = pago.monto - (pago.abono || 0); // Cuánto falta por pagar en esta cuota

        if (saldoCuota > 0) {
          let abonoUsado = 0;

          if (abonoRestante >= saldoCuota) {
            // Si el abono cubre el saldo restante de esta cuota, abonar todo el saldo restante
            await prisma.pago.update({
              where: { id: pago.id },
              data: {
                abono: pago.monto, // No puede exceder el monto de la cuota
              },
            });
            abonoUsado = saldoCuota;
            abonoRestante -= saldoCuota; // Restar el abono usado para esta cuota
          } else {
            // Si el abono es menor que el saldo restante de la cuota, abonar lo disponible
            await prisma.pago.update({
              where: { id: pago.id },
              data: {
                abono: (pago.abono || 0) + abonoRestante, // Abonar solo lo que quede
              },
            });
            abonoUsado = abonoRestante;
            abonoRestante = 0; // Todo el abono se ha usado
          }

          // Registrar el abono en LogAbono
          await prisma.logAbono.create({
            data: {
              prestamoId: prestamoId,
              pagoId: pago.id,
              monto: abonoUsado,
              fecha: new Date(),
              descripcion: `Abono a la cuota ${pago.numeroCuota}`,
              usuarioId: usuarioId,
              fecha_creacion: new Date(),
            },
          });
        }
      }

      // Verificar si todas las cuotas ya han sido pagadas completamente
      const todasCuotasPagadas = (await prisma.pago.findMany({
        where: { prestamoId: prestamoId },
      })).every((pago) => (pago.abono || 0) >= pago.monto);

      // Verificar si todas las cuotas en mora han sido pagadas
      const todasCuotasMoraPagadas = (await prisma.pago.findMany({
        where: { prestamoId: prestamoId },
      }))
        .filter((pago) => pago.diasMora > 0) // Filtrar cuotas con mora
        .every((pago) => (pago.abono || 0) >= pago.monto); // Solo cuotas en mora deben estar pagadas

      // Determinar el nuevo estado del préstamo
      let nuevoEstadoId = prestamo.estadoId;

      if (todasCuotasPagadas) {
        // Si todas las cuotas están pagadas, el préstamo está finalizado
        nuevoEstadoId = 3;
      } else if (!todasCuotasMoraPagadas) {
        // Si hay cuotas en mora que no están pagadas, el préstamo está en mora
        nuevoEstadoId = 2;
      } else {
        // Si no hay mora y aún hay cuotas por pagar, el préstamo sigue activo
        nuevoEstadoId = 1;
      }

      // Calcular el nuevo saldo del préstamo
      const nuevoSaldo = prestamo.saldo + abono > prestamo.valorTotal ? prestamo.valorTotal : prestamo.saldo + abono;

      // Actualizar el saldo del préstamo, estado, y fecha de finalización si el préstamo está pagado
      const prestamoActualizado = await prisma.prestamo.update({
        where: { id: prestamoId },
        data: {
          saldo: nuevoSaldo,
          estadoId: nuevoEstadoId, // Actualizar el estado basado en las condiciones
          fecha_finalizacion: nuevoEstadoId === 3 ? new Date() : null, // Actualizar la fecha si el préstamo está finalizado
        },
        include: { pagos: true }, // Incluir nuevamente los pagos actualizados
      });

      return prestamoActualizado;
    });

    // Retornar el préstamo actualizado con los pagos modificados
    return updatedPrestamo;
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
          rutaId,
        },
        include: {
          pagos: {
            orderBy: {
              numeroCuota: 'asc'
            }
          },
          estado: true,
          Cliente: true 
        },
        orderBy: {
          fecha_creacion: 'desc',
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
          pagos: prestamo.pagos
        };
      }).filter(prestamo => prestamo.valorTotal > prestamo.saldo);

    } catch (error) {
      console.error('Error al obtener préstamos por ruta:', error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all pagos`;
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

        // Obtener los pagos relacionados al préstamo actual
        const pagos = await this.prisma.pago.findMany({
          where: { prestamoId: prestamo.id }, // Filtra los pagos por prestamo_id
        });

        // Actualizar días de mora
        pagos.forEach((pago) => {
          const [dia, mes, anio] = pago.fecha.split('-');
          const fechaPago = new Date(`${anio}-${mes}-${dia}`);

          // Sumar un día a fechaPago
          fechaPago.setDate(fechaPago.getDate() + 1);

          // Verificar si el pago no ha sido saldado y si la fecha de pago es anterior a la fecha actual
          if (!isNaN(fechaPago.getTime()) && fechaPago < fechaActual && pago.abono < pago.monto) {
            // Calcular días de mora si el abono es menor que el monto
            pago.diasMora = Math.floor(
              (fechaActual.getTime() - fechaPago.getTime()) / (1000 * 60 * 60 * 24)
            );
            tieneDiasDeMora = true;
          }
        });

        // Verificar si todas las cuotas están pagadas completamente (del préstamo actual)
        const todasCuotasPagadas = pagos.every((pago) => {
          return pago.abono >= pago.monto;
        });

        // Verificar si todas las cuotas con mora están pagadas
        const todasCuotasMoraPagadas = pagos
          .filter((pago) => pago.diasMora > 0)
          .every((pago) => pago.abono >= pago.monto);

        // Determinar el nuevo estado del préstamo
        let nuevoEstadoId = 0;

        if (todasCuotasPagadas) {
          // Si todas las cuotas están pagadas, el préstamo está finalizado
          nuevoEstadoId = 3;
        } else if (!todasCuotasMoraPagadas) {
          // Si hay cuotas en mora que no están pagadas, el préstamo está en mora
          nuevoEstadoId = 2;
        } else {
          // Si no hay mora y aún hay cuotas por pagar, el préstamo sigue activo
          nuevoEstadoId = 1;
        }
        // Actualizar el estado del préstamo
        await this.prisma.prestamo.update({
          where: { id: prestamo.id }, // Solo si estadoId no es 3
          data: { estadoId: nuevoEstadoId },
        });

        // Actualizar días de mora en los pagos relacionados
        for (const pago of pagos) {
          await this.prisma.pago.update({
            where: { id: pago.id },
            data: { diasMora: pago.diasMora },
          });
        }
      }

    } catch (error) {
      console.error('Error al actualizar días de mora y estado de préstamos:', error);
      throw error;
    }
  }

  // Función para obtener el resumen de la cartera de un usuario específico
  async obtenerResumenCartera(fechaInicioParams: string, fechaFinParams: string, usuarioId) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaInicio = new Date(`${fechaInicioParams}T00:00:00Z`); // Usa la zona horaria UTC (Z)
    const fechaFin = new Date(`${fechaFinParams}T23:59:59Z`);  // Fin del día, 23:59:59

    // 1. Filtrar préstamos por rango de fechas y usuario
    const prestamosRango = await this.prisma.prestamo.findMany({
      where: {
        cobradorId: parseInt(usuarioId), // Filtrar por usuario
        fecha_creacion: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin),
        },
      },
      include: {
        pagos: true,
      },
    });

    // 2. Obtener abonos del día de hoy y calcular el total de los abonos (cierre de cartera) solo para ese usuario
    const abonosHoy = await this.prisma.logAbono.findMany({
      where: {
        usuarioId: parseInt(usuarioId), // Filtrar abonos por usuario
        fecha: {
          gte: hoy,
          lte: new Date(),
        },
      },
      orderBy: {
        fecha: 'desc',  // Ordenar por fecha en orden descendente
      },
      select: {
        monto: true,
        fecha: true,
        prestamo: {
          select: {
            ruta: {
              select: {
                nombre: true
              }
            },
            Cliente: {
              select: {
                nombre: true
              }
            }
          }
        }
      }
    });

    const cierreCartera = abonosHoy.reduce((total, abono) => total + abono.monto, 0);

    // 3. Obtener préstamos creados hoy por el usuario
    const prestamosHoy = await this.prisma.prestamo.findMany({
      where: {
        cobradorId: parseInt(usuarioId),
        fecha_creacion: {
          gte: hoy,
          lte: new Date(),
        },// Filtrar por usuario
      },
    });
    // 4. Contar préstamos activos para el usuario
    const contadorPrestamosActivos = await this.prisma.prestamo.count({
      where: {
        cobradorId: parseInt(usuarioId), // Filtrar por usuario
        estadoId: { in: [1, 2] }, // Estado activo (activo o mora)
      },
    });

    const prestamos = await this.prisma.prestamo.findMany({
      where: {
        cobradorId: parseInt(usuarioId), // Filtrar por usuario
        fecha_creacion: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin),
        },
        estadoId: { in: [3] }, // Estado activo (activo o mora)
      },
    });
    const gananciasTotal = prestamos.reduce((total, prestamo) => {
      return total + (prestamo.valorTotal - prestamo.valorPrestado);
    }, 0);

    
    const fechaHoy = hoy.toISOString().split('T')[0]; // Obtener solo la parte de la fecha (YYYY-MM-DD)

    let gastosHoy = await this.prisma.gasto.findMany({
      where: {
        usuarioId: parseInt(usuarioId) 
      },
      orderBy: {
        fecha: 'desc',
      },
      select: {
        id: true,
        valor: true,
        descripcion: true,
        fecha: true,
      },
    });
    console.log("gastos fecha", gastosHoy)
    gastosHoy = gastosHoy.filter(gasto => gasto.fecha.toISOString().split('T')[0] === fechaHoy);
    console.log("gastos filtro Hoy", gastosHoy)
    const totalGastosHoy = gastosHoy.reduce((total, gasto) => total + gasto.valor, 0);
    return {
      prestamosRango,
      abonosHoy,
      cierreCartera, // Total de abonos realizados hoy
      prestamosHoy, // Préstamos nuevos creados hoy
      contadorPrestamosActivos, // Número de préstamos activos
      gananciasTotal,
      gastosHoy,
      totalGastosHoy
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} pago`;
  }

  remove(id: number) {
    return `This action removes a #${id} pago`;
  }


}



