/*
  Warnings:

  - Added the required column `username` to the `ChangeLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChangeLog" ADD COLUMN     "username" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ChangeLog" ADD CONSTRAINT "ChangeLog_username_fkey" FOREIGN KEY ("username") REFERENCES "Member"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
