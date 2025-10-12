/*
  Warnings:

  - You are about to drop the column `agenda` on the `MeetingDetails` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `MeetingDetails` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `MeetingDetails` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `MeetingDetails` table. All the data in the column will be lost.
  - You are about to drop the column `meetingDate` on the `MeetingDetails` table. All the data in the column will be lost.
  - You are about to drop the column `meetingTime` on the `MeetingDetails` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `MeetingDetails` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `MeetingDetails` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `MeetingDetails` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `MeetingDetails` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `MeetingDetails` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `MeetingDetails` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `MeetingDetails` table. All the data in the column will be lost.
  - Added the required column `date` to the `MeetingDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `MeetingDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MeetingDetails" DROP COLUMN "agenda",
DROP COLUMN "company",
DROP COLUMN "duration",
DROP COLUMN "location",
DROP COLUMN "meetingDate",
DROP COLUMN "meetingTime",
DROP COLUMN "name",
DROP COLUMN "notes",
DROP COLUMN "phone",
DROP COLUMN "position",
DROP COLUMN "requirements",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "problem" TEXT,
ADD COLUMN     "time" TEXT NOT NULL,
ADD COLUMN     "whatsappNumber" TEXT;
