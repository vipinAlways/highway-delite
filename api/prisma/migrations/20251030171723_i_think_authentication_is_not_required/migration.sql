/*
  Warnings:

  - You are about to drop the column `userId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userMail` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_userId_fkey";

-- DropIndex
DROP INDEX "public"."Booking_userId_idx";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "userId",
ADD COLUMN     "userMail" TEXT NOT NULL,
ADD COLUMN     "userName" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."User";
