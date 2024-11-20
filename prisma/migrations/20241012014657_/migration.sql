-- CreateTable
CREATE TABLE "LogAbono" (
    "id" SERIAL NOT NULL,
    "prestamoId" INTEGER NOT NULL,
    "pagoId" INTEGER NOT NULL,
    "monto" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAbono_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LogAbono" ADD CONSTRAINT "LogAbono_prestamoId_fkey" FOREIGN KEY ("prestamoId") REFERENCES "Prestamo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAbono" ADD CONSTRAINT "LogAbono_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "Pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAbono" ADD CONSTRAINT "LogAbono_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
