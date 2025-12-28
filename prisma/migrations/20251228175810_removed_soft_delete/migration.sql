/*
  Warnings:

  - You are about to drop the column `deleted` on the `Building` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Building` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `DailySchedule` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `DailySchedule` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Floor` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Floor` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Building" DROP COLUMN "deleted",
DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "deleted",
DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "DailySchedule" DROP COLUMN "deleted",
DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Floor" DROP COLUMN "deleted",
DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "deleted",
DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "deleted",
DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "School" DROP COLUMN "deleted",
DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "deleted",
DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "deleted",
DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "deleted",
DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deleted",
DROP COLUMN "deletedAt";
