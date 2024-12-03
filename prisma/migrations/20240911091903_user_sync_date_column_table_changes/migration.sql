/*
  Warnings:

  - You are about to drop the column `syncDate` on the `sleephistory` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `user_date_index` ON `sleephistory`;

-- AlterTable
ALTER TABLE `sleephistory` DROP COLUMN `syncDate`,
    ADD COLUMN `sync_date` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `user_date_index` ON `SleepHistory`(`user_id`, `sync_date`);
