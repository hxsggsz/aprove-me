-- CreateEnum
CREATE TYPE "BatchPayableStatus" AS ENUM ('PROCESSING', 'COMPLETED');

-- AlterTable
ALTER TABLE "payables" ADD COLUMN     "batchId" TEXT;

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalJobs" INTEGER NOT NULL,
    "completedJobs" INTEGER NOT NULL DEFAULT 0,
    "successJobs" INTEGER NOT NULL DEFAULT 0,
    "failedJobs" INTEGER NOT NULL DEFAULT 0,
    "status" "BatchPayableStatus" NOT NULL DEFAULT 'PROCESSING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
