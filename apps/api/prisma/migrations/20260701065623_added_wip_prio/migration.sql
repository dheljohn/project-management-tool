-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('Critical', 'High', 'Medium', 'Low');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'Medium';
