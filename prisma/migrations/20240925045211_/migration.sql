-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT,
    "rolId" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "telefono" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "managerId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "identificacion" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "rutaId" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prestamo" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "valorPrestado" INTEGER NOT NULL,
    "valorTotal" INTEGER NOT NULL,
    "saldo" INTEGER NOT NULL,
    "cuotas" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "cobradorId" INTEGER NOT NULL,
    "estadoId" INTEGER NOT NULL,
    "rutaId" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prestamo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" SERIAL NOT NULL,
    "monto" INTEGER NOT NULL,
    "abono" INTEGER,
    "interes" INTEGER NOT NULL,
    "prestamoId" INTEGER NOT NULL,
    "numeroCuota" INTEGER NOT NULL,
    "diasMora" INTEGER NOT NULL DEFAULT 0,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstadoPrestamo" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "EstadoPrestamo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ruta" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cobradorId" INTEGER NOT NULL,
    "interes" INTEGER NOT NULL,
    "tMaximoPrestamo" INTEGER NOT NULL,
    "interesLibre" BOOLEAN NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL,
    "capitalId" INTEGER NOT NULL,

    CONSTRAINT "Ruta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capital" (
    "id" SERIAL NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,

    CONSTRAINT "Capital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_descripcion_key" ON "Rol"("descripcion");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Ruta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_cobradorId_fkey" FOREIGN KEY ("cobradorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "EstadoPrestamo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_prestamoId_fkey" FOREIGN KEY ("prestamoId") REFERENCES "Prestamo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruta" ADD CONSTRAINT "Ruta_cobradorId_fkey" FOREIGN KEY ("cobradorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruta" ADD CONSTRAINT "Ruta_capitalId_fkey" FOREIGN KEY ("capitalId") REFERENCES "Capital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Capital" ADD CONSTRAINT "Capital_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
