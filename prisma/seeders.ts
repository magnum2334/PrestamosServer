import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear Roles
  const roles = [{ descripcion: 'ADMINISTRADOR' }, { descripcion: 'COBRADOR' }];

  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { descripcion: rol.descripcion },
      update: {},
      create: rol,
    });
  }
  //, 
  const estadoSPrestamo = [{ data: {descripcion: 'ACTIVO'} }, { data: {descripcion: 'MORA'} },  { data: {descripcion: 'FINALIZADO'} }];

 
  for (const estadoPestamo of estadoSPrestamo) {
    await prisma.estadoPrestamo.create(estadoPestamo);
  }

  // Obtener los roles recién creados
  const adminRole = await prisma.rol.findUnique({
    where: { descripcion: 'ADMINISTRADOR' },
  });
  const cobradorRole = await prisma.rol.findUnique({
    where: { descripcion: 'COBRADOR' },
  });

  // Crear Usuarios
  const users = [
    {
      email: 'john.doe@example.com',
      password: 'securepassword123',
      nombre: 'John Doe',
      rolId: adminRole.id,
      estado: 'active',
      telefono: '123456789',
      fecha_creacion: new Date(),
      managerId: null,
    },
    {
      email: 'jane.smith@example.com',
      password: 'anothersecurepassword456',
      nombre: 'Jane Smith',
      rolId: cobradorRole.id,
      estado: 'inactive',
      telefono: '987654321',
      fecha_creacion: new Date(),
      managerId: 1,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  // Obtener el usuario cobrador
  const cobradorUser = await prisma.user.findUnique({
    where: { email: 'jane.smith@example.com' },
  });

  // Crear Capital y asociarlo al usuario con el rol 2 (cobrador)
  const capital = await prisma.capital.create({
    data: {
      fecha_creacion: new Date(),
      usuarioId: cobradorUser.id,
      descripcion: 'Capital inicial',
      valor: 1000000,
    },
  });
  

  // Crear Ruta y asociarla al capital y cobrador
  await prisma.ruta.create({
    data: {
      nombre: 'Ruta 1',
      cobradorId: cobradorUser.id,
      interes: 5,
      tMaximoPrestamo: 1000000,
      interesLibre: true,
      fecha_creacion: new Date(),
      capitalId: capital.id,
    },
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
