-- CreateTable
CREATE TABLE "MeetingDetails" (
    "id" SERIAL NOT NULL,
    "appointmentId" INTEGER,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "position" TEXT,
    "meetingDate" TIMESTAMP(3),
    "meetingTime" TEXT,
    "duration" TEXT DEFAULT '30 minutes',
    "location" TEXT DEFAULT 'virtual',
    "agenda" TEXT,
    "requirements" TEXT,
    "notes" TEXT,
    "status" TEXT DEFAULT 'pending',
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MeetingDetails_appointmentId_key" ON "MeetingDetails"("appointmentId");

-- AddForeignKey
ALTER TABLE "MeetingDetails" ADD CONSTRAINT "MeetingDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingDetails" ADD CONSTRAINT "MeetingDetails_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
