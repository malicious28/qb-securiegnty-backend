-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "appointmentDate" TIMESTAMP(3),
ADD COLUMN     "appointmentType" TEXT DEFAULT 'general',
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
