-- AlterTable
ALTER TABLE "User" ADD COLUMN     "country" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarlyAccess" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "occupation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EarlyAccess_pkey" PRIMARY KEY ("id")
);
