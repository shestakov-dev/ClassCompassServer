/*
  Warnings:

  - You are about to drop the column `lessonNumber` on the `Lesson` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Lesson_lessonNumber_lessonWeek_dailyScheduleId_key";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "lessonNumber";
