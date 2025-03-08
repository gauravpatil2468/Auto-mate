/*
  Warnings:

  - Made the column `image` on table `AvailableAction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `image` on table `AvailableTrigger` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "AvailableAction" ALTER COLUMN "image" SET NOT NULL;

-- AlterTable
ALTER TABLE "AvailableTrigger" ALTER COLUMN "image" SET NOT NULL;

-- AlterTable
ALTER TABLE "Trigger" ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}';
