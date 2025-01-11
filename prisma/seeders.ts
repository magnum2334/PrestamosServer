import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (transaction) => {
    // Crear Roles
    const roles = [{ descripcion: 'ADMINISTRADOR' }, { descripcion: 'COBRADOR' }];

    for (const rol of roles) {
      await transaction.rol.upsert({
        where: { descripcion: rol.descripcion },
        update: {},
        create: rol,
      });
    }

    const adminRole = await transaction.rol.findUnique({ where: { descripcion: 'ADMINISTRADOR' } });
    const cobradorRole = await transaction.rol.findUnique({ where: { descripcion: 'COBRADOR' } });

    if (!adminRole || !cobradorRole) {
      throw new Error('No se encontraron los roles necesarios.');
    }
    const estadoSPrestamo = [{ data: {descripcion: 'ACTIVO'} }, { data: {descripcion: 'MORA'} },  { data: {descripcion: 'FINALIZADO'} }];

 
    for (const estadoPestamo of estadoSPrestamo) {
      await prisma.estadoPrestamo.create(estadoPestamo);
    }
  
    // Crear Manager
    const manager = await transaction.user.create({
      data: {
        email: 'manager@gmail.com',
        password: await bcrypt.hash('error404@', 10),
        nombre: 'logos',
        rolId: adminRole.id,
        estado: 'active',
        telefono: '111111111',
        fecha_creacion: new Date(),
      },
    });

    // Crear Usuarios
    const users = [
      {
        email: 'cobrador@gmail.com',
        password: await bcrypt.hash('error404@', 10),
        nombre: 'cobrador user',
        rolId: cobradorRole.id,
        estado: 'active',
        telefono: '123456789',
        fecha_creacion: new Date(),
        managerId: manager.id,
      },
    ];

    for (const user of users) {
      await transaction.user.upsert({
        where: { email: user.email },
        update: {},
        create: user,
      });
    }

    const cobradorUser = await transaction.user.findUnique({
      where: { email: 'cobrador@gmail.com' },
    });

    if (!cobradorUser) {
      throw new Error('El usuario cobrador no se pudo encontrar.');
    }

    // Crear Capital
    const capital = await transaction.capital.create({
      data: {
        fecha_creacion: new Date(),
        usuarioId: cobradorUser.id,
        descripcion: 'Capital inicial',
        valor: 1000000,
      },
    });

    // Crear Ruta
    await transaction.ruta.create({
      data: {
        nombre: 'DOSQUEBRADAS',
        cobradorId: cobradorUser.id,
        interes: 5,
        tMaximoPrestamo: 1000000,
        interesLibre: true,
        fecha_creacion: new Date(),
        capitalId: capital.id,
      },
    });
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
