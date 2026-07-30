-- DropForeignKey
ALTER TABLE "ChangeLog" DROP CONSTRAINT "ChangeLog_taskId_fkey";

-- AddForeignKey
ALTER TABLE "ChangeLog" ADD CONSTRAINT "ChangeLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
